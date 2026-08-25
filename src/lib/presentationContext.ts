export interface PlaylistItem {
  id_prova: string;
  id_questao: string;
}

export function savePresentationContext(items: PlaylistItem[], returnUrl?: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("enade_presentation_playlist", JSON.stringify(items));
    if (returnUrl) {
      sessionStorage.setItem("enade_presentation_return_url", returnUrl);
    } else {
      sessionStorage.setItem("enade_presentation_return_url", window.location.pathname + window.location.search);
    }
  } catch (err) {
    console.error("Failed to save presentation context:", err);
  }
}

export function getPresentationContext(): {
  playlist: PlaylistItem[] | null;
  returnUrl: string | null;
} {
  if (typeof window === "undefined") {
    return { playlist: null, returnUrl: null };
  }
  try {
    const playlistStr = sessionStorage.getItem("enade_presentation_playlist");
    const returnUrl = sessionStorage.getItem("enade_presentation_return_url");
    const playlist = playlistStr ? JSON.parse(playlistStr) : null;
    return { playlist, returnUrl };
  } catch {
    return { playlist: null, returnUrl: null };
  }
}
