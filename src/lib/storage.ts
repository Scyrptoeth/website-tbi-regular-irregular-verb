import type { ProgressEntry, ProgressMap } from "./learning";

export const PROGRESS_STORAGE_KEY = "tbi-verb-progress";

function getStorage(): Storage | null {
  try {
    if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
      return null;
    }

    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isProgressEntry(value: unknown): value is ProgressEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Partial<ProgressEntry>;

  return (
    typeof entry.attempts === "number" &&
    Number.isFinite(entry.attempts) &&
    entry.attempts >= 0 &&
    typeof entry.correct === "number" &&
    Number.isFinite(entry.correct) &&
    entry.correct >= 0 &&
    entry.correct <= entry.attempts &&
    (entry.lastPracticedAt === undefined ||
      typeof entry.lastPracticedAt === "string") &&
    (entry.mastered === undefined || typeof entry.mastered === "boolean")
  );
}

export function parseProgress(rawValue: string | null): ProgressMap {
  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<ProgressMap>(
      (progress, [id, value]) => {
        if (isProgressEntry(value)) {
          progress[id] = {
            attempts: value.attempts,
            correct: value.correct,
            lastPracticedAt: value.lastPracticedAt,
            mastered: value.mastered,
          };
        }

        return progress;
      },
      {},
    );
  } catch {
    return {};
  }
}

export function loadProgress(
  storageKey = PROGRESS_STORAGE_KEY,
): ProgressMap {
  const storage = getStorage();

  if (!storage) {
    return {};
  }

  try {
    return parseProgress(storage.getItem(storageKey));
  } catch {
    return {};
  }
}

export function saveProgress(
  progress: ProgressMap,
  storageKey = PROGRESS_STORAGE_KEY,
): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(storageKey, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function updateProgress(
  updater: (progress: ProgressMap) => ProgressMap,
  storageKey = PROGRESS_STORAGE_KEY,
): ProgressMap {
  const currentProgress = loadProgress(storageKey);
  const nextProgress = updater(currentProgress);
  saveProgress(nextProgress, storageKey);

  return nextProgress;
}

export function clearProgress(storageKey = PROGRESS_STORAGE_KEY): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(storageKey);
    return true;
  } catch {
    return false;
  }
}
