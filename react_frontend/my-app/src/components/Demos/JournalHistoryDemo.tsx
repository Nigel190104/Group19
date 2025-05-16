/**
 * JournalHistoryDemo Component
 *
 * A visual demonstration of the mood history tracking in the BetterDays app.
 * Displays a summary of past mood entries with statistics on emotional wellbeing.
 *
 * Features:
 * - Percentage display of positive mood entries
 * - Chronological list of mood entries with dates
 * - Category-specific mood icons for visual differentiation
 * - Calculation of mood statistics from sample data
 *
 * Uses hardcoded sample data to showcase the interface and functionality
 * without requiring actual user data.
 */

import React from "react";
import "../css/MoodHistory.css";

// Hardcoded mood data
const moodData = [
  {
    id: "1",
    date: "Feb 16",
    category: "Happy",
    mood: "Joyful",
  },
  {
    id: "2",
    date: "Feb 14",
    category: "Calm",
    mood: "Peaceful",
  },
  {
    id: "3",
    date: "Feb 12",
    category: "Energy Levels",
    mood: "Motivated",
  },
  {
    id: "4",
    date: "Feb 10",
    category: "Sad",
    mood: "Melancholy",
  },
  {
    id: "5",
    date: "Feb 8",
    category: "Fearful",
    mood: "Anxious",
  },
  {
    id: "6",
    date: "Feb 6",
    category: "Happy",
    mood: "Cheerful",
  },
  {
    id: "7",
    date: "Feb 4",
    category: "Angry",
    mood: "Frustrated",
  },
];

const JournalHistoryDemo: React.FC = () => {
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
    <div className="journal-card shadow-sm p-4 mt-4">
      <div className="mood-history-container">
        <div className="mood-stats text-center p-3 mb-3">
          <p className="stats-label">Positive mood</p>
          <p className="stats-percentage">{positivePercentage}%</p>
          <p className="stats-period">Last {totalEntries} entries</p>
        </div>

        <div className="mood-entries">
          {moodData.length > 0 ? (
            moodData.map((entry, index) => (
              <div
                key={index}
                className="mood-entry-card mb-2"
              >
                <div className="card-body p-2">
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
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No mood data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalHistoryDemo;
