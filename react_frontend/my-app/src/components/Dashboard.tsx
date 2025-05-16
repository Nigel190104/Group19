/**
 * Dashboard Component
 *
 * The central hub of the BetterDays application, providing an overview of all
 * user activities and data across personal journals, work tasks, and habits.
 *
 * Features:
 * - Quick statistics summary of all user activities
 * - Mood trends and analytics visualisation
 * - Recent journal entries preview with navigation
 * - Pending work tasks with completion functionality
 * - Today's habits with toggle functionality
 * - Top habit streaks highlighting user consistency
 * - Recent work notes with completion statistics
 * - Daily inspirational quotes for motivation
 *
 * This component aggregates data from multiple sources and provides quick access
 * to all major features of the application, serving as the primary landing page
 * after authentication.
 */

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import BACKEND_BASE_URL from "../Constants";
import CryptoJS from "crypto-js";
import "./css/Dashboard.css";
import MoodAnalytics from "./MoodAnalytics";
import InspirationQuote from "./InspirationQuote";

//--------------------------interfaces-----------------------------------
interface Note {
  id: string;
  note_caption: string;
  note_content: string;
  note_date_created: string | null;
  mood_subcategory: number | null;
}

interface WorkNote {
  id: string;
  title: string;
  content: string;
  date_created: string;
  tasks: Task[];
}

interface Task {
  id: string;
  task_name: string;
  description: string;
  completed: boolean;
  time_spent: number;
  date_created: string;
}

interface MoodSubcategory {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
  description: string;
  mbti_insight: string;
}

interface Habit {
  id: number;
  habit_name: string;
  habit_description: string | null;
  habit_colour: string;
  completions: Record<string, boolean>;
  streak_count: number;
  last_completed: string | null;
}
//--------------------------interfaces-----------------------------------

const Dashboard: React.FC = () => {
  //--------------------------navigation-----------------------------------

  const navigateToJournal = () =>
    navigate("/journal", { state: { journalType: "personal" } });
  const navigateToWorkJournal = () =>
    navigate("/journal", { state: { journalType: "work" } });
  const navigateToHabits = () => navigate("/habits");
  const navigateToFeed = () => navigate("/feed");
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || "";

  //--------------------------states-----------------------------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [journalNotes, setJournalNotes] = useState<Note[]>([]);
  const [workNotes, setWorkNotes] = useState<WorkNote[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [moodSubcategories, setMoodSubcategories] = useState<MoodSubcategory[]>(
    []
  );
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([]);
  const [todaysHabits, setTodaysHabits] = useState<
    { habit: Habit; completed: boolean }[]
  >([]);
  const [habitStreaks, setHabitStreaks] = useState<
    { habit: Habit; streak: number }[]
  >([]);
  const [recentMoods, setRecentMoods] = useState<
    { date: string; mood: string; category: string }[]
  >([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const { userId } = useContext(AuthContext);

  //--------------------------streak calculation logic-----------------------------------
  const calculateCurrentStreak = (habit: Habit): number => {
    // If no completions --> return 0
    if (!habit.completions || Object.keys(habit.completions).length === 0)
      return 0;

    // Get all dates with completions and sort them (newest first)
    const completionDates = Object.keys(habit.completions)
      .filter((date) => habit.completions[date]) // Only where value is true
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Sort descending

    if (completionDates.length === 0) return 0;

    // Start from the most recent completion
    let currentStreak = 1;
    let previousDate = new Date(completionDates[0]);
    previousDate.setHours(0, 0, 0, 0);

    // Check if the most recent completion is from today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mostRecentCompletion = new Date(completionDates[0]);
    mostRecentCompletion.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // If the most recent completion is not from today or yesterday, no active streak
    if (
      mostRecentCompletion.getTime() !== today.getTime() &&
      mostRecentCompletion.getTime() !== yesterday.getTime()
    ) {
      return 0;
    }

    // Check consecutive days, working backward from the most recent
    for (let i = 1; i < completionDates.length; i++) {
      const currentDate = new Date(completionDates[i]);
      currentDate.setHours(0, 0, 0, 0);

      // Calculate difference in days
      const diffTime = previousDate.getTime() - currentDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // If this is the next consecutive day (1 day difference), increase streak
      if (diffDays === 1) {
        currentStreak++;
        previousDate = currentDate;
      }
      // If it's the same day (0 difference), just move the previous date
      else if (diffDays === 0) {
        previousDate = currentDate;
      }
      // If it's more than 1 day, the streak is broken
      else {
        break;
      }
    }

    return currentStreak;
  };

  //--------------------------data fetching-----------------------------------

  const fetchFollowers = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}api/follows/${userId}/following/`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch followers");
      }

      const data = await response.json();
      setFollowers(data);
    } catch (err: any) {
      console.error("Error fetching followers:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        fetchJournalNotes(),
        fetchWorkNotes(),
        fetchHabits(),
        fetchMoodSubcategories(),
        fetchFollowers(), // Add this line
      ])
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching dashboard data:", err);
          setError("Failed to load dashboard data. Please try again.");
          setLoading(false);
        });
    }
  }, [isAuthenticated]);

  // Process data after fetching
  useEffect(() => {
    if (workNotes.length > 0) {
      processWorkTasks();
    }

    if (habits.length > 0) {
      processTodaysHabits();
      processHabitStreaks();
    }

    if (journalNotes.length > 0 && moodSubcategories.length > 0) {
      processRecentMoods();
    }
  }, [workNotes, habits, journalNotes, moodSubcategories]);

  // Data fetching functions
  const fetchJournalNotes = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}api/notes/`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch journal notes");
      }

      const data = await response.json();

      // Decrypt notes if encryption key exists
      if (ENCRYPTION_KEY) {
        const decryptedNotes = data.map((note: Note) => {
          try {
            return {
              ...note,
              note_caption: decryptNote(note.note_caption, ENCRYPTION_KEY),
              note_content: decryptNote(note.note_content, ENCRYPTION_KEY),
            };
          } catch (error) {
            console.warn(`Failed to decrypt note ${note.id}:`, error);
            return note;
          }
        });
        setJournalNotes(decryptedNotes);
      } else {
        setJournalNotes(data);
      }
    } catch (err: any) {
      console.error("Error fetching journal notes:", err);
    }
  };

  const fetchWorkNotes = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}api/work-notes/`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch work notes");
      }

      const data = await response.json();

      // Decrypt work notes if encryption key exists
      if (ENCRYPTION_KEY) {
        const decryptedNotes = data.map((note: WorkNote) => {
          try {
            return {
              ...note,
              title: decryptNote(note.title, ENCRYPTION_KEY),
              content: decryptNote(note.content, ENCRYPTION_KEY),
              tasks: note.tasks.map((task) => ({
                ...task,
                task_name: decryptNote(task.task_name, ENCRYPTION_KEY),
                description: decryptNote(
                  task.description || "",
                  ENCRYPTION_KEY
                ),
              })),
            };
          } catch (error) {
            console.warn(`Failed to decrypt work note ${note.id}:`, error);
            return note;
          }
        });
        setWorkNotes(decryptedNotes);
      } else {
        setWorkNotes(data);
      }
    } catch (err: any) {
      console.error("Error fetching work notes:", err);
    }
  };

  const fetchHabits = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}api/habits/`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch habits");
      }

      const data = await response.json();
      setHabits(data);
    } catch (err: any) {
      console.error("Error fetching habits:", err);
    }
  };

  const fetchMoodSubcategories = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}api/mood-subcategories/`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch mood subcategories");
      }

      const data = await response.json();
      setMoodSubcategories(data);
    } catch (err: any) {
      console.error("Error fetching mood subcategories:", err);
    }
  };

  // Data processing functions
  const processWorkTasks = () => {
    // Get all incomplete tasks from all work notes
    const allTasks = workNotes.flatMap((note) =>
      note.tasks.filter((task) => !task.completed).map((task) => ({ ...task }))
    );

    // Sort by date created (newest first)
    const sortedTasks = allTasks.sort(
      (a, b) =>
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    );

    // Get the 5 most recent incomplete tasks
    setIncompleteTasks(sortedTasks.slice(0, 5));
  };

  const processTodaysHabits = () => {
    const today = new Date().toISOString().split("T")[0];
    const habitsForToday = habits.map((habit) => ({
      habit,
      completed: habit.completions && habit.completions[today] ? true : false,
    }));

    setTodaysHabits(habitsForToday);
  };

  const processHabitStreaks = () => {
    const streaks = habits
      .map((habit) => ({
        habit,
        streak: calculateCurrentStreak(habit),
      }))
      .filter((item) => item.streak > 0)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5); // Get top 5 streaks

    setHabitStreaks(streaks);
  };

  const processRecentMoods = () => {
    // Filter notes that have a mood subcategory
    const notesWithMoods = journalNotes
      .filter((note) => note.mood_subcategory !== null)
      .sort((a, b) => {
        const dateA = a.note_date_created
          ? new Date(a.note_date_created).getTime()
          : 0;
        const dateB = b.note_date_created
          ? new Date(b.note_date_created).getTime()
          : 0;
        return dateB - dateA; // Sort by most recent first
      })
      .slice(0, 5); // Get the 5 most recent entries with moods

    // Map the mood subcategory IDs to their names and categories
    const moods = notesWithMoods.map((note) => {
      const subcategory = moodSubcategories.find(
        (sub) => sub.id === note.mood_subcategory
      );

      return {
        date: note.note_date_created || "",
        mood: subcategory ? subcategory.name : "Unknown",
        category: subcategory ? subcategory.category.name : "Unknown",
      };
    });

    setRecentMoods(moods);
  };

  //--------------------------utility functionbs-----------------------------------

  const decryptNote = (ciphertext: string, key: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption error:", error);
      return ciphertext; // Return original if decryption fails
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return dateStr;
    }
  };

  //  handleToggleTask function in your Dashboard component
  const handleToggleTask = async (taskId: string) => {
    try {
      // Find the task to toggle
      const taskToToggle = incompleteTasks.find((task) => task.id === taskId);
      if (!taskToToggle) return;

      // Get CSRF token
      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      // Optimistic update for UI responsiveness
      setIncompleteTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );

      // Make API call to update the task
      const response = await fetch(
        `${BACKEND_BASE_URL}api/work-tasks/${taskId}/`,
        {
          method: "PATCH",
          headers: headers,
          body: JSON.stringify({
            completed: true,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      // Refresh work notes after successful toggle to update stats
      await fetchWorkNotes();

      // Also refresh tasks list
      processWorkTasks();
    } catch (err: any) {
      console.error("Error toggling task completion:", err);

      // Revert back if there was an error
      await fetchWorkNotes();
      processWorkTasks();

      // Show error message
      setError(`Failed to update task. Please try again.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  //  the handleToggleHabit function in your Dashboard component
  const handleToggleHabit = async (habitId: number) => {
    try {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const today = new Date().toISOString().split("T")[0];
      const isCurrentlyCompleted =
        habit.completions && habit.completions[today];

      // Get CSRF token
      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      // Optimistic update for UI responsiveness
      setTodaysHabits((currentHabits) =>
        currentHabits.map((item) =>
          item.habit.id === habitId
            ? { ...item, completed: !item.completed }
            : item
        )
      );

      // Make API call
      const url = `${BACKEND_BASE_URL}api/habits/${habitId}/mark_completed/`;
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify({
          date: today,
          completed: !isCurrentlyCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update habit: ${response.statusText}`);
      }

      // After successful toggle, refetch habits to get updated streak counts
      await fetchHabits();

      // Then process the updated habits data
      processTodaysHabits();
      processHabitStreaks();
    } catch (err: any) {
      console.error("Error toggling habit completion:", err);

      // Revert back if there was an error
      await fetchHabits();
      processTodaysHabits();
      processHabitStreaks();

      // Show error message
      setError(`Failed to update habit. Please try again.`);
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    }
  };

  // Utility to get CSRF token
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="text-muted">
          Welcome back! Here's your personal overview.
        </p>
      </div>

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card quote-card">
          <InspirationQuote />
        </div>

        <div className="dashboard-card stats-card">
          <div className="card-header">
            <h2>Quick Stats</h2>
          </div>
          <div className="card-body">
            <div className="stats-grid">
              <div className="stat-item">
                <h3>{journalNotes.length}</h3>
                <p>Journal Entries</p>
              </div>
              <div className="stat-item">
                <h3>{workNotes.length}</h3>
                <p>Work Notes</p>
              </div>
              <div className="stat-item">
                <h3>{followers.length}</h3>
                <p>Following</p>
              </div>
              <div className="stat-item">
                <h3>{habits.length}</h3>
                <p>Active Habits</p>
              </div>
              <div className="stat-item">
                <h3>
                  {workNotes.reduce(
                    (total, note) =>
                      total +
                      note.tasks.filter((task) => task.completed).length,
                    0
                  )}
                </h3>
                <p>Completed Tasks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Analytics Section */}
        <div className="dashboard-card mood-card">
          <div className="card-header">
            <h2>Mood Trends</h2>
            <button
              className="view-more-btn"
              onClick={navigateToJournal}
            >
              View Journal
            </button>
          </div>
          <div className="card-body">
            {journalNotes.length > 0 && moodSubcategories.length > 0 ? (
              <MoodAnalytics
                notes={journalNotes}
                moodSubcategories={moodSubcategories}
              />
            ) : (
              <div className="empty-state">
                <p>No mood data available yet.</p>
                <button
                  className="action-btn"
                  onClick={navigateToJournal}
                >
                  Add Journal Entry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Moods Section */}
        <div className="dashboard-card recent-moods-card">
          <div className="card-header">
            <h2>Recent Moods</h2>
          </div>
          <div className="card-body">
            {recentMoods.length > 0 ? (
              <div className="recent-moods-list">
                {recentMoods.map((item, index) => (
                  <div
                    key={index}
                    className="mood-item"
                  >
                    <div className="mood-date">{formatDate(item.date)}</div>
                    <div className="mood-details">
                      <span className="mood-name">{item.mood}</span>
                      <span className="mood-category">({item.category})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No mood data recorded yet.</p>
                <button
                  className="action-btn"
                  onClick={navigateToJournal}
                >
                  Add Journal Entry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pending Tasks Section */}
        <div className="dashboard-card tasks-card">
          <div className="card-header">
            <h2>Pending Tasks</h2>
            <button
              className="view-more-btn"
              onClick={navigateToWorkJournal}
            >
              View All
            </button>
          </div>
          <div className="card-body">
            {incompleteTasks.length > 0 ? (
              <div className="tasks-list">
                {incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="task-item"
                  >
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => handleToggleTask(task.id)}
                      className="task-checkbox"
                    />
                    <div className="task-content">
                      <h4>{task.task_name}</h4>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      <span className="task-date">
                        Created: {formatDate(task.date_created)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No pending tasks.</p>
                <button
                  className="action-btn"
                  onClick={navigateToWorkJournal}
                >
                  Create Work Note
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Today's Habits Section with toggle functionality */}
        <div className="dashboard-card habits-card">
          <div className="card-header">
            <h2>Today's Habits</h2>
            <button
              className="view-more-btn"
              onClick={navigateToHabits}
            >
              View All
            </button>
          </div>
          <div className="card-body">
            {todaysHabits.length > 0 ? (
              <div className="habits-list">
                {todaysHabits.map(({ habit, completed }) => (
                  <div
                    key={habit.id}
                    className="habit-item"
                    onClick={() => handleToggleHabit(habit.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className={`habit-checkbox ${
                        completed ? "completed" : ""
                      }`}
                      style={{
                        backgroundColor: completed ? habit.habit_colour : "",
                      }}
                    >
                      {completed && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="habit-details">
                      <span className="habit-name">{habit.habit_name}</span>
                      {calculateCurrentStreak(habit) > 0 && (
                        <span className="habit-streak">
                          <span className="flame-icon">🔥</span>
                          {calculateCurrentStreak(habit)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No habits created yet.</p>
                <button
                  className="action-btn"
                  onClick={navigateToHabits}
                >
                  Add Habits
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Top Streaks Section */}
        <div className="dashboard-card streaks-card">
          <div className="card-header">
            <h2>Top Streaks</h2>
          </div>
          <div className="card-body">
            {habitStreaks.length > 0 ? (
              <div className="streaks-list">
                {habitStreaks.map(({ habit, streak }, index) => (
                  <div
                    key={habit.id}
                    className="streak-item"
                  >
                    <div className="streak-rank">{index + 1}</div>
                    <div
                      className="streak-color"
                      style={{ backgroundColor: habit.habit_colour }}
                    ></div>
                    <div className="streak-details">
                      <span className="streak-name">{habit.habit_name}</span>
                      <span className="streak-count">
                        <span className="flame-icon">🔥</span>
                        {streak} day{streak !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No active streaks yet.</p>
                <button
                  className="action-btn"
                  onClick={navigateToHabits}
                >
                  Complete Habits
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Journal Entries */}
        <div className="dashboard-card mood-card">
          <div className="card-header">
            <h2>Recent Journal Entries</h2>
            <button
              className="view-more-btn"
              onClick={navigateToJournal}
            >
              View All
            </button>
          </div>
          <div className="card-body">
            {journalNotes.length > 0 ? (
              <div className="journal-entries-list">
                {journalNotes
                  .sort((a, b) => {
                    const dateA = a.note_date_created
                      ? new Date(a.note_date_created).getTime()
                      : 0;
                    const dateB = b.note_date_created
                      ? new Date(b.note_date_created).getTime()
                      : 0;
                    return dateB - dateA;
                  })
                  .slice(0, 3)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="journal-entry"
                    >
                      <div className="entry-date">
                        {entry.note_date_created
                          ? formatDate(entry.note_date_created)
                          : "No date"}
                      </div>
                      <h4 className="entry-title">{entry.note_caption}</h4>
                      <p className="entry-preview">
                        {entry.note_content.length > 100
                          ? `${entry.note_content.substring(0, 100)}...`
                          : entry.note_content}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No journal entries yet.</p>
                <button
                  className="action-btn"
                  onClick={navigateToJournal}
                >
                  Create Journal Entry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Work Notes */}
        <div className="dashboard-card work-card">
          <div className="card-header">
            <h2>Recent Work Notes</h2>
          </div>
          <div className="card-body">
            {workNotes.length > 0 ? (
              <div className="work-notes-list">
                {workNotes
                  .sort(
                    (a, b) =>
                      new Date(b.date_created).getTime() -
                      new Date(a.date_created).getTime()
                  )
                  .slice(0, 3)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="work-note"
                    >
                      <div className="note-date">
                        {formatDate(note.date_created)}
                      </div>
                      <h4 className="note-title">{note.title}</h4>
                      <p className="note-preview">
                        {note.content.length > 100
                          ? `${note.content.substring(0, 100)}...`
                          : note.content}
                      </p>
                      <div className="note-stats">
                        <span className="task-count">
                          {note.tasks.length} task
                          {note.tasks.length !== 1 ? "s" : ""}
                        </span>
                        <span className="completion-rate">
                          {note.tasks.length > 0
                            ? `${Math.round(
                                (note.tasks.filter((t) => t.completed).length /
                                  note.tasks.length) *
                                  100
                              )}% completed`
                            : "No tasks"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No work notes yet.</p>
                <button
                  className="action-btn"
                  onClick={navigateToWorkJournal}
                >
                  Create Work Note
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Coming Soon: Feed */}
        {/* <div className="dashboard-card feed-card">
          <div className="card-header">
            <h2>Feed</h2>
          </div>
          <div className="card-body coming-soon">
            <div className="coming-soon-content">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <h3>Coming Soon</h3>
              <p>Your activity feed will be available here.</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
