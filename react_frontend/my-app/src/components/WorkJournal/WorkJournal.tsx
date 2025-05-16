/**
 * WorkJournal Component
 *
 * A comprehensive interface for managing work-related notes, tasks, and productivity analytics.
 * Serves as the work-focused alternative to the personal journal in the BetterDays app.
 *
 * Features:
 * - Creation and management of work notes with encrypted content
 * - Task tracking with completion status, time tracking, and categorisation
 * - Timer functionality for monitoring time spent on tasks
 * - Productivity analytics with visualisations and insights
 * - Month-based navigation and filtering of entries
 * - Tab interface to switch between notes and analytics views
 *
 * The component handles all CRUD operations for work notes and tasks,
 * providing a complete workflow management system with integrated
 * time tracking and productivity analysis.
 */

import React, { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { AuthContext } from "../../App";
import MonthSelector from "../MonthSelector";
import "../css/WorkJournal.css";
import "../css/WorkAnalytics.css";
import BACKEND_BASE_URL from "../../Constants";
import JournalToggle from "../Journal/JournalToggle";
import CryptoJS from "crypto-js";
import WorkNote from "./WorkNote";
import TaskModal from "./TaskModal";
import TimerModal from "./TimerModal";
import WorkAnalytics from "./WorkAnalytics";

import { Task } from "../../types";

interface WorkNote {
  id: string;
  title: string;
  content: string;
  date_created: string;
  tasks: Task[];
}

interface WorkJournalProps {
  activeJournal: "personal" | "work";
  onToggleJournal: (journal: "personal" | "work") => void;
}

const WorkJournal: React.FC<WorkJournalProps> = ({
  activeJournal,
  onToggleJournal,
}) => {
  const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || "";
  const { isAuthenticated } = useContext(AuthContext);

  // States
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [workNotes, setWorkNotes] = useState<WorkNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<WorkNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<WorkNote | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parentNoteId, setParentNoteId] = useState<string | null>(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<WorkNote | null>(null);

  // Form states
  const [newNote, setNewNote] = useState<Partial<WorkNote>>({
    title: "",
    content: "",
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<"notes" | "analytics">("notes");

  // Save progress state
  const [formError, setFormError] = useState<string | null>(null);
  const [saveInProgress, setSaveInProgress] = useState(false);

  // CSRF Token Utility
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

  // Logging utility for debugging API responses
  const logApiError = async (response: Response, action: string) => {
    try {
      const errorData = await response.json();

      return errorData?.message || `Failed to ${action}`;
    } catch (e) {
      console.error(`Error ${action}, couldn't parse response:`, e);
      return `Failed to ${action}`;
    }
  };

  // Encryption/Decryption Utilities
  const encryptNote = (text: string, key: string): string => {
    return CryptoJS.AES.encrypt(text, key).toString();
  };

  const decryptNote = (ciphertext: string, key: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkNotes();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (workNotes.length > 0) {
      filterNotesByMonth();
    }
  }, [workNotes, selectedMonth, selectedYear]);

  // Filter notes by selected month/year
  const filterNotesByMonth = () => {
    const filtered = workNotes.filter((note) => {
      const noteDate = new Date(note.date_created);
      return (
        noteDate.getMonth() === selectedMonth &&
        noteDate.getFullYear() === selectedYear
      );
    });
    setFilteredNotes(filtered);
  };

  // Data fetching from API
  const fetchWorkNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(BACKEND_BASE_URL + "api/work-notes/", {
        credentials: "include",
      });

      if (!response.ok) {
        const errorMessage = await logApiError(response, "fetch work notes");
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Decrypt individual notes if we have an encryption key
      if (ENCRYPTION_KEY) {
        const decryptedNotes = data.map((note: WorkNote) => {
          try {
            // Attempt to decrypt the note fields
            const decryptedNote = {
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
            return decryptedNote;
          } catch (error) {
            console.warn(
              `Failed to decrypt work note ${note.id}, assuming it's not encrypted.`,
              error
            );
            // Return the original note if decryption fails
            return note;
          }
        });

        setWorkNotes(decryptedNotes);
      } else {
        // If no encryption key, just use the notes as-is
        setWorkNotes(data);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateNoteForm = (): boolean => {
    // Reset form errors
    setFormError(null);

    // Check if title is provided
    if (!newNote.title || newNote.title.trim() === "") {
      setFormError("Please enter a title for your note");
      return false;
    }

    // Check if content is provided
    if (!newNote.content || newNote.content.trim() === "") {
      setFormError("Please enter some content for your note");
      return false;
    }

    return true;
  };

  // Note operations
  const handleShowNoteModal = (note?: WorkNote) => {
    if (note) {
      setEditingNote(note);
      setNewNote(note);
    } else {
      setEditingNote(null);
      setNewNote({ title: "", content: "" });
    }
    setShowNoteModal(true);
    setFormError(null);
  };

  const handleSaveNote = async () => {
    // Validate form first
    if (!validateNoteForm()) {
      return;
    }

    setSaveInProgress(true);

    try {
      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      // Prepare data for API - encrypt if needed
      let noteData = { ...newNote };
      if (ENCRYPTION_KEY) {
        noteData = {
          ...noteData,
          title: encryptNote(newNote.title || "", ENCRYPTION_KEY),
          content: encryptNote(newNote.content || "", ENCRYPTION_KEY),
        };
      }

      if (editingNote) {
        // Update existing note
        const response = await fetch(
          BACKEND_BASE_URL + `api/work-notes/${editingNote.id}/`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(noteData),
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorMessage = await logApiError(response, "update work note");
          throw new Error(errorMessage);
        }
      } else {
        // Create new note with current date
        const currentDate = new Date().toISOString();
        const response = await fetch(BACKEND_BASE_URL + "api/work-notes/", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            ...noteData,
            date_created: currentDate,
            tasks: [],
          }),
          credentials: "include",
        });

        if (!response.ok) {
          const errorMessage = await logApiError(response, "create work note");
          throw new Error(errorMessage);
        }
      }

      // Refresh notes after save
      await fetchWorkNotes();
      setShowNoteModal(false);

      // Reset form
      setNewNote({ title: "", content: "" });
    } catch (err: any) {
      console.error("Error saving work note:", err);
      setFormError(err.message);
    } finally {
      setSaveInProgress(false);
    }
  };

  // Delete note operations
  const handleDeleteNoteModal = (note: WorkNote) => {
    setNoteToDelete(note);
    setShowDeleteModal(true);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {};

      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      const response = await fetch(
        BACKEND_BASE_URL + `api/work-notes/${noteToDelete.id}/`,
        {
          method: "DELETE",
          headers: headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorMessage = await logApiError(response, "delete work note");
        throw new Error(errorMessage);
      }

      // Filter out the deleted note from state
      setWorkNotes(workNotes.filter((note) => note.id !== noteToDelete.id));
      setFilteredNotes(
        filteredNotes.filter((note) => note.id !== noteToDelete.id)
      );
      setShowDeleteModal(false);
      setNoteToDelete(null);
    } catch (err: any) {
      console.error("Error deleting work note:", err);
      setError(err.message);
    }
  };

  // Task operations
  const handleShowTaskModal = (noteId: string, task?: Task) => {
    setParentNoteId(noteId);
    if (task) {
      setEditingTask(task);
    } else {
      setEditingTask(null);
    }
    setShowTaskModal(true);
  };

  const handleSaveTask = async (taskData: Task) => {
    if (!parentNoteId) return;

    setSaveInProgress(true);

    try {
      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      // Encrypt task data if needed
      let encryptedTaskData = { ...taskData };
      if (ENCRYPTION_KEY) {
        encryptedTaskData = {
          ...encryptedTaskData,
          task_name: encryptNote(taskData.task_name, ENCRYPTION_KEY),
          description: encryptNote(taskData.description || "", ENCRYPTION_KEY),
        };
      }

      if (editingTask && editingTask.id) {
        // Update existing task
        const response = await fetch(
          BACKEND_BASE_URL + `api/work-tasks/${editingTask.id}/`,
          {
            method: "PUT",
            headers: headers,
            body: JSON.stringify({
              ...encryptedTaskData,
              note: parentNoteId, // Changed from work_note to note
            }),
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorMessage = await logApiError(response, "update task");
          throw new Error(errorMessage);
        }
      } else {
        // Create new task
        const response = await fetch(BACKEND_BASE_URL + "api/work-tasks/", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            ...encryptedTaskData,
            note: parentNoteId, // Changed from work_note to note
            date_created: new Date().toISOString(),
          }),
          credentials: "include",
        });

        if (!response.ok) {
          const errorMessage = await logApiError(response, "create task");
          throw new Error(errorMessage);
        }
      }

      // Refresh notes to get updated task list
      await fetchWorkNotes();
      setShowTaskModal(false);
      setEditingTask(null);
      setParentNoteId(null);
    } catch (err: any) {
      console.error("Error saving task:", err);
      setError(err.message);
    } finally {
      setSaveInProgress(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {};

      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      const response = await fetch(
        BACKEND_BASE_URL + `api/work-tasks/${taskId}/`,
        {
          method: "DELETE",
          headers: headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorMessage = await logApiError(response, "delete task");
        throw new Error(errorMessage);
      }

      // Refresh notes after deletion
      await fetchWorkNotes();
    } catch (err: any) {
      console.error("Error deleting task:", err);
      setError(err.message);
    }
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    try {
      // Find the task
      let taskToToggle: Task | undefined;
      let parentNote: WorkNote | undefined;

      for (const note of workNotes) {
        const task = note.tasks.find((t) => t.id === taskId);
        if (task) {
          taskToToggle = task;
          parentNote = note;
          break;
        }
      }

      if (!taskToToggle || !parentNote) return;

      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      // Toggle completion status
      const response = await fetch(
        BACKEND_BASE_URL + `api/work-tasks/${taskId}/`,
        {
          method: "PATCH",
          headers: headers,
          body: JSON.stringify({
            completed: !taskToToggle.completed,
            note: parentNote.id, // Include note ID to maintain association
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorMessage = await logApiError(
          response,
          "update task completion"
        );
        throw new Error(errorMessage);
      }

      // Update state locally for immediate feedback
      const updatedNotes = workNotes.map((note) => {
        if (note.id === parentNote?.id) {
          return {
            ...note,
            tasks: note.tasks.map((task) =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
            ),
          };
        }
        return note;
      });

      setWorkNotes(updatedNotes);
      filterNotesByMonth(); // Re-filter notes
    } catch (err: any) {
      console.error("Error toggling task completion:", err);
      setError(err.message);
      // Refresh notes to ensure UI is in sync with server
      await fetchWorkNotes();
    }
  };

  // Timer operations
  const handleShowTimerModal = (taskId: string) => {
    // Find the task
    let taskToTime: Task | undefined;

    for (const note of workNotes) {
      const task = note.tasks.find((t) => t.id === taskId);
      if (task) {
        taskToTime = task;
        break;
      }
    }

    if (taskToTime) {
      setActiveTask(taskToTime);
      setShowTimerModal(true);
    }
  };

  const handleTimerStop = async (taskId: string, additionalMinutes: number) => {
    try {
      if (additionalMinutes <= 0) {
        setShowTimerModal(false);
        return;
      }

      // Find the task
      let taskToUpdate: Task | undefined;
      let parentNoteId: string | undefined;

      for (const note of workNotes) {
        const task = note.tasks.find((t) => t.id === taskId);
        if (task) {
          taskToUpdate = task;
          parentNoteId = note.id;
          break;
        }
      }

      if (!taskToUpdate || !parentNoteId) {
        setShowTimerModal(false);
        return;
      }

      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      // Update time spent
      const response = await fetch(
        BACKEND_BASE_URL + `api/work-tasks/${taskId}/`,
        {
          method: "PATCH",
          headers: headers,
          body: JSON.stringify({
            time_spent: taskToUpdate.time_spent + additionalMinutes,
            note: parentNoteId, // Include note reference to maintain association
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorMessage = await logApiError(response, "update task time");
        throw new Error(errorMessage);
      }

      // Refresh notes to get updated time
      await fetchWorkNotes();
      setShowTimerModal(false);
      setActiveTask(null);
    } catch (err: any) {
      console.error("Error updating task time:", err);
      setError(err.message);
      setShowTimerModal(false);
    }
  };

  // Month selection
  const handleMonthChange = (monthIndex: number, year: number) => {
    setSelectedMonth(monthIndex);
    setSelectedYear(year);
  };

  // Format date to display
  const formatNoteDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate().toString(),
    };
  };

  // Get month name for display
  const monthName = new Date(selectedYear, selectedMonth).toLocaleString(
    "en-US",
    { month: "long" }
  );

  return (
    <div className="container-fluid py-2">
      <div
        className="journal-header d-flex justify-content-between align-items-start mb-4"
        data-aos="fade-down"
        data-aos-duration="800"
      >
        <div className="d-flex align-items-center flex-column gap-2">
          <h1 className="journal-title fw-bold mb-0 me-3">Journal</h1>
          <JournalToggle
            activeJournal={activeJournal}
            onToggle={onToggleJournal}
          />
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger mb-4"
          data-aos="fade-in"
          data-aos-duration="600"
        >
          Error: {error}
        </div>
      )}

      {/* Tab navigation */}

      {/* Tab content */}
      <div className="tab-content">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "notes" ? "active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              Work Notes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "analytics" ? "active" : ""
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </li>
        </ul>
        {/* Work Notes View */}
        <div
          className={`tab-pane fade ${
            activeTab === "notes" ? "show active" : ""
          }`}
        >
          <div
            className="journal-card-container position-relative"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            {/* Notebook tab style button positioned on top of the card */}
            <button
              className="new-entry-button-5 fw-medium d-flex align-items-center fs-5"
              onClick={() => handleShowNoteModal()}
              data-aos="fade-down"
              data-aos-delay="200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="me-2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Entry
            </button>

            <div className="journal-card shadow-sm p-4 mb-4">
              <div
                className="d-flex justify-content-between align-items-center mb-4"
                data-aos="fade-in"
                data-aos-duration="600"
              >
                <MonthSelector
                  onMonthChange={handleMonthChange}
                  currentMonth={monthName}
                  currentYear={selectedYear}
                />
              </div>

              {loading ? (
                <div
                  className="text-center py-5"
                  data-aos="fade-in"
                >
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading your work journal...</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div
                  className="text-center py-5"
                  data-aos="fade-in"
                  data-aos-duration="800"
                >
                  <div
                    className="empty-state-icon mb-3"
                    data-aos="zoom-in"
                    data-aos-delay="300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={60}
                      height={60}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted"
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
                  </div>
                  <h3
                    className="h5 mb-2"
                    data-aos="fade-up"
                    data-aos-delay="400"
                  >
                    No work entries for {monthName} {selectedYear}
                  </h3>
                  <p
                    className="text-muted mb-4"
                    data-aos="fade-up"
                    data-aos-delay="500"
                  >
                    {selectedMonth === today.getMonth() &&
                    selectedYear === today.getFullYear()
                      ? "Start tracking your work to see your entries here"
                      : "Try selecting a different month or create a new entry"}
                  </p>
                  {selectedMonth === today.getMonth() &&
                    selectedYear === today.getFullYear() && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleShowNoteModal()}
                        data-aos="zoom-in"
                        data-aos-delay="600"
                      >
                        Create Work Entry
                      </button>
                    )}
                </div>
              ) : (
                <div className="work-notes-container">
                  {filteredNotes.map((note, index) => {
                    const { day, date } = formatNoteDate(note.date_created);
                    return (
                      <div
                        key={note.id}
                        data-aos="fade-up"
                        data-aos-duration="800"
                        data-aos-delay={100 * (index % 5)}
                      >
                        <WorkNote
                          date={date}
                          day={day}
                          title={note.title}
                          content={note.content}
                          tasks={note.tasks as any}
                          onEdit={() => handleShowNoteModal(note)}
                          onDelete={() => handleDeleteNoteModal(note)}
                          onAddTask={() => handleShowTaskModal(note.id)}
                          onEditTask={(taskId) => {
                            const task = note.tasks.find(
                              (t) => t.id === taskId
                            );
                            if (task) {
                              handleShowTaskModal(note.id, task);
                            }
                          }}
                          onDeleteTask={handleDeleteTask}
                          onToggleTaskCompletion={handleToggleTaskCompletion}
                          onStartTimer={handleShowTimerModal}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics View */}
        <div
          className={`tab-pane fade ${
            activeTab === "analytics" ? "show active" : ""
          }`}
        >
          <div className="journal-card shadow-sm p-4 mb-4">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading your analytics...</p>
              </div>
            ) : (
              <WorkAnalytics
                notes={workNotes}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            )}
          </div>
        </div>
      </div>

      {/* Note Modal */}
      <Modal
        show={showNoteModal}
        onHide={() => {
          if (!saveInProgress) {
            setShowNoteModal(false);
            setFormError(null);
          }
        }}
        centered
        backdrop="static"
        keyboard={false}
        size="lg"
        className="journal-note-modal"
      >
        <Modal.Header closeButton={!saveInProgress}>
          <Modal.Title>
            {editingNote ? "Edit Work Note" : "New Work Note"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <div className="alert alert-danger mb-3">{formError}</div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveNote();
            }}
          >
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={newNote.title || ""}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
                placeholder="Enter note title"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                rows={8}
                value={newNote.content || ""}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                placeholder="Enter note content"
                required
              ></textarea>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (!saveInProgress) {
                setShowNoteModal(false);
                setFormError(null);
              }
            }}
            disabled={saveInProgress}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveNote}
            disabled={saveInProgress}
          >
            {saveInProgress ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Saving...
              </>
            ) : editingNote ? (
              "Update"
            ) : (
              "Save"
            )}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Task Modal */}
      <TaskModal
        show={showTaskModal}
        onHide={() => {
          setShowTaskModal(false);
          setEditingTask(null);
          setParentNoteId(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        saveInProgress={saveInProgress}
      />

      {/* Timer Modal */}
      <TimerModal
        show={showTimerModal}
        onHide={() => {
          setShowTimerModal(false);
          setActiveTask(null);
        }}
        task={activeTask as any}
        onTimerStop={handleTimerStop}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setNoteToDelete(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Work Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this work note?</p>
          {noteToDelete?.tasks.length ? (
            <div className="alert alert-warning">
              <strong>Warning:</strong> This will also delete{" "}
              {noteToDelete.tasks.length} associated task
              {noteToDelete.tasks.length > 1 ? "s" : ""}.
            </div>
          ) : null}
          <p className="text-muted small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setNoteToDelete(null);
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={confirmDeleteNote}
          >
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WorkJournal;
