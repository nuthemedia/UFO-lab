"use client";

import styles from "./saucerpedia.module.css";

export function SearchBar({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className={styles.searchBar}>
      <span>{label}</span>
      <input onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type="search" value={value} />
    </label>
  );
}

export function FilterChips({
  items,
  onChange,
  value,
}: {
  items: string[];
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className={styles.categoryScroller} aria-label="フィルター">
      {items.map((item) => (
        <button
          aria-pressed={value === item}
          className={value === item ? styles.activeCategory : undefined}
          key={item}
          onClick={() => onChange(item)}
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function DictionaryControls({
  categories,
  categoryAriaLabel,
  onCategoryChange,
  onQueryChange,
  placeholder,
  query,
  selectedCategory,
}: {
  categories: string[];
  categoryAriaLabel: string;
  onCategoryChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  placeholder: string;
  query: string;
  selectedCategory: string;
}) {
  return (
    <div className={styles.controls}>
      <label>
        <span>検索</span>
        <div className={styles.searchInputRow}>
          <input
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            type="search"
            value={query}
          />
        </div>
      </label>
      <div className={styles.controlGroupLabel}>カテゴリー</div>
      <div className={styles.categoryScroller} aria-label={categoryAriaLabel}>
        {categories.map((category, index) => (
          <button
            aria-pressed={selectedCategory === category}
            className={selectedCategory === category ? styles.activeCategory : undefined}
            key={`${category}-${index}`}
            onClick={() => onCategoryChange(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
