"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "enade_custom_tags_v1";

export interface CustomTagMap {
  [questionKey: string]: string[]; // key format: `${id_prova}:${id_questao}`
}

export function getCustomTags(): CustomTagMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Erro ao ler custom tags:", e);
    return {};
  }
}

export function saveCustomTags(map: CustomTagMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Erro ao salvar custom tags:", e);
  }
}

export function useQuestionTags(id_prova: string, id_questao: string, initialTags: string[]) {
  const key = `${id_prova}:${id_questao}`;
  const [tags, setTags] = useState<string[]>(initialTags);

  useEffect(() => {
    const all = getCustomTags();
    if (all[key]) {
      setTags(all[key]);
    } else {
      setTags(initialTags);
    }
  }, [key, initialTags]);

  const addTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    const updated = [...tags, trimmed];
    setTags(updated);
    const all = getCustomTags();
    all[key] = updated;
    saveCustomTags(all);
  };

  const removeTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    const all = getCustomTags();
    all[key] = updated;
    saveCustomTags(all);
  };

  return { tags, addTag, removeTag };
}
