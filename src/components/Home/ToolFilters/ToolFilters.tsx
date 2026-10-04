import { useRef } from "react";
import type { Category, SortOption, Tool } from "../../../types";
import s from "./ToolFilters.module.css";

interface ToolFiltersProps {
  categories: Category[];
  activeCategory: string;
  searchQuery: string;
  allTools: Tool[];
  filteredCount: number;
  sortBy: SortOption;
  onCategoryChange: (id: string) => void;
  onSearchChange: (args: { query: string; isInput?: boolean }) => void;
  onSortChange: (sort: SortOption) => void;
}

export function ToolFilters({
  categories,
  activeCategory,
  searchQuery,
  allTools,
  filteredCount,
  sortBy,
  onCategoryChange,
  onSearchChange,
  onSortChange,
}: ToolFiltersProps) {
  // Count tools per category for badge
  const counts: Record<string, number> = { all: allTools.length };
  allTools.forEach((t) => {
    counts[t.category] = (counts[t.category] ?? 0) + 1;
  });

  const inputRef = useRef<HTMLInputElement>(null);

  function handleClearInput() {
    onSearchChange({ query: "" });

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  return (
    <div className={s.controls}>
      <div className={s.controlsInner}>
        <div className={s.searchBox}>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) =>
              onSearchChange({ query: e.target.value, isInput: true })
            }
            placeholder="Search tools by name, tag, or description..."
            aria-label="Search tools by name, tag, or description"
            autoComplete="off"
            ref={inputRef}
          />

          <button
            type="button"
            className={s.clearButton}
            onClick={handleClearInput}
            aria-label="Clear search input"
          >
            <svg aria-hidden="true">
              <use href="/icons-sprite.svg#x-mark" />
            </svg>
          </button>
        </div>

        <div
          className={s.categories}
          role="group"
          aria-label="Filter by category"
        >
          {categories.map((cat) => {
            const isCurrent = cat.id === activeCategory;
            const countNum = counts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                className={`${s.catBtn} ${isCurrent ? s.active : ""}`}
                data-id={cat.id}
                title={cat.description}
                aria-pressed={isCurrent}
                aria-label={`${cat.name}, ${countNum} tools`}
                onClick={() => onCategoryChange(cat.id)}
              >
                <span aria-hidden="true">{cat.icon}</span>
                {cat.name}
                <span className={s.count} aria-hidden="true">
                  {String(countNum).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>

        <div className={s.resultsToolbar}>
          <div className={s.resultsCount} aria-live="polite">
            SHOWING{" "}
            <span className="white">
              {String(filteredCount).padStart(2, "0")}
            </span>{" "}
            OF{" "}
            <span className="white">
              {String(allTools.length).padStart(2, "0")}
            </span>{" "}
            TOOLS
          </div>

          <div className={s.sortControls}>
            <label htmlFor="sort-select">SORT BY</label>
            <select
              id="sort-select"
              className={s.sortSelect}
              value={sortBy}
              onChange={(event) =>
                onSortChange(event.target.value as SortOption)
              }
            >
              <option value="stars">Stars</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
