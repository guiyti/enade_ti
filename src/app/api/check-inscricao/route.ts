import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import inscricoesData from "@/data/inscricoes_hashes.json";

// In-memory rate limiter para prevenir abuso e brute-force
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

// Mapeamento em memória construído uma única vez: hash -> { curso, sigla, campus }
interface StudentInfo {
  curso: string;
  sigla: string;
  campus: string;
}

const hashIndex = new Map<string, StudentInfo>();

function getCourseName(sigla: string): string {
  switch (sigla.toUpperCase()) {
    case "ADS":
      return "Análise e Desenvolvimento de Sistemas";
    case "GTI":
      return "Gestão da Tecnologia da Informação";
    case "CCP":
      return "Ciência da Computação";
    default:
      return "Tecnologia da Informação";
  }
}

// Inicializa o índice a partir do formato compacto agrupado
const grupos = (inscricoesData.grupos || {}) as Record<string, string[]>;
for (const [groupKey, hashes] of Object.entries(grupos)) {
  const [sigla = "TI", campus = "Cruzeiro do Sul"] = groupKey.split(":");
  const curso = getCourseName(sigla);
  const info: StudentInfo = { curso, sigla, campus };
  for (const h of hashes) {
    hashIndex.set(h, info);
  }
}

// Validação dos 2 dígitos verificadores do CPF (Algoritmo Módulo 11)
function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += parseInt(cpf[i]) * (10 - i);
  }
  let remainder1 = (sum1 * 10) % 11;
  if (remainder1 === 10 || remainder1 === 11) remainder1 = 0;
  if (remainder1 !== parseInt(cpf[9])) return false;

  let sum2 = 0;
  for (let i = 0; i < 10; i++) {
    sum2 += parseInt(cpf[i]) * (11 - i);
  }
  let remainder2 = (sum2 * 10) % 11;
  if (remainder2 === 10 || remainder2 === 11) remainder2 = 0;
  if (remainder2 !== parseInt(cpf[10])) return false;

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = 
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
      request.headers.get("x-real-ip") || 
      "unknown-client";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "TOO_MANY_REQUESTS", 
          message: "Muitas consultas realizadas em pouco tempo. Por favor, aguarde um minuto e tente novamente." 
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.cpf !== "string") {
      return NextResponse.json(
        { success: false, error: "INVALID_BODY", message: "Informe um CPF válido." },
        { status: 400 }
      );
    }

    const cpfDigits = body.cpf.replace(/\D/g, "");

    if (cpfDigits.length !== 11) {
      return NextResponse.json(
        { 
          success: false, 
          error: "INVALID_LENGTH", 
          message: "O CPF deve conter exatamente 11 dígitos numéricos." 
        },
        { status: 400 }
      );
    }

    if (!isValidCPF(cpfDigits)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "INVALID_CPF", 
          message: "O número de CPF informado não é válido. Verifique se digitou os números corretamente." 
        },
        { status: 400 }
      );
    }

    const salt = process.env.ENADE_CPF_SALT || inscricoesData.salt || "ENADE_2026_CRUZEIRO_DO_SUL_TI_HASH_SALT";
    const hash = crypto
      .createHash("sha256")
      .update(`${cpfDigits}_${salt}`)
      .digest("hex");

    const record = hashIndex.get(hash);

    if (record) {
      return NextResponse.json({
        success: true,
        inscrito: true,
        data: {
          curso: record.curso,
          sigla: record.sigla,
          campus: record.campus,
        },
      });
    }

    return NextResponse.json({
      success: true,
      inscrito: false,
    });
  } catch (error) {
    console.error("Erro ao verificar inscrição ENADE:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "INTERNAL_ERROR", 
        message: "Ocorreu um erro interno ao processar a consulta. Tente novamente mais tarde." 
      },
      { status: 500 }
    );
  }
}
