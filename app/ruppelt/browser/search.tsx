import type { ReactNode } from "react";
import {
  getSearchFacets,
  getSearchText,
  priorDisclosureStatusOptions,
  type PriorDisclosureStatus,
  type PursueRecord,
} from "@/lib/pursue";
import type { PriorDisclosureFilter, SearchAction, SearchMode, SearchState } from "./types";

export const initialSearchState: SearchState = {
  draftQuery: "",
  committedQuery: "",
  searchMode: "description",
  fulltextStatus: "idle",
  fulltextMatches: [],
  fulltextMatchesQuery: "",
  fulltextError: "",
};

export function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "hydrate":
      return {
        ...state,
        draftQuery: action.query,
        committedQuery: action.query,
        searchMode: action.searchMode,
      };
    case "editQuery":
      return { ...state, draftQuery: action.query };
    case "commitSearch": {
      const nextQuery = state.draftQuery.trim();

      if (nextQuery === state.committedQuery) {
        return state;
      }

      return {
        ...state,
        committedQuery: nextQuery,
        fulltextStatus: state.searchMode === "fulltext" && nextQuery ? "loading" : "idle",
        fulltextError: "",
      };
    }
    case "applyExampleSearch": {
      const nextQuery = action.query.trim();

      return {
        ...state,
        draftQuery: nextQuery,
        committedQuery: nextQuery,
        searchMode: "fulltext",
        fulltextStatus: nextQuery ? "loading" : "idle",
        fulltextError: "",
      };
    }
    case "clearSearch":
      return {
        ...state,
        draftQuery: "",
        committedQuery: "",
        fulltextStatus: "idle",
        fulltextMatches: [],
        fulltextMatchesQuery: "",
        fulltextError: "",
      };
    case "changeSearchMode":
      return {
        ...state,
        searchMode: action.searchMode,
        fulltextStatus:
          action.searchMode === "fulltext" && state.committedQuery ? state.fulltextStatus : "idle",
        fulltextError: action.searchMode === "fulltext" ? state.fulltextError : "",
      };
    case "fulltextStart":
      if (action.query !== state.committedQuery || state.searchMode !== "fulltext") {
        return state;
      }

      return { ...state, fulltextStatus: "loading", fulltextError: "" };
    case "fulltextSuccess":
      if (action.query !== state.committedQuery || state.searchMode !== "fulltext") {
        return state;
      }

      return {
        ...state,
        fulltextStatus: "success",
        fulltextMatches: action.matches,
        fulltextMatchesQuery: action.query,
        fulltextError: "",
      };
    case "fulltextError":
      if (action.query !== state.committedQuery || state.searchMode !== "fulltext") {
        return state;
      }

      return {
        ...state,
        fulltextStatus: "error",
        fulltextMatches: [],
        fulltextMatchesQuery: action.query,
        fulltextError: action.error,
      };
    default:
      return state;
  }
}

export function renderHighlightedText(text: string, query: string): ReactNode {
  const ranges = findInlineSearchRanges(text, query);

  if (!text || ranges.length === 0) {
    return text;
  }

  const parts: ReactNode[] = [];
  let cursor = 0;

  ranges.forEach((range, indexValue) => {
    if (range.start > cursor) {
      parts.push(text.slice(cursor, range.start));
    }

    parts.push(
      <mark className="ruppelt-search-highlight" key={`${range.start}-${range.end}-${indexValue}`}>
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}

function normalizeInlineSearchValue(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function buildInlineSearchIndex(text: string) {
  let normalized = "";
  const sourceIndexes: number[] = [];
  const sourceEndIndexes: number[] = [];
  let sourceIndex = 0;

  for (const char of text) {
    const normalizedChar = normalizeInlineSearchValue(char);

    Array.from(normalizedChar).forEach((searchChar) => {
      normalized += searchChar;
      sourceIndexes.push(sourceIndex);
      sourceEndIndexes.push(sourceIndex + char.length);
    });
    sourceIndex += char.length;
  }

  return { normalized, sourceIndexes, sourceEndIndexes };
}

export function findInlineSearchRanges(text: string, query: string) {
  const normalizedQuery = normalizeInlineSearchValue(query);

  if (!text || !normalizedQuery) {
    return [];
  }

  const { normalized, sourceIndexes, sourceEndIndexes } = buildInlineSearchIndex(text);
  const ranges: Array<{ start: number; end: number }> = [];
  let searchIndex = normalized.indexOf(normalizedQuery);

  while (searchIndex >= 0) {
    const sourceStart = sourceIndexes[searchIndex];
    const sourceEnd = sourceEndIndexes[searchIndex + normalizedQuery.length - 1];
    const previous = ranges.at(-1);

    if (previous && sourceStart <= previous.end) {
      previous.end = Math.max(previous.end, sourceEnd);
    } else {
      ranges.push({ start: sourceStart, end: sourceEnd });
    }

    searchIndex = normalized.indexOf(normalizedQuery, searchIndex + normalizedQuery.length);
  }

  return ranges;
}

export function countInlineSearchMatches(text: string, query: string) {
  return findInlineSearchRanges(text, query).length;
}

export function normalizePriorDisclosureFilter(value: string): PriorDisclosureFilter {
  if (value === "unreviewed") {
    return "unreviewed";
  }

  return priorDisclosureStatusOptions.includes(value as PriorDisclosureStatus)
    ? (value as PriorDisclosureStatus)
    : "";
}

export function normalizeSearchMode(value: string): SearchMode {
  return value === "fulltext" ? "fulltext" : "description";
}

export function matchesRecord(
  record: PursueRecord,
  query: string,
  release: string,
  agency: string,
  type: string,
  priorDisclosureStatus: PriorDisclosureFilter,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery && !getSearchText(record).includes(normalizedQuery)) {
    return false;
  }

  if (release && record.source.release !== release) {
    return false;
  }

  if (agency && record.source.agency !== agency) {
    return false;
  }

  if (type && record.source.documentType !== type) {
    return false;
  }

  if (priorDisclosureStatus === "unreviewed") {
    return !record.priorDisclosure;
  }

  if (priorDisclosureStatus && !record.priorDisclosure) {
    return false;
  }

  if (priorDisclosureStatus && getSearchFacets(record).priorDisclosureStatus !== priorDisclosureStatus) {
    return false;
  }

  return true;
}
