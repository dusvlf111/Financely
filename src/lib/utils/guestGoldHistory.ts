import type { GoldHistoryEntry } from "@/lib/types/gold";

const STORAGE_KEY = "financely-gold-storage";
const canUseBrowserStorage = () => typeof window !== "undefined";

export function loadGuestGoldHistory(): GoldHistoryEntry[] {
  if (!canUseBrowserStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const history = parsed?.state?.history;
    if (!Array.isArray(history)) return [];
    return history.filter(
      (entry): entry is GoldHistoryEntry =>
        entry &&
        typeof entry.timestamp === "number" &&
        typeof entry.gold === "number"
    );
  } catch {
    return [];
  }
}

export function saveGuestGoldHistory(history: GoldHistoryEntry[]) {
  if (!canUseBrowserStorage()) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const version = typeof parsed?.version === "number" ? parsed.version : 0;
    const nextState = {
      ...(parsed?.state ?? {}),
      history,
    };
    const payload = {
      ...parsed,
      state: nextState,
      version,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    console.log(payload);
  } catch {
    // Ignore quota or parse errors
  }
}
