/**
 * EditDropdown Component
 *
 * A dropdown menu component for journal entry operations, offering edit and delete actions.
 * Appears as a contextual menu attached to journal entries.
 *
 * Features:
 * - Toggle functionality for showing/hiding the dropdown menu
 * - Edit and delete options with appropriate icons
 * - Click-outside detection to automatically close the menu
 * - Event propagation control to avoid unintended interactions
 *
 * This component follows accessibility best practices with appropriate
 * aria labels and provides a clean interface for journal entry management.
 */

import React, { useState, useRef, useEffect } from "react";
import "../css/NoteOperationsDropdown.css";

interface EditDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
}

const EditDropdown: React.FC<EditDropdownProps> = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setIsOpen(!isOpen);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    onEdit();
    setIsOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    onDelete();
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    // Specify the type for the event parameter
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="note-operations-dropdown"
      ref={dropdownRef}
    >
      <button
        className="dropdown-toggle"
        onClick={toggleDropdown}
        type="button"
        aria-label="Note options"
      ></button>

      {isOpen && (
        <div className="dropdown-menu show">
          <button
            className="dropdown-item"
            onClick={handleEditClick}
            type="button"
          >
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
              className="item-icon"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Edit Entry
          </button>
          <button
            className="dropdown-item delete-item"
            onClick={handleDeleteClick}
            type="button"
          >
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
              className="item-icon"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            Delete Entry
          </button>
        </div>
      )}
    </div>
  );
};

export default EditDropdown;
