/**
 * JournalToggle Component
 *
 * A toggle interface that allows users to switch between personal and work journals.
 * Provides visual indication of the currently active journal type.
 *
 * Features:
 * - Two-state toggle between "Personal" and "Job" journal views
 * - Clear visual indicators for the active selection
 * - Icon-based labels for improved usability
 *
 * This component serves as the primary navigation control for switching
 * between different journal contexts in the BetterDays app.
 */

import React from "react";
import "../css/JournalToggle.css";

interface JournalToggleProps {
  activeJournal: "personal" | "work";
  onToggle: (journal: "personal" | "work") => void;
}

const JournalToggle: React.FC<JournalToggleProps> = ({
  activeJournal,
  onToggle,
}) => {
  return (
    <div className="journal-toggle-container">
      <div className="journal-toggle">
        <button
          className={`toggle-button ${
            activeJournal === "personal" ? "active" : ""
          }`}
          onClick={() => onToggle("personal")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="me-2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <path d="M14 2v6h6"></path>
            <path d="M16 13H8"></path>
            <path d="M16 17H8"></path>
            <path d="M10 9H8"></path>
          </svg>
          Personal
        </button>
        <button
          className={`toggle-button ${
            activeJournal === "work" ? "active" : ""
          }`}
          onClick={() => onToggle("work")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="me-2"
          >
            <rect
              x="2"
              y="7"
              width="20"
              height="14"
              rx="2"
              ry="2"
            ></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          Job
        </button>
      </div>
    </div>
  );
};

export default JournalToggle;
