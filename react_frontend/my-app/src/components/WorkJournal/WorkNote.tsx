/**
 * WorkNote Component
 *
 * Displays an individual work journal entry with associated tasks.
 * Provides a comprehensive interface for work management and time tracking.
 *
 * Features:
 * - Display of work note content with date and title
 * - Task list with completion checkboxes and progress tracking
 * - Visual indicators for task priority and categories
 * - Time tracking functionality for each task
 * - Task management options (add, edit, delete tasks)
 * - Time spent display in hours and minutes format
 *
 * This component extends the journal note concept to include
 * task management capabilities, allowing users to track work activities
 * and monitor productivity within the BetterDays app.
 */

import React from "react";
import "../css/JournalNote.css"; // Reusing the same CSS
import EditDropdown from "../Journal/NoteOperationsDropdown";

interface Task {
  id: string;
  task_name: string;
  description: string;
  time_spent: number; // in minutes
  date_created: string;
  completed: boolean;
  category: string;
  priority: "Low" | "Medium" | "High";
}

interface WorkNoteProps {
  date: string;
  day: string;
  title: string;
  content: string;
  tasks?: Task[];
  onEdit: () => void;
  onDelete: () => void;
  onAddTask?: () => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleTaskCompletion?: (taskId: string) => void;
  onStartTimer?: (taskId: string) => void;
}

const WorkNote: React.FC<WorkNoteProps> = ({
  date,
  day,
  title,
  content,
  tasks,
  onEdit,
  onDelete,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskCompletion,
  onStartTimer,
}) => {
  // Function to format time spent
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPriorityColor = (priority: "Low" | "Medium" | "High") => {
    switch (priority) {
      case "High":
        return "mood-anger";
      case "Medium":
        return "mood-happy text-dark";
      case "Low":
        return "mood-calm text-dark";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="note-card position-relative mb-4">
      {/* edit dropdown */}
      <EditDropdown
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* header section with date and title */}
      <div className="note-header d-flex align-items-center mb-3">
        <div className="date-info-calendar me-3">
          <span className="month">{day}</span>
          <span className="day">{date}</span>
        </div>
        <h3 className="title mb-0">{title}</h3>
      </div>

      {/* note content */}
      <p className="note-content fs-4">{content}</p>

      {/* Tasks section */}
      <div className="tasks-section mt-3">
        <div className="tasks-placeholder mb-2">
          <h5 className="tasks-header mb-0">Tasks</h5>
          {onAddTask && (
            <button
              className="add-task-btn btn "
              onClick={onAddTask}
              title="Add task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="me-1"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Task
            </button>
          )}
        </div>

        {/* Task list */}
        {tasks && tasks.length > 0 && (
          <div className="task-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="task-item d-flex justify-content-between align-items-center mb-2"
              >
                <div className="task-details d-flex align-items-center">
                  <div className="form-check me-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        onToggleTaskCompletion &&
                        onToggleTaskCompletion(task.id)
                      }
                      id={`task-${task.id}`}
                    />
                    <label
                      className={`form-check-label ${
                        task.completed ? "text-decoration-line-through" : ""
                      }`}
                      htmlFor={`task-${task.id}`}
                    >
                      {task.task_name}
                    </label>
                  </div>
                  <span className={`badge ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.category && (
                    <span className="badge bg-secondary ms-1">
                      {task.category}
                    </span>
                  )}
                </div>
                <div className="task-actions d-flex align-items-center">
                  <span className="time-spent me-2">
                    {formatTime(task.time_spent)}
                  </span>
                  {onStartTimer && (
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => onStartTimer(task.id)}
                      title="Start timer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                        ></circle>
                        <polygon points="10 8 16 12 10 16 10 8"></polygon>
                      </svg>
                    </button>
                  )}
                  {onEditTask && (
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => onEditTask(task.id)}
                      title="Edit task"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  )}
                  {onDeleteTask && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDeleteTask(task.id)}
                      title="Delete task"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line
                          x1="10"
                          y1="11"
                          x2="10"
                          y2="17"
                        ></line>
                        <line
                          x1="14"
                          y1="11"
                          x2="14"
                          y2="17"
                        ></line>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show a message if there are no tasks */}
        {(!tasks || tasks.length === 0) && (
          <div className="text-center text-muted my-3">
            <p>
              No tasks added yet. Click the "Add Task" button to create your
              first task.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkNote;
