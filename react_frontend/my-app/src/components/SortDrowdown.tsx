/**
 * SortDropdown Component
 *
 * Dropdown menu for sorting journal entries in the BetterDays app by:
 * - Date (newest/oldest first)
 * - Title (alphabetically)
 * - Mood category
 *
 * Takes an array of notes and a callback function to return sorted results
 * to the parent component.
 */

import Dropdown from "react-bootstrap/Dropdown";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/SortDropdown.css";

interface Note {
  id: string;
  note_caption: string;
  note_content: string;
  note_date_created: string | null;
  mood_subcategory: number | null; //id from api
}

interface SortDropdownProps {
  notes: Note[];
  onSort: (sortedNotes: Note[]) => void;
}

function SortDropdown({ notes, onSort }: SortDropdownProps) {
  // sorting functionality
  const sortByNewest = () => {
    const sorted = [...notes].sort((a, b) => {
      if (!a.note_date_created || !b.note_date_created) return 0;
      return (
        new Date(b.note_date_created).getTime() -
        new Date(a.note_date_created).getTime()
      );
    });
    onSort(sorted);
  };

  const sortByOldest = () => {
    const sorted = [...notes].sort((a, b) => {
      if (!a.note_date_created || !b.note_date_created) return 0;
      return (
        new Date(a.note_date_created).getTime() -
        new Date(b.note_date_created).getTime()
      );
    });
    onSort(sorted);
  };

  const sortByTitle = () => {
    const sorted = [...notes].sort((a, b) =>
      a.note_caption.toLowerCase().localeCompare(b.note_caption.toLowerCase())
    );
    onSort(sorted);
  };

  const sortByMood = () => {
    // First, group notes with moods and without moods
    const withMood = notes.filter((note) => note.mood_subcategory !== null);
    const withoutMood = notes.filter((note) => note.mood_subcategory === null);

    // Sort by mood subcategory ID
    const sortedWithMood = [...withMood].sort((a, b) => {
      return a.mood_subcategory! - b.mood_subcategory!;
    });

    // Combine the sorted arrays: notes with moods first, then notes without moods
    const sorted = [...sortedWithMood, ...withoutMood];
    onSort(sorted);
  };

  return (
    <Dropdown className="journal-sort-dropdown">
      <Dropdown.Toggle
        variant="light"
        id="dropdown-sort"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="#7a4a2b"
          className="sort-icon"
          viewBox="0 0 16 16"
        >
          <path d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 12.293V3.5zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1h-1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1h-3zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1h-5zM7 12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5z" />
        </svg>
        Sort
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={sortByNewest}>Newest first</Dropdown.Item>{" "}
        <Dropdown.Item onClick={sortByOldest}>Oldest first</Dropdown.Item>
        <Dropdown.Item onClick={sortByTitle}>By title (A-Z)</Dropdown.Item>
        <Dropdown.Item onClick={sortByMood}>By mood</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default SortDropdown;
