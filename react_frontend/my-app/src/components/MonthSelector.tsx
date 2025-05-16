/**
 * MonthSelector Component
 *
 * A dropdown interface for selecting months and years to navigate through
 * time-based views in the BetterDays application.
 *
 * Features:
 * - Current month and year display with dropdown toggle
 * - Year tabs for quick navigation between recent years
 * - Month grid with abbreviated month names
 * - Visual indication of the current month
 * - State management for selected year and dropdown visibility
 * - Callback function for parent component notification of selection changes
 * - Responsive design that works across different screen sizes
 *
 * This component provides an intuitive date selection interface for
 * filtering journal entries, habits, and other time-based content.
 */

import React, { useState } from "react";
import "./css/MonthSelector.css";

interface MonthSelectorProps {
  onMonthChange: (monthIndex: number, year: number) => void;
  currentMonth: string;
  currentYear: number;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  onMonthChange,
  currentMonth,
  currentYear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Generate array of months
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Generate array of years (current year and 4 years back)
  const years = [];
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i);
  }

  const handleMonthSelect = (monthIndex: number) => {
    onMonthChange(monthIndex, selectedYear);
    setIsOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <div className="month-selector">
      <button
        className="month-selector-toggle d-flex align-items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {currentMonth}, {currentYear}
        </span>
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
          className={`ms-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="month-selector-dropdown shadow">
          <div className="year-tabs d-flex">
            {years.map((year) => (
              <button
                key={year}
                className={`year-tab ${year === selectedYear ? "active" : ""}`}
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </button>
            ))}
          </div>
          <div className="month-grid">
            {months.map((month, index) => {
              const today = new Date();
              const isCurrentMonth =
                index === today.getMonth() &&
                selectedYear === today.getFullYear();

              return (
                <button
                  key={month}
                  className={`month-item ${isCurrentMonth ? "current" : ""}`}
                  onClick={() => handleMonthSelect(index)}
                >
                  {month.substring(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthSelector;
