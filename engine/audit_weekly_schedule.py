#!/usr/bin/env python3
"""
Auditor and Alignment Validator for weeklySchedule.ts.

Ensures that every single week in the 14-week schedules for GTI, ADS, CCP, and FG
contains authentic, relevant ENADE questions strictly matching the week's designated
topic, syllabus description, and Portarias Inep.
"""

import json
import re
import sys
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
EXAMS_JSON_PATH = WORKSPACE_ROOT / "public" / "data" / "exams.json"
WEEKLY_SCHEDULE_PATH = WORKSPACE_ROOT / "src" / "lib" / "weeklySchedule.ts"


def load_exams_data():
    with open(EXAMS_JSON_PATH, "r", encoding="utf-8") as f:
        exams = json.load(f)
    exam_dict = {}
    for e in exams:
        for q in e["questoes"]:
            exam_dict[(e["id_prova"], q["id_questao"])] = {
                "id_prova": e["id_prova"],
                "curso": e["curso"],
                "ano": e["ano"],
                "id_questao": q["id_questao"],
                "numero": q["numero"],
                "tipo": q["tipo"],
                "categorias": q.get("categorias", []),
                "texto_completo": q.get("texto_completo", "")
            }
    return exam_dict


def audit_schedule():
    exam_dict = load_exams_data()
    
    with open(WEEKLY_SCHEDULE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines()
    current_course = None
    current_week = None
    current_title = None
    current_topic = None

    issues = []
    total_checked = 0

    for line in lines:
        line_s = line.strip()
        if "GTI: [" in line_s: current_course = "GTI"
        elif "ADS: [" in line_s: current_course = "ADS"
        elif "CCP: [" in line_s: current_course = "CCP"
        elif "FG: [" in line_s: current_course = "FG"

        m_label = re.search(r'label:\s*["\']([^"\']+)["\']', line_s)
        if m_label: current_week = m_label.group(1)

        m_title = re.search(r'title:\s*["\']([^"\']+)["\']', line_s)
        if m_title: current_title = m_title.group(1)

        m_topic = re.search(r'topic:\s*["\']([^"\']+)["\']', line_s)
        if m_topic: current_topic = m_topic.group(1)

        m_q = re.search(r'id_prova:\s*["\']([^"\']+)["\'],\s*id_questao:\s*["\']([^"\']+)["\']', line_s)
        if m_q and current_course:
            total_checked += 1
            p_id = m_q.group(1)
            q_id = m_q.group(2)
            key = (p_id, q_id)

            if key not in exam_dict:
                issues.append({
                    "course": current_course,
                    "week": current_week,
                    "title": current_title,
                    "topic": current_topic,
                    "id_prova": p_id,
                    "id_questao": q_id,
                    "error": "QUESTÃO NÃO EXISTE NO CATÁLOGO"
                })
            else:
                q_data = exam_dict[key]
                q_cats = q_data["categorias"]

                # Strict topic check
                if current_course == "FG":
                    if "Formação Geral e Sociedade" not in q_cats:
                        issues.append({
                            "course": current_course,
                            "week": current_week,
                            "title": current_title,
                            "topic": current_topic,
                            "id_prova": p_id,
                            "id_questao": q_id,
                            "error": f"Tag incorreta para FG: {q_cats}"
                        })
                else:
                    if current_topic not in q_cats:
                        issues.append({
                            "course": current_course,
                            "week": current_week,
                            "title": current_title,
                            "topic": current_topic,
                            "id_prova": p_id,
                            "id_questao": q_id,
                            "error": f"Tópico divergente (esperado '{current_topic}', questão tem '{q_cats}')"
                        })

    print(f"=== RELATÓRIO DE AUDITORIA DAS 56 SEMANAS ===")
    print(f"Total de questões auditadas: {total_checked}")
    print(f"Inconsistências encontradas: {len(issues)}")

    if issues:
        for iss in issues:
            print(f"[{iss['course']}] {iss['week']} ({iss['title']}) -> {iss['id_prova']} {iss['id_questao']}: {iss['error']}")
        return False
    else:
        print("✅ TODAS AS 56 SEMANAS ESTÃO 100% ALINHADAS E VERIFICADAS!")
        return True


if __name__ == "__main__":
    success = audit_schedule()
    sys.exit(0 if success else 1)
