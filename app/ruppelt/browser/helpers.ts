import type { RuppeltViewMode } from "./types";

const storageKey = "ruppelt.savedRecordIds";
const viewModeStorageKey = "ruppelt.viewMode";

export function readParam(name: string) {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get(name) || "";
}

export function syncQuery(params: Record<string, string>) {
  const next = new URLSearchParams(window.location.search);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
  });

  const search = next.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
}

export function readSavedIds() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || "[]") as string[];
  } catch {
    return [];
  }
}

export function writeSavedIds(ids: string[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(ids));
}

export function readViewMode() {
  try {
    const value = window.localStorage.getItem(viewModeStorageKey);
    return value === "list" ? "list" : "carousel";
  } catch {
    return "carousel";
  }
}

export function writeViewMode(mode: RuppeltViewMode) {
  window.localStorage.setItem(viewModeStorageKey, mode);
}

export function isInteractiveElement(target: EventTarget | null) {
  return target instanceof Element
    ? Boolean(target.closest("button, a, input, select, textarea, iframe, [role='button'], [role='tab']"))
    : false;
}
