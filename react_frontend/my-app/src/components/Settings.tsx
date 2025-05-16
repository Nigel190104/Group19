/**
 * Settings Component
 *
 * Comprehensive user settings interface for the BetterDays app with three main sections:
 * - Accessibility: Text size, color themes, contrast modes, and motion settings
 * - Profile: User information, avatar management, and bio editing
 * - Notifications: Email and reminder preferences
 *
 * Features authentication verification, synchronization with backend API,
 * and real-time preview of accessibility options.
 */

import React, { useState, useEffect, useRef, useContext } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAccessibility } from '../context/AccessibilityContext';
import "./css/Settings.css";
import BACKEND_BASE_URL from "../Constants";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";

type TextSizeOption = "Small" | "Normal" | "Larger" | "Largest";
type ColourTheme =
  | "Default"
  | "Sky"
  | "Forest"
  | "Amethyst"
  | "Blossom"
  | "Halow"
  | "Pastel"
  | "Monochrome"
  | "Verdant"
  | "Rustic"
  | "Beach"
  | "Night";

// Utility to detect and remove circular references
const safeStringify = (obj: any): string => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  });
};
interface StreakResult {
  habitName: string;
  streak: number;
}
// Simple sanitization to prevent XSS without encoding HTML entities
const sanitize = (input: string | undefined): string => {
  if (!input) return '';
  // Remove dangerous characters that could form script tags or attributes
  return input.replace(/[<>]/g, '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

interface EmailNotifications {
  weeklyProgressSummary: boolean;
  streakAlerts: boolean;
  communityDigest: boolean;
}

interface UserData {
  email: string;
  username: string;
  // other user fields...
}

interface IncompleteHabit {
  habitName: string;
  streak: number;
}

interface MoodSubcategory {
  id: number;
  name: string;
  // Add other properties if they exist in your mood subcategory model
}

interface MoodTrend {
  mood: string;
  count: number;
}

// Type for notes response to ensure correct typing
interface Note {
  note_date_created: string;
  mood_subcategory?: number;
}

interface IncompleteTask {
  taskName: string;
  dueDate?: string;
}

interface IncompleteHabit {
  habitName: string;
  streak: number;
}

interface CompletedTask {
  taskName: string;
  completionDate: string;
}


interface CompletedHabit {
  habitName: string;
  completionDate: string;
}

interface WeeklySummaryData {
  habitsCompleted: number;
  tasksCompleted: number;
  journalEntries: number;
  moodTrends: { mood: string; count: number }[];
  topStreaks: { habitName: string; streak: number }[];
}

interface DailyReminderData {
  userEmail: string;
  userName: string;
  incompleteTasks: IncompleteTask[];
  incompleteHabits: IncompleteHabit[];
  moodTrends: MoodTrend[];
  currentDate: string;
}

interface WeeklySummaryData {
  completedTasks: CompletedTask[];
  incompleteTasks: IncompleteTask[];
  completedHabits: CompletedHabit[];
  incompleteHabits: IncompleteHabit[];
  journalEntries: number;
  moodTrends: MoodTrend[];
  topStreaks: { habitName: string; streak: number }[];
  habitsCompleted: number;
  tasksCompleted: number;
}

// Email service
const emailService = {
    sendWeeklySummary: async (email: string, data: WeeklySummaryData): Promise<boolean> => {
    try {
      // Format completed tasks as HTML
      const completedTasksHtml = data.completedTasks.length > 0
        ? `<ul style="padding-left: 20px;">${data.completedTasks
            .map(task => {
              const taskName = sanitize(task.taskName || 'Untitled Task');
              const completionDate = sanitize(task.completionDate || '');
              return `
                <li style="margin-bottom: 8px;">
                  <strong>${taskName}</strong>
                  ${completionDate ? `<span style="color: #95a5a6; font-size: 0.9em;"> (completed ${completionDate})</span>` : ''}
                </li>
              `;
            })
            .join('')}</ul>`
        : '<p>No tasks completed this week.</p>';

      // Format incomplete tasks as HTML
      const incompleteTasksHtml = data.incompleteTasks.length > 0
        ? `<ul style="padding-left: 20px;">${data.incompleteTasks
            .map(task => {
              const taskName = sanitize(task.taskName || 'Untitled Task');
              const dueDate = sanitize(task.dueDate || '');
              return `
                <li style="margin-bottom: 8px;">
                  <strong>${taskName}</strong>
                  ${dueDate ? `<span style="color: #95a5a6; font-size: 0.9em;"> (due ${dueDate})</span>` : ''}
                </li>
              `;
            })
            .join('')}</ul>`
        : '<p>No incomplete tasks this week.</p>';

      // Format completed habits as HTML
      const completedHabitsHtml = data.completedHabits.length > 0
        ? `<ul style="padding-left: 20px;">${data.completedHabits
            .map(habit => {
              const habitName = sanitize(habit.habitName || 'Untitled Habit');
              const completionDate = sanitize(habit.completionDate || '');
              return `
                <li style="margin-bottom: 8px;">
                  <strong>${habitName}</strong>
                  ${completionDate ? `<span style="color: #95a5a6; font-size: 0.9em;"> (completed ${completionDate})</span>` : ''}
                </li>
              `;
            })
            .join('')}</ul>`
        : '<p>No habits completed this week.</p>';

      // Format incomplete habits as HTML
      const incompleteHabitsHtml = data.incompleteHabits.length > 0
        ? `<ul style="padding-left: 20px;">${data.incompleteHabits
            .map(habit => {
              const habitName = sanitize(habit.habitName || 'Untitled Habit');
              const streak = Number(habit.streak || 0);
              return `
                <li style="margin-bottom: 8px;">
                  <strong>${habitName}</strong>
                  <span style="color: #3498db; font-size: 0.9em;">(current streak: ${streak} days)</span>
                </li>
              `;
            })
            .join('')}</ul>`
        : '<p>No incomplete habits this week.</p>';

      // Format mood trends as HTML
      const moodsHtml = data.moodTrends.length > 0
        ? `<div style="display: flex; flex-wrap: wrap; gap: 10px;">${data.moodTrends
            .map(mood => {
              const moodName = sanitize(mood.mood || 'Unknown');
              const count = Number(mood.count || 0);
              return `
                <div style="background-color: #f0e6f6; padding: 8px 12px; border-radius: 20px; font-size: 0.9em;">
                  ${moodName}: ${count} entries
                </div>
              `;
            })
            .join('')}</div>`
        : '<p>No mood trends recorded this week.</p>';

      // Format top streaks as HTML
      const topStreaksHtml = data.topStreaks.length > 0
        ? `<ul style="padding-left: 20px;">${data.topStreaks
            .map(streak => {
              const habitName = sanitize(streak.habitName || 'Untitled Habit');
              const streakCount = Number(streak.streak || 0);
              return `
                <li style="margin-bottom: 8px;">
                  <strong>${habitName}</strong>
                  <span style="color: #3498db; font-size: 0.9em;">(${streakCount} days)</span>
                </li>
              `;
            })
            .join('')}</ul>`
        : '<p>No streaks to report this week.</p>';

      const templateParams = {
        to_email: String(email || ''),
        journalEntries: String(data.journalEntries || 0),
        habitsCompleted: String(data.habitsCompleted || 0),  // Add this
        tasksCompleted: String(data.tasksCompleted || 0),
        completed_tasks_html: completedTasksHtml,
        incomplete_tasks_html: incompleteTasksHtml,
        completed_habits_html: completedHabitsHtml,
        incomplete_habits_html: incompleteHabitsHtml,
        moods_html: moodsHtml,
        top_streaks_html: topStreaksHtml,
        date_range: `Weekly Summary (${new Date().toLocaleDateString()})`,
        current_year: new Date().getFullYear().toString(),
        unsubscribe_link: `${BACKEND_BASE_URL}unsubscribe?email=${encodeURIComponent(email)}`,
        settings_link: `${BACKEND_BASE_URL}settings/notifications`
      };

      console.debug("EmailJS payload:", {
        service_id: "service_1vs6j3f",
        template_id: "template_gtnay7b",
        user_id: "UJIMEeKBbJGuF3TWi",
        template_params: templateParams
      });

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "service_1vs6j3f",
          template_id: "template_gtnay7b",
          user_id: "UJIMEeKBbJGuF3TWi",
          template_params: templateParams
        }),
      });

      if (!response.ok) throw new Error("Failed to send weekly summary");
      return true;
    } catch (error) {
      console.error("Error sending weekly summary:", error);
      return false;
    }
  },

  sendDailyReminder: async (email: string, data: DailyReminderData): Promise<boolean> => {
    try {
      // Sanitize and format tasks as HTML
      const tasksHtml = data.incompleteTasks.length > 0
        ? `<ul style="padding-left: 20px;">${data.incompleteTasks
            .map(task => {
              const taskName = sanitize(task.taskName || 'Untitled Task');
              const dueDate = sanitize(task.dueDate || '');
              return `
                <li style="margin-bottom: 8px;">
                  <strong>${taskName}</strong>
                  ${dueDate ? `<span style="color: #95a5a6; font-size: 0.9em;"> (due ${dueDate})</span>` : ''}
                </li>
              `;
            })
            .join('')}</ul>`
        : '';
      // Format habits as HTML
      const habitsHtml = data.incompleteHabits.length > 0
        ? `<ul style="padding-left: 20px;">${data.incompleteHabits
            .map(habit => {
              const habitName = sanitize(habit.habitName || 'Untitled Habit');
              const streak = Number(habit.streak || 0);
              return `
                <li style="margin-bottom: 8px;">
                  <strong>${habitName}</strong>
                  <span style="color: #3498db; font-size: 0.9em;">(current streak: ${streak} days)</span>
                </li>
              `;
            })
            .join('')}</ul>`
        : '';

      // Format moods as HTML
      const moodsHtml = data.moodTrends.length > 0
        ? `<div style="display: flex; flex-wrap: wrap; gap: 10px;">${data.moodTrends
            .map(mood => {
              const moodName = sanitize(mood.mood || 'Unknown');
              const count = Number(mood.count || 0);
              return `
                <div style="background-color: #f0e6f6; padding: 8px 12px; border-radius: 20px; font-size: 0.9em;">
                  ${moodName}: ${count} entries
                </div>
              `;
            })
            .join('')}</div>`
        : '';

      const templateParams = {
        to_email: String(email || ''),
        user_name: String(data.userName || 'User'),
        tasksHtml,
        habitsHtml,
        moodsHtml,
        currentDate: String(data.currentDate || new Date().toLocaleDateString()),
        currentYear: new Date().getFullYear().toString(),
        unsubscribeLink: `${BACKEND_BASE_URL}unsubscribe?email=${encodeURIComponent(email)}`,
        settingsLink: `${BACKEND_BASE_URL}settings/notifications`
      };

      console.debug("EmailJS payload:", {
        service_id: "service_1vs6j3f",
        template_id: "template_mry91s9",
        user_id: "UJIMEeKBbJGuF3TWi",
        template_params: templateParams
      });
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "service_1vs6j3f",
          template_id: "template_mry91s9",
          user_id: "UJIMEeKBbJGuF3TWi",
          template_params: templateParams
        }),
      });

      if (!response.ok) throw new Error("Failed to send daily reminder");
      return true;
    } catch (error) {
      console.error("Error sending daily reminder:", error);
      return false;
    }
  }
};

const dataService = {
  fetchIncompleteTasks: async (userId: number): Promise<DailyReminderData['incompleteTasks']> => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}api/work-tasks/?user=${userId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      
      const tasks = await response.json();
      
      // Filter for incomplete tasks (completed = false)
      return tasks
        .filter((task: any) => !task.completed)
        .map((task: any) => ({
          taskName: task.task_name,
          dueDate: task.due_date || undefined,
        }));
        
    } catch (error) {
      console.error("Error fetching incomplete tasks:", error);
      return [];
    }
  },

  fetchIncompleteHabits: async (userId: number): Promise<{
    incompleteHabits: DailyReminderData['incompleteHabits'];
    userEmail?: string;
    userName?: string;
    moodTrends: DailyReminderData['moodTrends'];
  }> => {
    try {
      const [habitsResponse, userResponse, notesResponse] = await Promise.all([
        fetch(`${BACKEND_BASE_URL}api/habits/?user=${userId}`, { credentials: "include" }),
        fetch(`${BACKEND_BASE_URL}api/users/${userId}/`, { credentials: "include" }),
        fetch(`${BACKEND_BASE_URL}api/notes/?user=${userId}`, { credentials: "include" }),
      ]);

      if (!habitsResponse.ok) throw new Error("Failed to fetch habits");
      if (!userResponse.ok) throw new Error("Failed to fetch user data");
      if (!notesResponse.ok) throw new Error("Failed to fetch notes");
      
      const habits = await habitsResponse.json();
      const userData = await userResponse.json();
      const notes = await notesResponse.json();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Filter habits that should be completed today but aren't
      const incompleteHabits = habits
        .filter((habit: any) => {
          // Check if habit should be completed today based on frequency
          const lastCompleted = habit.last_completed;
          const frequency = habit.habit_frequency || 1; // Default daily
          
          // If never completed, it's incomplete for today
          if (!lastCompleted) return true;
          
          // For daily habits, check if completed today
          if (frequency === 1) {
            return !habit.completions?.[today];
          }
          
          // For weekly/monthly habits, check if within frequency window
          const lastDate = new Date(lastCompleted);
          const daysSince = (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSince >= frequency;
        })
        .map((habit: any) => ({
          habitName: habit.habit_name,
          streak: habit.streak_count || 0,
        }));

      // Calculate mood trends for today
      const moodTrends: MoodTrend[] = [];
      const moodCounts: Record<string, number> = {};

      notes.filter((note: any) => note.mood_subcategory)
        .forEach((note: any) => {
            const moodName = note.mood_subcategory.name;
            moodCounts[moodName] = (moodCounts[moodName] || 0) + 1;
        });
        
      
      for (const [mood, count] of Object.entries(moodCounts)) {
        moodTrends.push({ mood, count });
      }


      return {
        incompleteHabits,
        userEmail: userData.email, // Return the user's email
        userName: userData.username,
        moodTrends
      };
        
    } catch (error) {
      console.error("Error fetching incomplete habits:", error);
      return {
        incompleteHabits: [],
        userEmail: undefined,
        userName: undefined,
        moodTrends: []
      };
    }
  },

  fetchWeeklySummaryData: async (userId: number): Promise<WeeklySummaryData> => {
    try {
      // Calculate date range (last 7 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      // Format dates for comparison
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      // Fetch all data in parallel
      const [habitsRes, tasksRes, notesRes] = await Promise.all([
        fetch(`${BACKEND_BASE_URL}api/habits/?user=${userId}`, { credentials: "include" }),
        fetch(`${BACKEND_BASE_URL}api/work-tasks/?user=${userId}`, { credentials: "include" }),
        fetch(`${BACKEND_BASE_URL}api/notes/?user=${userId}`, { credentials: "include" }),
      ]);

      if (!habitsRes.ok) throw new Error("Failed to fetch habits");
      if (!tasksRes.ok) throw new Error("Failed to fetch tasks");
      if (!notesRes.ok) throw new Error("Failed to fetch notes");

      const [habits, tasks, notes] = await Promise.all([
        habitsRes.json(),
        tasksRes.json(),
        notesRes.json(),
      ]);

      // Process completed tasks this week
      const completedTasks = tasks
        .filter((task: any) => 
          task.completed && 
          task.date_completed && 
          new Date(task.date_completed) >= startDate
        )
        .map((task: any) => ({
          taskName: task.task_name,
          completionDate: new Date(task.date_completed).toLocaleDateString()
        }));

      // Process incomplete tasks
      const incompleteTasks = tasks
        .filter((task: any) => !task.completed)
        .map((task: any) => ({
          taskName: task.task_name,
          dueDate: task.due_date || undefined
        }));

      // Process completed habits this week
      const completedHabits = habits
        .reduce((acc: CompletedHabit[], habit: any) => {
          if (!habit.completions) return acc;
          const completionsInWeek = Object.keys(habit.completions)
            .filter(date => 
              date >= formatDate(startDate) && 
              date <= formatDate(endDate) && 
              habit.completions[date]
            )
            .map(date => ({
              habitName: habit.habit_name,
              completionDate: new Date(date).toLocaleDateString()
            }));
          return [...acc, ...completionsInWeek];
        }, []);

      // Process incomplete habits
      const incompleteHabits = habits
        .filter((habit: any) => {
          const lastCompleted = habit.last_completed;
          const frequency = habit.habit_frequency || 1;
          const today = formatDate(new Date());
          
          if (!lastCompleted) return true;
          
          if (frequency === 1) {
            return !habit.completions?.[today];
          }
          
          const lastDate = new Date(lastCompleted);
          const daysSince = (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSince >= frequency;
        })
        .map((habit: any) => ({
          habitName: habit.habit_name,
          streak: habit.streak_count || 0
        }));

      // Process journal entries (notes) this week
      const journalEntries = notes
        .filter((note: any) => 
          new Date(note.note_date_created) >= startDate
        ).length;
      
      // Calculate mood trends for today
      const moodTrends: MoodTrend[] = [];
      const moodCounts: Record<string, number> = {};

      notes.filter((note: any) => note.mood_subcategory)
        .forEach((note: any) => {
            const moodName = note.mood_subcategory.name;
            moodCounts[moodName] = (moodCounts[moodName] || 0) + 1;
        });
        
      
      for (const [mood, count] of Object.entries(moodCounts)) {
        moodTrends.push({ mood, count });
      }


      const streaks = habits.map((habit: any) => {
            if (!habit.completions) return { habitName: habit.habit_name, streak: 0 };
            
            // Get all completion dates within the week
            const weekCompletions = Object.keys(habit.completions)
                .filter(date => 
                    date >= formatDate(startDate) && 
                    date <= formatDate(endDate) && 
                    habit.completions[date] === true
                )
                .sort(); // Sort dates chronologically
            
            // Calculate streaks within the week
            let maxStreak = 0;
            let currentStreak = 0;
            let prevDate: string | null = null;
            
            for (const date of weekCompletions) {
                if (!prevDate) {
                    currentStreak = 1;
                } else {
                    const prevDay = new Date(prevDate);
                    const currDay = new Date(date);
                    const dayDiff = (currDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24);
                    
                    if (dayDiff === 1) { // Consecutive day
                        currentStreak++;
                    } else { // Streak broken
                        maxStreak = Math.max(maxStreak, currentStreak);
                        currentStreak = 1;
                    }
                }
                prevDate = date;
            }
            
            // Check final streak
            maxStreak = Math.max(maxStreak, currentStreak);
            
            return {
                habitName: habit.habit_name,
                streak: maxStreak
            };
        });

      // Get top 3 streaks (filter out 0 streaks)
      const topStreaks = streaks
        .filter((habit: StreakResult) => habit.streak > 0)
        .sort((a: StreakResult, b: StreakResult) => b.streak - a.streak)
        .slice(0, 3);



      // Calculate counts for summary stats
      const habitsCompleted = completedHabits.length;
      const tasksCompleted = completedTasks.length;

      return {
        completedTasks,
        incompleteTasks,
        completedHabits,
        incompleteHabits,
        journalEntries,
        moodTrends,
        topStreaks,
        habitsCompleted,
        tasksCompleted
      };
      
    } catch (error) {
      console.error("Error fetching weekly summary data:", error);
      return {
        completedTasks: [],
        incompleteTasks: [],
        completedHabits: [],
        incompleteHabits: [],
        journalEntries: 0,
        moodTrends: [],
        topStreaks: [],
        habitsCompleted: 0,
        tasksCompleted: 0
      };
    }
  }
};


const Settings: React.FC = React.memo(() => {
  // Get auth context values and navigate function
  const {
    isAuthenticated,
    userId,
    username,
    profileImage: contextProfileImage,
    updateProfileImage,
    logout,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  // Debug auth context
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, userId, username, contextProfileImage, navigate]);
  
  // Accessibility States (using context)
  const {
    textSize,
    setTextSize,
    highContrastOutline,
    setHighContrastOutline,
    reduceMotion,
    setReduceMotion,
  } = useAccessibility();

  // // Accessibility States
  // const [textSize, setTextSize] = useState<TextSizeOption>("Normal");
  // const [monochromaticMode, setMonochromaticMode] = useState(false);
  // const [highContrastOutline, setHighContrastOutline] = useState(false);
  // const [reduceMotion, setReduceMotion] = useState(false);

  // Profile States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [localProfileImage, setLocalProfileImage] = useState<string | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [bio, setBio] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification States
  const [emailNotifications, setEmailNotifications] =
    useState<EmailNotifications>({
      weeklyProgressSummary: true,
      streakAlerts: true,
      communityDigest: true,
    });

  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'accessibility' | 'profile' | 'notifications'>('accessibility');

  // Use the theme context
  const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();

  // Update the local colorTheme state to reflect the global theme on mount
  useEffect(() => {
    setColorTheme(globalTheme as ColourTheme);
  }, [globalTheme]);

  // Local state for the color theme on the settings page
  const [colorTheme, setColorTheme] = useState<ColourTheme>(
    globalTheme as ColourTheme
  );

  // Email scheduling with precise timing
  useEffect(() => {
    if (!reminderEnabled || !email || !userId) return;

    let dailyTimeout: NodeJS.Timeout;
    let weeklyTimeout: NodeJS.Timeout;

    const scheduleEmails = () => {
      const now = new Date();
      
      // Schedule daily reminder at 8 AM
      const nextDaily = new Date(now);
      nextDaily.setHours(19, 40, 0, 0);
      if (now >= nextDaily) {
        nextDaily.setDate(nextDaily.getDate() + 1);
      }

      dailyTimeout = setTimeout(async () => {
        try {
          const incompleteTasks = await dataService.fetchIncompleteTasks(userId);
          const { incompleteHabits, userEmail, userName, moodTrends } = await dataService.fetchIncompleteHabits(userId);
          
          if (incompleteTasks.length > 0 || incompleteHabits.length > 0) {
            const success = await emailService.sendDailyReminder(email, {
              userEmail: userEmail || email,
              userName: userName || username,
              incompleteTasks,
              incompleteHabits,
              moodTrends,
              currentDate: new Date().toLocaleDateString()
            });
            
            if (success) {
              console.log(success)
            }
          }
        } catch (error) {
          console.error("Error sending daily reminder:", error);
        } finally {
          scheduleEmails(); // Reschedule
        }
      }, nextDaily.getTime() - now.getTime());

      // Schedule weekly summary on Sunday at 9 AM
      const nextWeekly = new Date(now);
      nextWeekly.setHours(19, 40, 0, 0);
      
      if (now >= nextWeekly) {
        nextWeekly.setDate(nextWeekly.getDate() + 1);
      }

      weeklyTimeout = setTimeout(async () => {
        try {
          const weeklyData = await dataService.fetchWeeklySummaryData(userId);
          const success = await emailService.sendWeeklySummary(email, weeklyData);
          
          if (success) {
            console.log(success)
          }
        } catch (error) {
          console.error(error);
        } finally {
          scheduleEmails(); // Reschedule
        }
      }, nextWeekly.getTime() - now.getTime());
    };

    scheduleEmails();

    return () => {
      clearTimeout(dailyTimeout);
      clearTimeout(weeklyTimeout);
    };
  }, [reminderEnabled, email]);

  // Load user data when component mounts
  useEffect(() => {
    // Check if we have a profile image in the context first
    if (contextProfileImage) {
      setLocalProfileImage(contextProfileImage);
      setImageLoaded(true);
      setImageError(false);
    } else {
      // Reset states when no profile image is in context
      setLocalProfileImage(null);
      setImageLoaded(false);
      setImageError(false);
    }

    const fetchUserData = async () => {
      if (!userId || !isAuthenticated) {
        return;
      }

      try {
        const response = await fetch(
          BACKEND_BASE_URL + `api/users/${userId}/`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Failed to fetch user data (${response.status}):`,
            errorText
          );

          // If unauthorized, might need to refresh authentication
          if (response.status === 401) {
            logout();
            navigate("/login");
            return;
          }

          throw new Error(
            `Failed to fetch user data: ${response.status} ${response.statusText}`
          );
        }

        const userData = await response.json();

        setName(userData.username || "");
        setEmail(userData.email || "");
        setBio(userData.bio || "");

        // Reset image states when fetching new data
        setImageLoaded(false);
        setImageError(false);

        // Handle profile image based on what the API returns
        if (userData.profile_image) {
          let fullImageUrl = userData.profile_image;

          // If it doesn't start with http, it's a relative path - prepend base URL
          if (!fullImageUrl.startsWith("http")) {
            fullImageUrl = BACKEND_BASE_URL + fullImageUrl;
          }

          setLocalProfileImage(fullImageUrl);
          // Update the context profile image
          updateProfileImage(fullImageUrl);

          // Test if the image URL is valid - this helps debug issues
          const testImg = new Image();
          testImg.onload = () => {
            setImageLoaded(true);
          };
          testImg.onerror = () => {
            console.error("Error loading image:", fullImageUrl);
            setImageError(true);
          };
          testImg.src = fullImageUrl;
        } else {
          setLocalProfileImage(null);
          // Update context with empty profile image
          updateProfileImage("");
        }

        // Load accessibility preferences if they exist
        if (userData.preferences) {
          setTextSize(userData.preferences.textSize || 'Normal');
          setHighContrastOutline(
            userData.preferences.highContrastOutline || false
          );
          setReduceMotion(userData.preferences.reduceMotion || false);
        }

        // Load notification preferences if they exist
        if (userData.notifications) {
          setEmailNotifications({
            weeklyProgressSummary:
              userData.notifications.weeklyProgressSummary ?? true,
            streakAlerts: userData.notifications.streakAlerts ?? true,
            communityDigest: userData.notifications.communityDigest ?? true,
          });
          setReminderEnabled(userData.notifications.reminderEnabled ?? true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [
    userId,
    isAuthenticated,
    logout,
    navigate,
    contextProfileImage,
    updateProfileImage,
    setTextSize,
    setHighContrastOutline,
    setReduceMotion,
  ]);

  // Update the global theme when the user selects a new theme
  const handleThemeChange = (newTheme: ColourTheme) => {
    setColorTheme(newTheme); // Update local state for immediate feedback
    setGlobalTheme(newTheme); // Update the global theme state
  };

  // // Apply theme, text size, contrast modes and reduce motion when they change
  // useEffect(() => {
  //   document.documentElement.setAttribute("data-theme", colorTheme);

  //   // Apply text size
  //   document.body.classList.remove(
  //     "text-size-small",
  //     "text-size-normal",
  //     "text-size-larger",
  //     "text-size-largest"
  //   );
  //   document.body.classList.add(`text-size-${textSize.toLowerCase()}`);

  //   // Apply high contrast outline mode only to containers
  //   const containers = document.querySelectorAll(
  //     ".settings-container, .settings-tabs, .settings-section"
  //   );
  //   containers.forEach((container) => {
  //     if (highContrastOutline) {
  //       container.classList.add("high-contrast-outline");
  //     } else {
  //       container.classList.remove("high-contrast-outline");
  //     }
  //   });

  //   // Apply reduce motion
  //   if (reduceMotion) {
  //     document.body.classList.add("reduce-motion");
  //   } else {
  //     document.body.classList.remove("reduce-motion");
  //   }
  // }, [
  //   colorTheme,
  //   textSize,
  //   highContrastOutline,
  //   reduceMotion,
  // ]);

  // Modified handleProfileImageChange to include file validation
  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic image validation
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Reset image states
      setImageLoaded(false);
      setImageError(false);

      // Set the selected file for later upload
      setSelectedFile(file);

      // Create a preview URL for display
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLocalProfileImage(result);
        setImageLoaded(true);
      };
      reader.onerror = () => {
        console.error("Error reading file:", file.name);
        setImageError(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        // Ensure we have a valid userId
        if (!userId) {
          throw new Error("Cannot delete account: Invalid user ID");
        }

        const response = await fetch(
          BACKEND_BASE_URL + `api/users/${userId}/`,
          {
            method: "DELETE",
            headers: {
              "X-CSRFToken":
                document.cookie
                  .split("; ")
                  .find((row) => row.startsWith("csrftoken="))
                  ?.split("=")[1] || "",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete account");
        }

        // Log the user out and redirect
        logout();
        navigate("/login");
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  // Modified handleSaveChanges for better error handling with images
  const handleSaveChanges = async () => {
    try {
      // Check for valid userId first
      if (!userId) {
        console.error("Cannot save changes: Invalid user ID");
        alert("Session expired. Please log in again.");
        logout();
        navigate("/login");
        return;
      }

      // Save profile changes
      if (activeTab === "profile") {
        // Use FormData to handle file uploads
        const formData = new FormData();
        formData.append("username", name);
        formData.append("email", email);

        if (bio) {
          formData.append("bio", bio);
        }

        // Only append the profile image if a new one was selected
        if (selectedFile) {
          formData.append("profile_image", selectedFile);
        }

        // Print out formData for debugging
        Array.from(formData.entries()).forEach((pair) => {});

        const response = await fetch(
          BACKEND_BASE_URL + `api/users/${userId}/`,
          {
            method: "PATCH",
            headers: {
              "X-CSRFToken":
                document.cookie
                  .split("; ")
                  .find((row) => row.startsWith("csrftoken="))
                  ?.split("=")[1] || "",
            },
            credentials: "include",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error:", errorText);

          // Handle session expiration
          if (response.status === 401) {
            alert("Session expired. Please log in again.");
            logout();
            navigate("/login");
            return;
          }

          throw new Error(`Failed to update profile: ${errorText}`);
        }

        // Update the profileImage state with the URL returned from the server
        const userData = await response.json();

        if (userData.profile_image) {
          let updatedImageUrl = userData.profile_image;

          // If it's not a full URL, prepend the backend base URL
          if (!updatedImageUrl.startsWith("http")) {
            updatedImageUrl = BACKEND_BASE_URL + updatedImageUrl;
          }

          // Reset image states
          setImageLoaded(false);
          setImageError(false);

          // Test if the new image URL is valid
          const testImg = new Image();
          testImg.onload = () => {
            setLocalProfileImage(updatedImageUrl);
            // Update the context's profile image
            updateProfileImage(updatedImageUrl);
            setImageLoaded(true);
          };
          testImg.onerror = () => {
            console.error("Error loading updated image:", updatedImageUrl);
            setImageError(true);
          };
          testImg.src = updatedImageUrl;
        }

        // Reset the selectedFile state
        setSelectedFile(null);

        alert("Profile updated successfully!");
      }
      // Save accessibility preferences
      else if (activeTab === "accessibility") {
        const accessibilityData = {
          preferences: {
            textSize,
            highContrastOutline,
            reduceMotion,
            colorTheme
          }
        };
        
        const response = await fetch(BACKEND_BASE_URL + `api/users/${userId}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1] || '',
          },
          credentials: 'include',
          body: JSON.stringify(accessibilityData)
        });
        
        if (!response.ok) {
          throw new Error("Failed to update accessibility preferences");
        }

        alert("Accessibility settings saved!");
      }
      // Save notification settings
      else if (activeTab === "notifications") {
        const notificationData = {
          notifications: {
            emailNotifications,
            reminderEnabled,
          },
        };

        const response = await fetch(BACKEND_BASE_URL + `api/users/${userId}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1] || '',
          },
          credentials: 'include',
          body: JSON.stringify(notificationData)
        });
        
        if (!response.ok) {
          throw new Error("Failed to update notification settings");
        }

        alert("Notification settings saved!");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert(
        `Failed to save changes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Loading state if userId is not yet available
  if (!userId) {
    return (
      <div className="settings-loading">
        <p>Loading user settings...</p>
      </div>
    );
  }

  return (
    <div className={`settings-container`}>
      <div className="settings-tabs">
        <div className="tab-list">
          <button
            className={`tab-button ${
              activeTab === "accessibility" ? "active" : ""
            }`}
            onClick={() => setActiveTab("accessibility")}
          >
            Accessibility
          </button>

          <button
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>

          <button
            className={`tab-button ${
              activeTab === "notifications" ? "active" : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </div>

        {/* {activeTab === 'accessibility' && (
          <div className="settings-section">
            <h3>Accessibility</h3>
            <div className="setting-item">
              <label htmlFor="text-size">Text Size:</label>
              <select
                id="text-size"
                value={textSize}
                onChange={(e) =>
                  setTextSize(e.target.value as 'Small' | 'Normal' | 'Larger' | 'Largest')
                }
              >
                <option value="Small">Small</option>
                <option value="Normal">Normal</option>
                <option value="Larger">Larger</option>
                <option value="Largest">Largest</option>
              </select>
            </div>
            <div className="setting-item">
              <label htmlFor="high-contrast">High Contrast Outlines:</label>
              <input
                type="checkbox"
                id="high-contrast"
                checked={highContrastOutline}
                onChange={(e) => setHighContrastOutline(e.target.checked)}
              />
            </div>
            <div className="setting-item">
              <label htmlFor="reduce-motion">Reduce Motion:</label>
              <input
                type="checkbox"
                id="reduce-motion"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
              />
            </div>
            <div className="setting-item">
              <label htmlFor="theme">Color Theme:</label>
              <select
                id="theme"
                value={colorTheme}
                onChange={(e) =>
                  handleThemeChange(e.target.value as ColourTheme)
                }
              >
                <option value="Default">Default</option>
                <option value="Sky">Sky</option>
                <option value="Forest">Forest</option>
                <option value="Amethyst">Amethyst</option>
                <option value="Blossom">Blossom</option>
                <option value="Halow">Halow</option>
                <option value="Pastel">Pastel</option>
                <option value="Monochrome">Monochrome</option>
                <option value="Verdant">Verdant</option>
                <option value="Rustic">Rustic</option>
                <option value="Beach">Beach</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>
        )} */}

        {/* Accessibility Tab */}
        {activeTab === "accessibility" && (
          <div className="tab-content">
            <div className="settings-section">
              <h2>Text Size</h2>
              <div className="radio-group">
                {(
                  ["Small", "Normal", "Larger", "Largest"] as TextSizeOption[]
                ).map((size) => (
                  <label
                    key={size}
                    className={`radio-label ${
                      textSize === size ? "active-text-size" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="textSize"
                      value={size}
                      checked={textSize === size}
                      onChange={() => setTextSize(size)}
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h2>Colour & Contrast</h2>
              <div className="toggle-container">
                <label htmlFor="highContrastOutline">
                  High Contrast Outlines
                </label>
                <div className="toggle-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      id="highContrastOutline"
                      checked={highContrastOutline}
                      onChange={() =>
                        setHighContrastOutline(!highContrastOutline)
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="color-theme-selector">
                <h3>Color Theme</h3>
                <div className="theme-buttons">
                  {(
                    [
                      "Default",
                      "Halow",
                      "Monochrome",
                      "Sky",
                      "Forest",
                      "Amethyst",
                      "Blossom",
                      "Night",
                      "Beach",
                      "Pastel",
                      
                      "Verdant",
                      "Rustic",
                    ] as ColourTheme[]
                  ).map((theme) => (
                    <button
                      key={theme}
                      className={`theme-button ${
                        colorTheme === theme ? "selected" : ""
                      }`}
                      onClick={() => handleThemeChange(theme)}
                      data-theme={theme}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="settings-section">
              <h2>Motion & Animation</h2>
              <div className="toggle-container">
                <label htmlFor="reduceMotion">Reduce Motion</label>
                <div className="toggle-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      id="reduceMotion"
                      checked={reduceMotion}
                      onChange={() => setReduceMotion(!reduceMotion)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <button
              className="save-changes-button"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="tab-content">
            <div className="profile-picture-container">
              <div className="profile-picture-preview">
                {localProfileImage ? (
                  <img
                    src={localProfileImage}
                    alt="Profile"
                    onLoad={() => {
                      setImageLoaded(true);
                    }}
                    onError={() => {
                      console.error(
                        "Image failed to load in DOM:",
                        localProfileImage
                      );
                      setImageError(true);
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                      display: imageError ? "none" : "block",
                    }}
                  />
                ) : null}

                {(!localProfileImage || imageError) && (
                  <div className="profile-picture-placeholder"></div>
                )}
              </div>

              {imageError && (
                <div className="image-error-message">
                  Unable to load image. Please try again.
                </div>
              )}

              {localProfileImage && !selectedFile && !imageError && (
                <div className="current-avatar-indicator">
                  <p>Current Avatar</p>
                </div>
              )}

              <button
                className="change-avatar-button"
                onClick={handleUploadClick}
              >
                Change Avatar
              </button>

              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                ref={fileInputRef}
                style={{ display: "none" }}
              />

              {selectedFile && (
                <div className="selected-file-info">
                  <p>Selected file: {selectedFile.name}</p>
                  <p className="file-status">
                    Click "Save Changes" to update your avatar
                  </p>
                </div>
              )}
            </div>
            <div className="settings-section">
              <h2>Personal Details</h2>
              <input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
              <div className="bio-field-container">
                <label htmlFor="user-bio">Bio</label>
                <textarea
                  id="user-bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => {
                    // Limit to 500 characters
                    if (e.target.value.length <= 500) {
                      setBio(e.target.value);
                    }
                  }}
                  className="textarea-field"
                  rows={4}
                ></textarea>
                <div className="bio-character-count">
                  <span
                    className={
                      bio.length > 450 ? "character-limit-warning" : ""
                    }
                  >
                    {bio.length}/500 characters
                  </span>
                </div>
                <p className="field-help-text">
                  Your bio will be displayed on your profile page
                </p>
              </div>
            </div>

            <button
              className="save-changes-button"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="tab-content">
            <div className="settings-section">
              <h2>Email Notifications</h2>
              <p>Manage email notifications and summaries</p>

              <div className="toggle-container">
                <label htmlFor="weeklyProgressSummary">
                  Weekly Progress Summary
                </label>
                <p className="toggle-description">
                  Receive a weekly email with your habit progress
                </p>
                <div className="toggle-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      id="weeklyProgressSummary"
                      checked={emailNotifications.weeklyProgressSummary}
                      onChange={() =>
                        setEmailNotifications({
                          ...emailNotifications,
                          weeklyProgressSummary:
                            !emailNotifications.weeklyProgressSummary,
                        })
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Reminder Settings Section */}
            <div className="settings-section">
              <h2>Reminder Settings</h2>
              <p>Customize when you receive reminders</p>
              <div className="toggle-container">
                <label>Reminder</label>
                <p className="toggle-description">
                  Toggle if you'd like the reminder (8am daily)
                </p>
                <div className="toggle-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      id="reminderEnabled"
                      checked={reminderEnabled}
                      onChange={() => setReminderEnabled(!reminderEnabled)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <button
              className="save-notification-settings"
              onClick={handleSaveChanges}
            >
              Save Notification Settings
            </button>
          </div>
        )}
      </div>
      <div className="settings-section danger-zone">
        <h2>Danger Zone</h2>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
});

export default Settings;
