/**
 * JournalNote Component
 *
 * Displays an individual journal entry card with mood indicators and management options.
 * Provides a consistent visual presentation for journal entries throughout the BetterDays app.
 *
 * Features:
 * - Formatted date and day display
 * - Title and content presentation
 * - Mood indicator with category-specific icons and colours
 * - Edit and delete operations through a dropdown menu
 * - Visual styling based on mood categories
 *
 * The component uses category-specific visual indicators to help users quickly
 * identify the emotional context of each journal entry.
 */

import React from "react";
import "../css/JournalNote.css";
import EditDropdown from "./NoteOperationsDropdown";

interface JournalNoteProps {
  date: string;
  day: string;
  title: string;
  description: string;
  mood?: {
    name: string;
    category: string;
  } | null;
  onEdit: () => void;
  onDelete: () => void;
}

const JournalNote: React.FC<JournalNoteProps> = ({
  date,
  day,
  title,
  description,
  mood,
  onEdit,
  onDelete,
}) => {
  // Function to get mood badge color based on category
  const getMoodColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      Happy: "#FFEEB4",
      Sad: "#C5E3FF",
      Angry: "#FFCCCB",
      Fearful: "#E0D6FF",
      Calm: "#D1F5F5",
      "Energy Levels": "#C8FFDF",
    };

    return categoryColors[category] || "#F0F0F0";
  };

  // Function to get mood icon based on category
  const getMoodIcon = (category: string) => {
    switch (category) {
      case "Happy":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            ></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line
              x1="9"
              y1="9"
              x2="9.01"
              y2="9"
            ></line>
            <line
              x1="15"
              y1="9"
              x2="15.01"
              y2="9"
            ></line>
          </svg>
        );
      case "Sad":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            ></circle>
            <line
              x1="8"
              y1="15"
              x2="16"
              y2="15"
            ></line>
            <line
              x1="9"
              y1="9"
              x2="9.01"
              y2="9"
            ></line>
            <line
              x1="15"
              y1="9"
              x2="15.01"
              y2="9"
            ></line>
          </svg>
        );
      case "Angry":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            ></circle>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
            <line
              x1="9"
              y1="9"
              x2="9.01"
              y2="9"
            ></line>
            <line
              x1="15"
              y1="9"
              x2="15.01"
              y2="9"
            ></line>
          </svg>
        );
      case "Fearful":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            ></circle>
            <path d="M8 15h8"></path>
            <line
              x1="9"
              y1="9"
              x2="9.01"
              y2="9"
            ></line>
            <line
              x1="15"
              y1="9"
              x2="15.01"
              y2="9"
            ></line>
          </svg>
        );
      case "Calm":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line
              x1="6"
              y1="1"
              x2="6"
              y2="4"
            ></line>
            <line
              x1="10"
              y1="1"
              x2="10"
              y2="4"
            ></line>
            <line
              x1="14"
              y1="1"
              x2="14"
              y2="4"
            ></line>
          </svg>
        );
      case "Energy Levels":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            ></circle>
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="12"
            ></line>
            <line
              x1="12"
              y1="16"
              x2="12.01"
              y2="16"
            ></line>
          </svg>
        );
    }
  };

  return (
    <div className="note-card position-relative">
      <EditDropdown
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* header section with date and title */}
      <div className="note-header d-flex align-items-center mb-3">
        <div className="date-info-calendar me-3">
          <span className="month">{day}</span>
          <span className="day">{date}</span>
        </div>
        <h3 className="title mb-0">{title}</h3>
      </div>

      {/* note content */}
      <p className="note-content fs-4">
        {description}
        {/* {truncateDescription(description, 70)} */}
      </p>

      {/* Modd display with category-specific icon */}
      {mood && (
        <div className="mood-display mt-3">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: "16px",
              fontSize: "0.85rem",
              backgroundColor: mood.category
                ? getMoodColor(mood.category)
                : "#f8f5f2",
              color: "#555",
            }}
          >
            <span style={{ marginRight: "4px" }}>
              {mood.category ? getMoodIcon(mood.category) : null}
            </span>
            <span>
              I felt{" "}
              <strong style={{ color: "#7a4a2b", marginLeft: "3px" }}>
                {mood.name}
              </strong>
              <span
                style={{
                  fontStyle: "italic",
                  marginLeft: "4px",
                  color: "#666",
                }}
              >
                ({mood.category})
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalNote;
