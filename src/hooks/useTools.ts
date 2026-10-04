import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_CATEGORY_VALUE,
  DEFAULT_SORT_VALUE,
  DEV_JSON_URL,
  FALLBACK_DATA,
  PROD_JSON_URL,
} from "../constants/fallbackData";
import type {
  Category,
  LoadStatus,
  SortOption,
  Tool,
  ToolsData,
} from "../types";
import { DEBOUNCE_SEARCH_FIELD_MS } from "../constants/time";

export interface ToolSections {
  featured: Tool[];
  editorsPicks: Tool[];
  meetsCriteria: Tool[];
}

interface UseToolsReturn {
  tools: Tool[];
  filteredTools: Tool[];
  sections: ToolSections;
  searchKeywords: string[];
  isSearching: boolean;
  categories: Category[];
  loadStatus: LoadStatus;
  errorMessage: string;
  query: string;
  activeCategory: string;
  sortBy: string;
  onCategoryChange: (id: string) => void;
  onSearchChange: (args: { query: string; isInput?: boolean }) => void;
  onSortChange: (option: SortOption) => void;
}

function sectionize(tools: Tool[]): ToolSections {
  return {
    featured: tools.filter((entry) => entry.section === "featured"),
    editorsPicks: tools.filter((entry) => entry.section === "editors-pick"),
    meetsCriteria: tools.filter(
      (entry) => entry.section !== "featured" && entry.section !== "editors-pick",
    ),
  };
}

export function useTools(): UseToolsReturn {
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || DEFAULT_CATEGORY_VALUE;
  const searchQuery = searchParams.get("q") || "";
  const sortBy: SortOption =
    (searchParams.get("sort") as SortOption | null) || DEFAULT_SORT_VALUE;

  const [query, setQuery] = useState(searchQuery);
  const debounceId: React.RefObject<null | number> = useRef(null);

  useEffect(() => {
    async function load() {
      setLoadStatus("loading");
      let data: ToolsData | null = null;
      let error = "";

      if (import.meta?.env?.DEV) {
        data = await loadTools(DEV_JSON_URL);
      }

      // Try loading data from GITHUB if not loaded yet.
      if (!data) data = await loadTools(PROD_JSON_URL);

      // If all fails, load fallback data
      if (!data) {
        data = FALLBACK_DATA;
        error = `Failed to get the freshest data from prod`;
        setErrorMessage(error);
      }

      hydrate(data, error);
    }
    load();
  }, []);

  function hydrate(data: ToolsData, error: string) {
    const cats = data.categories ?? [];
    if (!cats.find((c) => c.id === "all")) {
      cats.unshift({
        id: "all",
        name: "All",
        icon: "◈",
        description: "All tools",
      });
    }

    setAllTools(data.tools);
    setCategories(cats);
    setLoadStatus(!error ? "success" : "error");
  }

  const searchKeywords = useMemo(() => tokenize(searchQuery), [searchQuery]);
  const isSearching = searchKeywords.length > 0;

  // Search filtering & ranking logic
  const scoredTools = useMemo(() => {
    const keywords = searchKeywords;
    return allTools
      .filter(
        (tool) => activeCategory === "all" || tool.category === activeCategory,  // Filters out the entries not the category selected.
      )
      .map((tool) => ({ tool, score: matchScore(tool, keywords) }))              // Scores the entries by how many keywords it matched.
      .filter(({ score }) => keywords.length === 0 || score == keywords.length); // Filters out the entries that don't match the number
  }, [allTools, activeCategory, searchQuery]);                                   // of keywords.

  // Sorts by filter matching score & stars
  const filteredTools = useMemo(
    () =>
      [...scoredTools]
        .sort(
          (a, b) =>
            b.score - a.score || (b.tool.stars ?? 0) - (a.tool.stars ?? 0),
        )
        .map(({ tool }) => tool),
    [scoredTools],
  );

  // Turns filtered tools into three sections: featured, editor's picks, and meets criteria.
  const sections = useMemo<ToolSections>(
    () => sectionize(filteredTools),
    [filteredTools],
  );

  function onCategoryChange(id: string) {
    const params = new URLSearchParams(searchParams);

    id === DEFAULT_CATEGORY_VALUE
      ? params.delete("category")
      : params.set("category", id);

    setSearchParams(params);
  }

  function onSearchChange({
    query,
    isInput = false,
  }: {
    query: string;
    isInput?: boolean;
  }) {
    if (isInput) {
      if (debounceId.current) {
        clearTimeout(debounceId.current);
      }

      setQuery(query);
      debounceId.current = setTimeout(
        () => updateUrlQuery(query),
        DEBOUNCE_SEARCH_FIELD_MS,
      );
      return;
    }

    setQuery(query);
    updateUrlQuery(query);
  }

  function updateUrlQuery(query: string) {
    const params = new URLSearchParams(searchParams);
    query === "" ? params.delete("q") : params.set("q", query);
    setSearchParams(params);
  }

  function onSortChange(option: SortOption) {
    const params = new URLSearchParams(searchParams);

    option === DEFAULT_SORT_VALUE
      ? params.delete("sort")
      : params.set("sort", option);

    setSearchParams(params);
  }

  return {
    tools: allTools,
    filteredTools,
    sections,
    searchKeywords,
    isSearching,
    categories,
    loadStatus,
    errorMessage,
    query,
    activeCategory,
    sortBy,
    onCategoryChange,
    onSearchChange,
    onSortChange,
  };
}

// Split text into lowercase alphanumeric keywords, so "video-editor",
// "Video Editor" and "video_editor" all yield ["video", "editor"].
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter(Boolean);
}

// Number of query keywords found in the tool's name, description, or tags.
function matchScore(tool: Tool, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const haystack = [tool.name, tool.description, ...tool.tags]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ");
  return keywords.filter((kw) => haystack.includes(kw)).length;
}

async function loadTools(JSON_URL: string): Promise<ToolsData | null> {
  try {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`Failed to get data from ${JSON_URL}`);
    return (await res.json()) as ToolsData;
  } catch (err) {
    console.error(`Couldn't parse tools from: ${JSON_URL}`, err);
    return null;
  }
}
