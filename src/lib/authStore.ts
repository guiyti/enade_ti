"use client";

import { useState, useEffect, useCallback } from "react";

export const FLAG_AUTH_STORAGE_KEY = "enade_flag_auth_v1";
export const AUDITOR_AUTH_STORAGE_KEY = "enade_auditor_auth_v1";

const FLAG_AUTH_EVENT = "enade_flag_auth_updated";
const AUDITOR_AUTH_EVENT = "enade_auditor_auth_updated";

// Códigos padrão caso as variáveis de ambiente não estejam preenchidas
const DEFAULT_FLAG_CODE = "enade-docente";
const DEFAULT_ADMIN_CODE = "enade-admin";

export function getExpectedFlagCode(): string {
  const code = process.env.NEXT_PUBLIC_FLAG_ACCESS_CODE;
  return code && code.trim().length > 0 ? code.trim() : DEFAULT_FLAG_CODE;
}

export function getExpectedAdminCode(): string {
  const code = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE;
  return code && code.trim().length > 0 ? code.trim() : DEFAULT_ADMIN_CODE;
}

// ----------------------------------------------------
// 1. Autorização para Sinalizar Problemas (Docentes/Colaboradores)
// ----------------------------------------------------

export function isFlagAuthorized(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(FLAG_AUTH_STORAGE_KEY);
    return Boolean(raw && JSON.parse(raw)?.authorized);
  } catch {
    return false;
  }
}

export function verifyFlagCode(inputCode: string): boolean {
  if (!inputCode) return false;
  const expected = getExpectedFlagCode().trim().toLowerCase();
  const actual = inputCode.trim().toLowerCase();
  return actual === expected;
}

export function authorizeFlag(inputCode: string): { success: boolean; message?: string } {
  if (typeof window === "undefined") return { success: false };

  if (verifyFlagCode(inputCode)) {
    try {
      localStorage.setItem(
        FLAG_AUTH_STORAGE_KEY,
        JSON.stringify({
          authorized: true,
          authorizedAt: new Date().toISOString(),
        })
      );
      window.dispatchEvent(new Event(FLAG_AUTH_EVENT));
      return { success: true };
    } catch {
      return { success: false, message: "Erro ao salvar sessão local." };
    }
  }

  return { success: false, message: "Senha de sinalização incorreta." };
}

export function useFlagAuth() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const check = useCallback(() => {
    setIsAuthorized(isFlagAuthorized());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    check();
    window.addEventListener(FLAG_AUTH_EVENT, check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener(FLAG_AUTH_EVENT, check);
      window.removeEventListener("storage", check);
    };
  }, [check]);

  return {
    isAuthorized,
    isLoaded,
    authorize: (code: string) => authorizeFlag(code),
  };
}

// ----------------------------------------------------
// 2. Autorização para Ações de Auditoria (Limpar / Resolver)
// ----------------------------------------------------

export function isAuditorAuthorized(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(AUDITOR_AUTH_STORAGE_KEY);
    return Boolean(raw && JSON.parse(raw)?.authorized);
  } catch {
    return false;
  }
}

export function verifyAdminCode(inputCode: string): boolean {
  if (!inputCode) return false;
  const expected = getExpectedAdminCode().trim().toLowerCase();
  const actual = inputCode.trim().toLowerCase();
  return actual === expected;
}

export function authorizeAuditor(inputCode: string): { success: boolean; message?: string } {
  if (typeof window === "undefined") return { success: false };

  if (verifyAdminCode(inputCode)) {
    try {
      localStorage.setItem(
        AUDITOR_AUTH_STORAGE_KEY,
        JSON.stringify({
          authorized: true,
          authorizedAt: new Date().toISOString(),
        })
      );
      window.dispatchEvent(new Event(AUDITOR_AUTH_EVENT));
      return { success: true };
    } catch {
      return { success: false, message: "Erro ao salvar sessão local de auditor." };
    }
  }

  return { success: false, message: "Senha de auditor incorreta." };
}

export function revokeAuditorAuth(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUDITOR_AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event(AUDITOR_AUTH_EVENT));
  } catch {}
}

export function useAuditorAuth() {
  const [isAuditor, setIsAuditor] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const check = useCallback(() => {
    setIsAuditor(isAuditorAuthorized());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    check();
    window.addEventListener(AUDITOR_AUTH_EVENT, check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener(AUDITOR_AUTH_EVENT, check);
      window.removeEventListener("storage", check);
    };
  }, [check]);

  return {
    isAuditor,
    isLoaded,
    authorize: (code: string) => authorizeAuditor(code),
    revoke: () => revokeAuditorAuth(),
  };
}
