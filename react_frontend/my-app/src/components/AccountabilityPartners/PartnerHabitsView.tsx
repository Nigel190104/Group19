// src/AccountabilityPartners/PartnerHabitsView.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAccountabilityStream } from "./AccountabilityStreamProvider";
import { Partner, Habit } from "../../AccountabilityUtility";

interface PartnerHabitsViewProps {
  partner: Partner | null;
  onClose: () => void;
  onHabitAdded: () => void;
}

const PartnerHabitsView: React.FC<PartnerHabitsViewProps> = ({
  partner,
  onClose,
  onHabitAdded,
}) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedHabits, setCopiedHabits] = useState<Record<number, boolean>>({});

  // Use the accountability stream context
  const { getPartnerHabits, copyHabit, error, lastHabitUpdate } =
    useAccountabilityStream();

  // Fetch partner habits when the partner changes
  useEffect(() => {
    if (!partner) return;

    setLoading(true);

    // Fetch partner habits
    const fetchHabits = async () => {
      try {
        const data = await getPartnerHabits(partner.id);
        setHabits(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching partner habits:", err);
        setLoading(false);
      }
    };

    fetchHabits();
  }, [partner, getPartnerHabits, lastHabitUpdate]);

  const handleCopyHabit = async (habitId: number) => {
    const result = await copyHabit(habitId);

    if (result) {
      setCopiedHabits((prev) => ({ ...prev, [habitId]: true }));
      onHabitAdded(); // Refresh the main habits list
    }
  };

  // Helper to check if a habit was completed today
  const isCompletedToday = useCallback((habit: Habit): boolean => {
    if (!habit.completions) return false;

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return !!habit.completions[today];
  }, []);

  // Helper to get the most recent completion date
  const getLastCompletedDate = useCallback((habit: Habit): string | null => {
    if (!habit.completions || Object.keys(habit.completions).length === 0) {
      return null;
    }

    const completionDates = Object.entries(habit.completions)
      .filter(([_, isCompleted]) => isCompleted)
      .map(([dateStr]) => dateStr)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return completionDates[0] || null;
  }, []);

  // Helper to format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate streak based on completions
  const calculateManualStreak = useCallback((habit: Habit): number => {
    if (!habit.completions || Object.keys(habit.completions).length === 0) {
      return 0;
    }

    // Convert completions to array of dates and sort descending
    const completionDates = Object.entries(habit.completions)
      .filter(([_, isCompleted]) => isCompleted)
      .map(([dateStr]) => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());

    if (completionDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the most recent completion is from today or yesterday
    const mostRecentDate = completionDates[0];
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (mostRecentDate < yesterday) {
      return 0; // Streak broken if most recent date is before yesterday
    }

    let currentStreak = 1;
    let expectedDate = new Date(mostRecentDate);

    // If most recent is today, start checking from yesterday
    if (mostRecentDate.getTime() === today.getTime()) {
      expectedDate.setDate(expectedDate.getDate() - 1);
    }

    // Check consecutive days
    for (let i = 1; i < completionDates.length; i++) {
      const currentDate = completionDates[i];

      // Format both dates to YYYY-MM-DD for comparison
      const expectedDateStr = expectedDate.toISOString().split("T")[0];
      const currentDateStr = currentDate.toISOString().split("T")[0];

      if (expectedDateStr === currentDateStr) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break; // Streak broken
      }
    }

    return currentStreak;
  }, []);

  if (!partner) {
    return null;
  }

  return (
    <div className="partner-habits-container">
      <div className="partner-habits-header d-flex justify-content-between align-items-center mb-3">
        <h2>{partner.username}'s Habits</h2>
        <button
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center">Loading habits...</div>
      ) : habits.length > 0 ? (
        <div className="partner-habits-list">
          {habits.map((habit) => {
            const completedToday = isCompletedToday(habit);
            const isCopied = copiedHabits[habit.id];

            const streakCount =
              habit.streak_count > 0
                ? habit.streak_count
                : calculateManualStreak(habit);

            const lastCompletedDate =
              habit.last_completed || getLastCompletedDate(habit);

            return (
              <div
                key={habit.id}
                className="partner-habit-card"
              >
                <div className="habit-details">
                  <h3 className="habit-name">{habit.habit_name}</h3>
                  {habit.habit_description && (
                    <p className="habit-description">
                      {habit.habit_description}
                    </p>
                  )}
                  <div className="habit-meta">
                    <span
                      className="habit-color-indicator"
                      style={{
                        backgroundColor:
                          habit.habit_colour !== "NO_COL"
                            ? habit.habit_colour
                            : "#cccccc",
                      }}
                    ></span>
                    <span className="streak-count">
                      <i className="bi bi-fire"></i> {streakCount}
                    </span>
                    <span className="last-completed">
                      Last completed: {formatDate(lastCompletedDate)}
                    </span>
                    <span
                      className={`completed-today ${
                        completedToday ? "is-completed" : ""
                      }`}
                    >
                      {completedToday
                        ? "Completed today ✓"
                        : "Not completed today"}
                    </span>
                    <span className="frequency">
                      Frequency:{" "}
                      {habit.habit_frequency === 1
                        ? "Daily"
                        : `Every ${habit.habit_frequency} days`}
                    </span>
                  </div>
                </div>
                <div className="habit-actions">
                  <button
                    className={`btn ${
                      isCopied ? "btn-success" : "btn-primary"
                    }`}
                    onClick={() => handleCopyHabit(habit.id)}
                    disabled={isCopied}
                  >
                    {isCopied ? "Added to Your Habits" : "Add to My Habits"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-muted">
          {partner.username} doesn't have any habits yet.
        </div>
      )}
    </div>
  );
};

export default PartnerHabitsView;
