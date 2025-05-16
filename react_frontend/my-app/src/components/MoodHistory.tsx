/**
 * MoodHistory Component
 *
 * A visualization component that displays the user's recent mood entries in the BetterDays app,
 * providing insights into emotional patterns and trends.
 *
 * Features:
 * - Displays the last 10 mood entries with dates and mood categories
 * - Calculates and shows the percentage of positive moods
 * - Visualizes different mood categories with appropriate icons
 * - Filters and processes mood data from journal entries
 * - Responsive design for various screen sizes
 *
 * The component takes notes and mood subcategories as props, processes them to extract
 * relevant mood information, and displays a statistical summary and chronological list
 * of the user's recent emotional states. It categorizes moods into positive categories
 * (Happy, Calm, Energy Levels) and other emotion types, calculating the overall
 * positive mood percentage from recent entries.
 *
 * Each mood entry displays:
 * - The date of the entry
 * - The specific mood subcategory
 * - A visual icon representing the mood category
 */

import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import "./css/MoodHistory.css";

//------------interfaces-----------------------------------
interface Note {
  id: string;
  note_caption: string;
  note_content: string;
  note_date_created: string | null;
  mood_subcategory: number | null;
}

interface MoodSubcategory {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
}

interface MoodHistoryProps {
  notes: Note[];
  moodSubcategories: MoodSubcategory[];
}
//-----------------------------------------------

const MoodHistory: React.FC<MoodHistoryProps> = ({
  notes,
  moodSubcategories,
}) => {
  const [moodData, setMoodData] = useState<any[]>([]);

  useEffect(() => {
    const notesWithMoods = notes.filter(
      (note) =>
        note.mood_subcategory !== null && note.note_date_created !== null
    );

    // 10 entries (week)
    const recentEntries = notesWithMoods
      .sort((a, b) => {
        // Handle null dates (though we filtered them out above)
        if (!a.note_date_created || !b.note_date_created) return 0;
        return (
          new Date(b.note_date_created).getTime() -
          new Date(a.note_date_created).getTime()
        );
      })
      .slice(0, 10)
      .map((note) => {
        const mood = moodSubcategories.find(
          (m) => m.id === note.mood_subcategory
        );
        return {
          id: note.id,
          date: note.note_date_created
            ? new Date(note.note_date_created).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "Unknown date",
          category: mood?.category.name || "Unknown",
          mood: mood?.name || "Unknown",
        };
      });

    setMoodData(recentEntries);
  }, [notes, moodSubcategories]);

  const getMoodIcon = (category: string) => {
    switch (category) {
      case "Happy":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mood-icon happy"
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
      case "Calm":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mood-icon calm"
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
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mood-icon energy"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
        );
      case "Fearful":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mood-icon fear"
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
      case "Angry":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mood-icon anger"
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
      case "Sad":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mood-icon sadness"
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
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mood-icon default"
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

  // calc of mood stats
  const calculateMoodStats = () => {
    if (moodData.length === 0)
      return { positivePercentage: 0, totalEntries: 0 };

    const positiveCategories = ["Happy", "Calm", "Energy Levels"];
    const positiveEntries = moodData.filter((entry) =>
      positiveCategories.includes(entry.category)
    ).length;
    const totalEntries = moodData.length;
    const positivePercentage = Math.round(
      (positiveEntries / totalEntries) * 100
    );

    return { positivePercentage, totalEntries };
  };

  const { positivePercentage, totalEntries } = calculateMoodStats();

  // Calendar icon for date display
  const CalendarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="calendar-icon"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        ry="2"
      ></rect>
      <line
        x1="16"
        y1="2"
        x2="16"
        y2="6"
      ></line>
      <line
        x1="8"
        y1="2"
        x2="8"
        y2="6"
      ></line>
      <line
        x1="3"
        y1="10"
        x2="21"
        y2="10"
      ></line>
    </svg>
  );

  return (
    <div className="mood-history-container">
      <div className="mood-stats text-center p-3 mb-3">
        <p className="stats-label">Positive mood</p>
        <p className="stats-percentage">{positivePercentage}%</p>
        <p className="stats-period">Last {totalEntries} entries</p>
      </div>

      <div className="mood-entries">
        {moodData.length > 0 ? (
          moodData.map((entry, index) => (
            <Card
              key={index}
              className="mood-entry-card mb-2"
            >
              <Card.Body className="p-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <CalendarIcon />
                    <span className="entry-date ms-2">{entry.date}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="entry-mood me-2">{entry.mood}</span>
                    {getMoodIcon(entry.category)}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted">No mood data available</p>
        )}
      </div>
    </div>
  );
};

export default MoodHistory;
