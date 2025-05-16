/**
 * HabitTracker Component
 *
 * A comprehensive habit tracking interface for monitoring and managing daily routines.
 * Provides calendar-style visualisation of habit completion with streak tracking.
 *
 * Features:
 * - Week and month calendar views for habit tracking
 * - Interactive habit completion toggling with visual feedback
 * - Streak calculation and flame icon display for consistent habits
 * - Habit creation and editing via modal interfaces
 * - Integration with accountability partners system
 * - Navigation controls for time period selection
 * - Future date prevention to maintain tracking integrity
 * - Responsive design with optimised grid layout
 *
 * This component serves as the central habit management hub in the BetterDays app,
 * encouraging consistent behaviour through visual tracking and accountability.
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./css/Habits.css";

// Import the modal components
import CreateHabits from "./CreateHabits";
import EditHabit from "./EditHabit";
import BACKEND_BASE_URL from "../Constants";

// ----------------------------- accountability partners imports -----------------------------
import { AccountabilityStreamProvider } from "./AccountabilityPartners/AccountabilityStreamProvider";
import AccountabilityManager from "./AccountabilityPartners/AccountabilityManager";
import PartnerHabitsView from "./AccountabilityPartners/PartnerHabitsView";
import { Partner } from "../AccountabilityUtility";

import "./css/Accountability.css";
//--------------------------------------------------------------------------------------------

//---------------------------------Interfaces-------------------
interface User {
  id: number;
}

interface Habit {
  id: number;
  user: number | User; // Can be just the ID or the full user object
  habit_name: string;
  habit_description: string | null;
  habit_colour: string;
  habit_frequency: number;
  completions: Record<string, boolean>; // Format: {'YYYY-MM-DD': true}
  streak_count: number; // Assuming backend provides this or it's calculated correctly
  last_completed: string | null; // ISO date string or null
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  accountability_partner: number | User | null; // Can be ID, User object, or null
}

interface DateObj {
  day: number;
  month: number;
  year: number;
  dateString: string; // YYYY-MM-DD format
  dayOfWeek?: number; // 0 = Sunday, 6 = Saturday (from getUTCDay())
}

//------------------------------------------------------------

const HabitTrackerContent: React.FC = React.memo(() => {
  const flameImage =
    "data:image/png;base64,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";

  const today = useMemo(() => new Date(), []); // Memoize today's date object
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  // Adjust currentDayIndex for Monday-first week view (0=Mon, 6=Sun)
  const currentDayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const daysOfWeekSmall = ["M", "T", "W", "T", "F", "S", "S"];
  const [weekOffset, setWeekOffset] = useState(0); // 0 means current week
  const [monthOffset, setMonthOffset] = useState(0); // 0 means current month
  const [activeView, setActiveView] = useState<"week" | "month">("week");

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // --- State for Create Habit Modal ---
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // --------------------- Accountability Functionality -------------------------
  const [showPartnerSection, setShowPartnerSection] = useState<boolean>(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showPartnerHabits, setShowPartnerHabits] = useState<boolean>(false);

  // Fetch the CSRF token when component mounts (or when modal becomes visible)
  useEffect(() => {
    const getCSRFToken = () => {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        let [name, value] = cookie.trim().split("=");
        if (name === "csrftoken") {
          return value;
        }
      }
      return null;
    };

    const token = getCSRFToken();
    setCsrfToken(token);
  }, []);

  // ----------------------------------  Accountability Handlers  ----------------------------------
  const handleTogglePartnerSection = () => {
    setShowPartnerSection((prev) => !prev);
    if (showPartnerSection) {
      setShowPartnerHabits(false);
      setSelectedPartner(null);
    }
  };

  const handlePartnerSelect = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowPartnerHabits(true);
  };

  const handleClosePartnerHabits = () => {
    setShowPartnerHabits(false);
    setSelectedPartner(null);
  };

  // --- Modal Handlers ---
  const handleShowCreateHabit = () => {
    setShowCreateHabit(true);
  };

  const handleCloseCreateHabit = () => {
    setShowCreateHabit(false);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowEditModal(true);
  };

  // --------------------  Data Fetching and Refreshing -------------------
  const fetchHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(BACKEND_BASE_URL + "api/habits/", {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorData}`);
      }

      const data: Habit[] = await response.json();
      setHabits(data);
    } catch (e: any) {
      console.error("Failed to fetch habits:", e);
      setError(e.message || "Failed to load habits.");
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Callback function passed to the CreateHabits modal
  const handleHabitSaved = () => {
    fetchHabits();
  };

  // Generate dates for current week view
  const dates = useMemo(() => {
    const tempDates = [];
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDayIndex + weekOffset * 7);
    startDate.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      tempDates.push({
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        dateString: date.toISOString().split("T")[0],
      });
    }
    return tempDates;
  }, [today, currentDayIndex, weekOffset]);

  // Generate all dates for current month view
  const monthDates = useMemo(() => {
    if (activeView !== "month") return [];

    const tempDates: DateObj[] = [];
    const targetMonthDate = new Date(today);
    targetMonthDate.setMonth(today.getMonth() + monthOffset);
    targetMonthDate.setDate(1);
    targetMonthDate.setUTCHours(0, 0, 0, 0);

    const year = targetMonthDate.getUTCFullYear();
    const month = targetMonthDate.getUTCMonth();

    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    for (let day = 1; day <= lastDayOfMonth; day++) {
      const date = new Date(Date.UTC(year, month, day));
      tempDates.push({
        day,
        month,
        year,
        dateString: date.toISOString().split("T")[0],
        dayOfWeek: date.getUTCDay(),
      });
    }
    return tempDates;
  }, [today, monthOffset, activeView]);

  // Get current month name for display
  const currentMonthName = useMemo(() => {
    const date = new Date(today);
    if (activeView === "month") {
      date.setMonth(today.getMonth() + monthOffset);
    } else {
      if (dates.length > 0) {
        date.setFullYear(dates[0].year, dates[0].month);
      }
    }
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  }, [today, weekOffset, monthOffset, activeView, dates]);

  // Handle navigation
  const handlePrevPeriod = () => {
    if (activeView === "month") setMonthOffset((prev) => prev - 1);
    else if (activeView === "week") setWeekOffset((prev) => prev - 1);
  };

  const handleNextPeriod = () => {
    if (activeView === "month") setMonthOffset((prev) => prev + 1);
    else if (activeView === "week") setWeekOffset((prev) => prev + 1);
  };

  const handleSwitchToToday = () => {
    if (activeView === "month") setMonthOffset(0);
    else if (activeView === "week") setWeekOffset(0);
  };

  // Helper to check future dates
  const isFutureDate = useCallback(
    (dateObj: { year: number; month: number; day: number }): boolean => {
      const clickedDate = new Date(
        Date.UTC(dateObj.year, dateObj.month, dateObj.day)
      );
      const todayDate = new Date();
      const todayUTCStart = new Date(
        Date.UTC(
          todayDate.getUTCFullYear(),
          todayDate.getUTCMonth(),
          todayDate.getUTCDate()
        )
      );
      return clickedDate > todayUTCStart;
    },
    []
  );

  // Helper to calculate streak
  const calculateStreak = (habit: Habit): number => {
    if (!habit.completions || Object.keys(habit.completions).length === 0)
      return 0;

    const completionDates = Object.keys(habit.completions)
      .filter((dateStr) => habit.completions[dateStr])
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (completionDates.length === 0) return 0;

    let currentStreak = 0;
    let expectedDate = new Date();
    expectedDate.setUTCHours(0, 0, 0, 0);

    const lastCompletionDate = new Date(completionDates[0] + "T00:00:00Z");
    const yesterday = new Date(expectedDate);
    yesterday.setUTCDate(expectedDate.getUTCDate() - 1);

    if (lastCompletionDate.getTime() < yesterday.getTime()) {
      return 0;
    }

    for (const dateStr of completionDates) {
      const completionDate = new Date(dateStr + "T00:00:00Z");
      if (
        currentStreak === 0 &&
        completionDate.getTime() < expectedDate.getTime()
      ) {
        expectedDate = new Date(yesterday);
      }

      if (completionDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
        expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
      } else if (completionDate.getTime() < expectedDate.getTime()) {
        break;
      }
    }
    return currentStreak;
  };

  // Toggle completion
  const toggleHabitCompletion = useCallback(
    async (
      habitId: number,
      dateObj: { day: number; month: number; year: number }
    ) => {
      const dateKey = new Date(
        Date.UTC(dateObj.year, dateObj.month, dateObj.day)
      )
        .toISOString()
        .split("T")[0];

      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const isCurrentlyCompleted = !!habit.completions[dateKey];
      const optimisticCompletions = { ...habit.completions };
      if (isCurrentlyCompleted) {
        delete optimisticCompletions[dateKey];
      } else {
        optimisticCompletions[dateKey] = true;
      }

      const optimisticStreak = calculateStreak({
        ...habit,
        completions: optimisticCompletions,
      });
      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completions: optimisticCompletions,
                streak_count: optimisticStreak,
              }
            : h
        )
      );

      try {
        const url = BACKEND_BASE_URL + `api/habits/${habitId}/mark_completed/`;
        const method = "POST";

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (csrfToken) {
          headers["X-CSRFToken"] = csrfToken;
        }

        const body = JSON.stringify({
          date: dateKey,
          completed: !isCurrentlyCompleted,
        });

        const response = await fetch(url, {
          method,
          headers,
          credentials: "include",
          body,
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(
            `Failed to update completion: ${response.status} ${errorData}`
          );
        }
      } catch (error) {
        console.error("Error toggling habit completion:", error);
        setHabits((prevHabits) =>
          prevHabits.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  completions: habit.completions,
                  streak_count: habit.streak_count,
                }
              : h
          )
        );
        setError(
          `Failed to update habit: ${habit.habit_name}. Please try again.`
        );
        setTimeout(() => setError(null), 3000);
      }
    },
    [habits, csrfToken]
  );

  // Helper to check if a date is today (for styling)
  const isTodayDate = useCallback((dateObj: DateObj): boolean => {
    const todayLocal = new Date();
    return (
      dateObj.day === todayLocal.getDate() &&
      dateObj.month === todayLocal.getMonth() &&
      dateObj.year === todayLocal.getFullYear()
    );
  }, []);

  // Helper function to get day of week abbreviation (Monday first)
  const getDayOfWeekAbbr = useCallback(
    (dayIndex: number): string => {
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      return daysOfWeekSmall[adjustedIndex];
    },
    [daysOfWeekSmall]
  );

  // Calculate dynamic width for habit name column
  const habitNameWidth = useMemo(() => {
    if (!habits.length) return 100;
    const longestName = habits.reduce(
      (maxLen, habit) => Math.max(maxLen, habit.habit_name.length),
      0
    );
    return Math.max(100, longestName * 16 + 20);
  }, [habits]);

  // Define CSS Grid template columns based on view
  const gridTemplateColumns = useMemo(
    () =>
      activeView === "week"
        ? `var(--habit-name-width) repeat(7, 1fr) auto`
        : `var(--habit-name-width) repeat(${monthDates.length}, minmax(35px, 1fr)) auto`,
    [activeView, monthDates.length]
  );

  const gridStyle = useMemo(
    () =>
      ({
        "--habit-name-width": `${habitNameWidth}px`,
        "--grid-template-columns": gridTemplateColumns,
      } as React.CSSProperties),
    [habitNameWidth, gridTemplateColumns]
  );

  return (
    <div className="habit-tracker">
      {/* Header */}
      <div className="journal-header d-flex justify-content-between align-items-center mb-4">
        <div className="col-lg-8 ps-0">
          <h1 className="habit-title fw-bold mb-0">Habits</h1>
          <p className="card-subtitle text-muted mb-2">
            Track and log your habits to improve your productivity and overall
            well-being.
          </p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <button
            className={`accountability-button ${
              showPartnerSection ? "active" : ""
            }`}
            onClick={handleTogglePartnerSection}
          >
            {showPartnerSection ? "Hide Partners" : "Accountability Partners"}
          </button>
        </div>
        {loading && (
          <div className="text-muted align-self-center">Loading habits...</div>
        )}
        {error && !loading && (
          <div className="alert alert-danger align-self-center px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Accountability Partners Section */}
      {showPartnerSection && (
        <AccountabilityManager
          onPartnerSelect={handlePartnerSelect}
          onRefreshHabits={fetchHabits}
        />
      )}

      {/* Partner Habits View */}
      {showPartnerHabits && selectedPartner && (
        <PartnerHabitsView
          partner={selectedPartner}
          onClose={handleClosePartnerHabits}
          onHabitAdded={fetchHabits}
        />
      )}

      {/* Navigation only shown for calendar views */}
      {(activeView === "week" || activeView === "month") && (
        <div className="month-navigation">
          <button
            className="nav-arrow"
            onClick={handlePrevPeriod}
            aria-label="Previous period"
            disabled={loading}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div id="month-button-wrapper">
            <button
              className="bubbly-button"
              onClick={handleSwitchToToday}
              disabled={loading}
            >
              {currentMonthName}
            </button>
          </div>
          <button
            className="nav-arrow"
            onClick={handleNextPeriod}
            aria-label="Next period"
            disabled={loading}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {/* View Toggle */}
      <div className="view-toggle mb-3">
        <button
          className={`toggle-btn ${activeView === "week" ? "active" : ""}`}
          onClick={() => setActiveView("week")}
          disabled={loading}
        >
          Week
        </button>
        <button
          className={`toggle-btn ${activeView === "month" ? "active" : ""}`}
          onClick={() => setActiveView("month")}
          disabled={loading}
        >
          Month
        </button>
      </div>

      {/* CALENDAR VIEWS */}
      {!loading &&
        habits.length > 0 &&
        (activeView === "week" || activeView === "month") && (
          <div className={`habit-grid-wrapper ${activeView}-view`}>
            {/* WEEK VIEW */}
            {activeView === "week" && (
              <div
                className="habit-grid"
                style={gridStyle}
              >
                <div className="grid-cell empty-cell non-interactive"></div>
                {daysOfWeek.map((day, index) => (
                  <div
                    key={day}
                    className={`grid-cell header-cell non-interactive ${
                      isTodayDate(dates[index]) ? "current-day" : ""
                    }`}
                  >
                    {day}
                  </div>
                ))}
                <div className="grid-cell header-cell streak-header non-interactive">
                  Streak
                </div>

                <div className="grid-cell empty-cell non-interactive"></div>
                {dates.map((date, index) => (
                  <div
                    key={`date-${index}`}
                    className={`grid-cell date-cell non-interactive ${
                      isTodayDate(date) ? "current-day" : ""
                    }`}
                  >
                    {date.month !== today.getMonth() && (
                      <span className="month-abbrev">
                        {new Date(date.year, date.month, 1).toLocaleString(
                          "default",
                          { month: "short" }
                        )}
                      </span>
                    )}
                    {date.day}
                  </div>
                ))}
                <div className="grid-cell empty-cell non-interactive"></div>

                {habits.map((habit) => (
                  <React.Fragment key={habit.id}>
                    <button
                      className="grid-cell habit-name bubbly-button non-interactive button-with-dots"
                      id="habit-name-button"
                      style={{
                        minWidth: habitNameWidth,
                        border: "none",
                        color: "inherit",
                        fontWeight: "inherit",
                        fontSize: "inherit",
                      }}
                      onClick={() => handleEditHabit(habit)}
                      title="Edit habit"
                    >
                      {habit.habit_name}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        fill="currentColor"
                        className="bi bi-three-dots ms-3 mb-4"
                        viewBox="0 0 16 16"
                      >
                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                      </svg>
                    </button>

                    {dates.map((date, index) => {
                      const isFuture = isFutureDate(date);
                      const isCompleted = !!habit.completions[date.dateString];
                      const isCurrent = isTodayDate(date);
                      return (
                        <div
                          key={`${habit.id}-${date.dateString}`}
                          className={`grid-cell habit-cell ${
                            isCompleted ? "completed" : "not-completed"
                          } ${isFuture ? "future-date" : ""} ${
                            isCurrent ? "current-day" : ""
                          }`}
                          style={{
                            backgroundColor: isCompleted
                              ? habit.habit_colour
                              : "",
                            cursor: isFuture ? "not-allowed" : "pointer",
                            opacity: isFuture ? 0.6 : 1,
                          }}
                          onClick={() =>
                            !isFuture && toggleHabitCompletion(habit.id, date)
                          }
                          role="button"
                          aria-pressed={isCompleted}
                          aria-label={`Mark ${habit.habit_name} ${
                            isCompleted ? "incomplete" : "complete"
                          } for ${date.dateString}`}
                        >
                          {isCompleted && (
                            <div className="check-icon">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M5 13l4 4L19 7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="grid-cell streak-cell non-interactive">
                      {calculateStreak(habit) > 0 ? (
                        <div className="streak-counter">
                          <span className="flame-icon">
                            <svg
                              width="44"
                              height="44"
                              viewBox="0 0 44 44"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              xlinkHref="http://www.w3.org/1999/xlink"
                            >
                              <rect
                                width="44"
                                height="44"
                                fill="url(#pattern0_419_196)"
                                fillOpacity="0.7"
                              />
                              <defs>
                                <pattern
                                  id="pattern0_419_196"
                                  patternContentUnits="objectBoundingBox"
                                  width="1"
                                  height="1"
                                >
                                  <use
                                    xlinkHref="#image0_419_196"
                                    transform="scale(0.00195312)"
                                  />
                                </pattern>
                                <image
                                  id="image0_419_196"
                                  width="512"
                                  height="512"
                                  preserveAspectRatio="none"
                                  xlinkHref={flameImage}
                                />
                              </defs>
                            </svg>
                          </span>
                          <span>{calculateStreak(habit)}</span>
                        </div>
                      ) : (
                        <div className="no-streak"></div>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* MONTH VIEW */}
            {activeView === "month" && (
              <div
                className="habit-grid month-view "
                style={gridStyle}
              >
                <div className="grid-cell empty-cell non-interactive"></div>
                {monthDates.map((date) => (
                  <div
                    key={`month-day-${date.dateString}`}
                    className={`month-cell day-header non-interactive ${
                      isTodayDate(date) ? "current-day" : ""
                    }`}
                  >
                    <div className="day-header-content">
                      <div className="day-of-week">
                        {typeof date.dayOfWeek === "number"
                          ? getDayOfWeekAbbr(
                              date.dayOfWeek === 0 ? 6 : date.dayOfWeek - 1
                            )
                          : ""}
                      </div>
                      <div
                        className={`day-number ${
                          isTodayDate(date) ? "today" : ""
                        }`}
                      >
                        {date.day}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="grid-cell header-cell streak-header non-interactive">
                  Streak
                </div>

                {habits.map((habit) => (
                  <React.Fragment key={habit.id}>
                    <button
                      className="grid-cell habit-name bubbly-button non-interactive button-with-dots"
                      id="habit-name-button"
                      style={{
                        minWidth: habitNameWidth,
                        border: "none",
                        color: "inherit",
                        fontWeight: "inherit",
                        fontSize: "inherit",
                      }}
                      onClick={() => handleEditHabit(habit)}
                      title="Edit habit"
                    >
                      {habit.habit_name}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        fill="currentColor"
                        className="bi bi-three-dots ms-3 mb-4"
                        viewBox="0 0 16 16"
                      >
                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                      </svg>
                    </button>
                    {/* MONTH VIEW */}
                    {monthDates.map((date) => {
                      const isFuture = isFutureDate(date);
                      const isCompleted = !!habit.completions[date.dateString];
                      const isCurrent = isTodayDate(date);
                      return (
                        <div
                          key={`${habit.id}-${date.dateString}`}
                          className={`grid-cell habit-cell ${
                            isCompleted ? "completed" : "not-completed"
                          } ${isFuture ? "future-date" : ""} ${
                            isCurrent ? "current-day" : ""
                          }`}
                          style={{
                            backgroundColor: isCompleted
                              ? habit.habit_colour
                              : "",
                            cursor: isFuture ? "not-allowed" : "pointer",
                            opacity: isFuture ? 0.6 : 1,
                          }}
                          onClick={() =>
                            !isFuture && toggleHabitCompletion(habit.id, date)
                          }
                          role="button"
                          aria-pressed={isCompleted}
                          aria-label={`Mark ${habit.habit_name} ${
                            isCompleted ? "incomplete" : "complete"
                          } for ${date.dateString}`}
                        >
                          {isCompleted && (
                            <div className="check-icon">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M5 13l4 4L19 7"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="grid-cell streak-cell non-interactive">
                      {calculateStreak(habit) > 0 ? (
                        <div className="streak-counter">
                          <span className="flame-icon">
                            <svg
                              width="44"
                              height="44"
                              viewBox="0 0 44 44"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              xlinkHref="http://www.w3.org/1999/xlink"
                            >
                              <rect
                                width="44"
                                height="44"
                                fill="url(#pattern0_419_196)"
                                fillOpacity="0.7"
                              />
                              <defs>
                                <pattern
                                  id="pattern0_419_196"
                                  patternContentUnits="objectBoundingBox"
                                  width="1"
                                  height="1"
                                >
                                  <use
                                    xlinkHref="#image0_419_196"
                                    transform="scale(0.00195312)"
                                  />
                                </pattern>
                                <image
                                  id="image0_419_196"
                                  width="512"
                                  height="512"
                                  preserveAspectRatio="none"
                                  xlinkHref={flameImage}
                                />
                              </defs>
                            </svg>
                          </span>
                          <span>{calculateStreak(habit)}</span>
                        </div>
                      ) : (
                        <div className="no-streak"></div>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Placeholder/Message when no habits */}
      {!loading && habits.length === 0 && (
        <div className="text-center text-muted my-5">
          No habits added yet. Click "+ New Habit" to get started!
        </div>
      )}

      {/* Add New Habit Button */}
      <button
        className="add-habit-btn my-5"
        onClick={handleShowCreateHabit}
        disabled={loading}
      >
        + New Habit
      </button>

      {/* CreateHabits Modal */}
      <CreateHabits
        show={showCreateHabit}
        handleClose={handleCloseCreateHabit}
        onSuccessCallback={handleHabitSaved}
      />

      <EditHabit
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        onSuccessCallback={fetchHabits}
        habit={editingHabit}
        fetchHabits={fetchHabits}
      />
    </div>
  );
});

HabitTrackerContent.displayName = "HabitTrackerContent";

const HabitTracker: React.FC = () => {
  return (
    <AccountabilityStreamProvider>
      <HabitTrackerContent />
    </AccountabilityStreamProvider>
  );
};
HabitTracker.displayName = "HabitTracker";

export default HabitTracker;
