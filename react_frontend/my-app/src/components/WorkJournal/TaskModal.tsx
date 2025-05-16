/**
 * TaskModal Component
 *
 * A modal dialogue for creating and editing tasks within the work journal section.
 * Provides form inputs for all task properties with validation.
 *
 * Features:
 * - Task creation and editing interface
 * - Form validation with error messaging
 * - Fields for task name, description, category, and priority
 * - Completion status toggle
 * - Category suggestions through datalist
 * - Loading state indication during save operations
 *
 * The component handles both new task creation and existing task updates
 * with appropriate button text and title changes based on the current mode.
 */

import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Task } from "../../types";

interface TaskModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (task: Task) => void | Promise<void>; // Allow Promise return type
  task?: Task | null;
  title?: string;
  saveInProgress?: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({
  show,
  onHide,
  onSave,
  task,
  title = "Task",
  saveInProgress = false,
}) => {
  const [taskData, setTaskData] = useState<Task>({
    task_name: "",
    description: "",
    time_spent: 0,
    date_created: "",
    completed: false,
    category: "",
    priority: "Medium",
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTaskData(task);
    } else {
      setTaskData({
        task_name: "",
        description: "",
        time_spent: 0,
        date_created: "",
        completed: false,
        category: "",
        priority: "Medium",
      });
    }
    setFormError(null);
  }, [task, show]);

  const validateForm = (): boolean => {
    setFormError(null);

    if (!taskData.task_name || taskData.task_name.trim() === "") {
      setFormError("Please enter a task name");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(taskData);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        if (!saveInProgress) {
          onHide();
          setFormError(null);
        }
      }}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton={!saveInProgress}>
        <Modal.Title>{task ? `Edit ${title}` : `New ${title}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formError && (
          <div className="alert alert-danger mb-3">{formError}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Task Name</label>
            <input
              type="text"
              className="form-control"
              value={taskData.task_name}
              onChange={(e) =>
                setTaskData({ ...taskData, task_name: e.target.value })
              }
              placeholder="Enter task name"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={taskData.description}
              onChange={(e) =>
                setTaskData({ ...taskData, description: e.target.value })
              }
              placeholder="Enter task description"
            ></textarea>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                value={taskData.category}
                onChange={(e) =>
                  setTaskData({ ...taskData, category: e.target.value })
                }
                placeholder="e.g. Development"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                <option value="Planning" />
                <option value="Development" />
                <option value="Documentation" />
                <option value="Communication" />
                <option value="Research" />
              </datalist>
            </div>
            <div className="col">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={taskData.priority}
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    priority: e.target.value as "Low" | "Medium" | "High",
                  })
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="task-completed"
              checked={taskData.completed}
              onChange={(e) =>
                setTaskData({ ...taskData, completed: e.target.checked })
              }
            />
            <label
              className="form-check-label"
              htmlFor="task-completed"
            >
              Task Completed
            </label>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-secondary"
          onClick={onHide}
          disabled={saveInProgress}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
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
          ) : task ? (
            "Update"
          ) : (
            "Save"
          )}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskModal;
