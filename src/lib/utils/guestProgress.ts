const GUEST_SOLVED_PROBLEMS_KEY = "financely_guest_solved_problems";

function safeStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function loadGuestSolvedProblemIds(): string[] {
  const storage = safeStorage();
  if (!storage) return [];
  const raw = storage.getItem(GUEST_SOLVED_PROBLEMS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function saveGuestSolvedProblemIds(ids: string[]) {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(
    GUEST_SOLVED_PROBLEMS_KEY,
    JSON.stringify(Array.from(new Set(ids)))
  );
}

export function recordGuestSolvedProblem(problemId: string) {
  if (!problemId) return;
  const current = loadGuestSolvedProblemIds();
  if (current.includes(problemId)) return;
  current.push(problemId);
  saveGuestSolvedProblemIds(current);
}

export function clearGuestSolvedProblems() {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(GUEST_SOLVED_PROBLEMS_KEY);
}
