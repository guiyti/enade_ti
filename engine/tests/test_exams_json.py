"""
test_exams_json.py
Valida a integridade estrutural do catálogo mestre public/data/exams.json.

Este teste NÃO usa o fixture autouse=True de conftest (que usa tmp_path),
pois precisa ler os dados reais de produção. Portanto usa a config original.
"""
import json
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
EXAMS_JSON = REPO_ROOT / "public" / "data" / "exams.json"
QUESTOES_DIR = REPO_ROOT / "public" / "questoes"

REQUIRED_EXAM_FIELDS = {"id_prova", "ano", "curso", "questoes_extraidas", "questoes"}
REQUIRED_QUESTION_FIELDS = {"id_questao", "tipo", "numero", "confianca", "categorias"}
VALID_TIPOS = {"OBJETIVA", "DISCURSIVA"}
VALID_CURSOS = {"ADS", "CCP", "GTI"}


@pytest.fixture(scope="module", autouse=False)
def exams_data():
    if not EXAMS_JSON.exists():
        pytest.skip(f"exams.json não encontrado: {EXAMS_JSON}. Rode a engine primeiro.")
    with open(EXAMS_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


def test_exams_json_exists():
    """O arquivo exams.json deve existir em public/data/."""
    assert EXAMS_JSON.exists(), (
        f"exams.json ausente em {EXAMS_JSON}. Execute: cd engine && python run_processing.py"
    )


def test_exams_json_is_list(exams_data):
    """O catálogo deve ser uma lista de provas."""
    assert isinstance(exams_data, list), "exams.json deve ser um array JSON"
    assert len(exams_data) > 0, "exams.json está vazio"


def test_each_exam_has_required_fields(exams_data):
    """Cada prova deve ter todos os campos obrigatórios."""
    for exam in exams_data:
        missing = REQUIRED_EXAM_FIELDS - exam.keys()
        assert not missing, f"Prova {exam.get('id_prova', '?')} faltando campos: {missing}"


def test_id_prova_format(exams_data):
    """id_prova deve seguir o formato {ano}_{curso}."""
    for exam in exams_data:
        id_prova = exam["id_prova"]
        parts = id_prova.split("_")
        assert len(parts) == 2, f"id_prova inválido: {id_prova} (esperado: ANO_CURSO)"
        ano_str, curso = parts
        assert ano_str.isdigit() and 2000 <= int(ano_str) <= 2030, (
            f"Ano inválido em id_prova: {id_prova}"
        )
        assert curso in VALID_CURSOS, f"Curso inválido em id_prova: {id_prova} (cursos válidos: {VALID_CURSOS})"


def test_each_exam_has_questions(exams_data):
    """Cada prova deve ter ao menos 1 questão extraída."""
    for exam in exams_data:
        assert len(exam["questoes"]) > 0, (
            f"Prova {exam['id_prova']} não tem questões no catálogo"
        )
        assert exam["questoes_extraidas"] == len(exam["questoes"]), (
            f"Prova {exam['id_prova']}: questoes_extraidas ({exam['questoes_extraidas']}) "
            f"!= len(questoes) ({len(exam['questoes'])})"
        )


def test_each_question_has_required_fields(exams_data):
    """Cada questão deve ter todos os campos obrigatórios."""
    for exam in exams_data:
        for q in exam["questoes"]:
            missing = REQUIRED_QUESTION_FIELDS - q.keys()
            assert not missing, (
                f"Questão {q.get('id_questao', '?')} em {exam['id_prova']} faltando: {missing}"
            )


def test_question_types_are_valid(exams_data):
    """Tipo de questão deve ser OBJETIVA ou DISCURSIVA."""
    for exam in exams_data:
        for q in exam["questoes"]:
            assert q["tipo"] in VALID_TIPOS, (
                f"Tipo inválido '{q['tipo']}' em {exam['id_prova']}/{q['id_questao']}"
            )


def test_question_id_format(exams_data):
    """id_questao deve seguir o padrão q01..q80 ou qd01..qd10."""
    import re
    pattern = re.compile(r"^(q\d{2}|qd\d{2})$")
    for exam in exams_data:
        for q in exam["questoes"]:
            assert pattern.match(q["id_questao"]), (
                f"id_questao inválido: '{q['id_questao']}' em {exam['id_prova']}"
            )


def test_question_confidence_range(exams_data):
    """Confiança deve estar entre 0.0 e 1.0."""
    for exam in exams_data:
        for q in exam["questoes"]:
            c = q["confianca"]
            assert 0.0 <= c <= 1.0, (
                f"Confiança fora do range [{c}] em {exam['id_prova']}/{q['id_questao']}"
            )


def test_question_categories_are_list(exams_data):
    """Categorias de cada questão devem ser uma lista (pode ser vazia)."""
    for exam in exams_data:
        for q in exam["questoes"]:
            assert isinstance(q["categorias"], list), (
                f"Categorias não é lista em {exam['id_prova']}/{q['id_questao']}"
            )


def test_question_png_files_exist(exams_data):
    """Cada questão deve ter um PNG correspondente em public/questoes/{id_prova}/."""
    if not QUESTOES_DIR.exists():
        pytest.skip(f"public/questoes/ não encontrado: {QUESTOES_DIR}")

    missing_pngs = []
    for exam in exams_data:
        for q in exam["questoes"]:
            png_path = QUESTOES_DIR / exam["id_prova"] / f"{q['id_questao']}.png"
            if not png_path.exists():
                missing_pngs.append(str(png_path))

    assert not missing_pngs, (
        f"{len(missing_pngs)} PNGs faltando:\n" + "\n".join(missing_pngs[:10])
        + ("\n..." if len(missing_pngs) > 10 else "")
    )


def test_no_duplicate_question_ids(exams_data):
    """Não deve haver id_questao duplicado dentro de uma mesma prova."""
    for exam in exams_data:
        ids = [q["id_questao"] for q in exam["questoes"]]
        duplicates = [i for i in ids if ids.count(i) > 1]
        assert not duplicates, (
            f"IDs duplicados em {exam['id_prova']}: {set(duplicates)}"
        )


def test_no_duplicate_exam_ids(exams_data):
    """Não deve haver id_prova duplicado no catálogo."""
    ids = [exam["id_prova"] for exam in exams_data]
    duplicates = [i for i in ids if ids.count(i) > 1]
    assert not duplicates, f"id_prova duplicados no catálogo: {set(duplicates)}"
