/**
 * NoteSearchBar Component
 *
 * Search interface for journal entries in the BetterDays app, allowing filtering by:
 * - Text content (with 300ms debounced search)
 * - Mood categories (extracted from subcategories)
 *
 * Provides real-time filtering of notes based on user input and communicates
 * results to parent component through callback functions.
 */

import React, { useState, useEffect } from "react";
import "./css/NoteSearchBar.css";

interface MoodCategory {
  id: number;
  name: string;
}

interface MoodSubcategory {
  id: number;
  name: string;
  category: MoodCategory;
  description: string;
  mbti_insight: string;
}

interface Note {
  id: string;
  note_caption: string;
  note_content: string;
  note_date_created: string | null;
  mood_subcategory: number | null;
}

interface SearchBarProps {
  moodSubcategories: MoodSubcategory[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategory: string;
  notes: Note[];
  onSearch: (filteredNotes: Note[]) => void;
}

const NoteSearchBar: React.FC<SearchBarProps> = ({
  moodSubcategories,
  onCategorySelect,
  selectedCategory,
  notes,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const getUniqueCategories = () => {
    const categoriesMap = new Map<number, MoodCategory>();

    moodSubcategories.forEach((subcategory) => {
      if (!categoriesMap.has(subcategory.category.id)) {
        categoriesMap.set(subcategory.category.id, subcategory.category);
      }
    });

    return Array.from(categoriesMap.values());
  };

  const categories = getUniqueCategories();

  // Handle category selection change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCategorySelect(e.target.value);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear the existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      performSearch(query);
    }, 300); //avoid excessive filtering

    setDebounceTimeout(timeout);
  };

  // if empty - handle filtering in journal component
  const performSearch = (query: string) => {
    if (!query.trim()) {
      return;
    }

    // Filter notes by search query
    const lowercaseQuery = query.toLowerCase();
    const searchResults = notes.filter((note) => {
      const matchesTitle = note.note_caption
        .toLowerCase()
        .includes(lowercaseQuery);
      const matchesContent = note.note_content
        .toLowerCase()
        .includes(lowercaseQuery);
      return matchesTitle || matchesContent;
    });

    // Pass filtered notes to parent component
    onSearch(searchResults);
  };

  // Clean up the timeout when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return (
    <div className="search-bar-container">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="input-group">
          <select
            className="form-select search-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id.toString()}
              >
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button
            className="btn search-button"
            type="button"
            onClick={() => performSearch(searchQuery)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor" // This will inherit the text color, which we'll set to white
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "white", stroke: "white" }} // Add inline style as a fallback
            >
              <circle
                cx="11"
                cy="11"
                r="8"
              ></circle>
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
              ></line>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteSearchBar;
