/**
 * EditHabit Component
 *
 * A modal interface for editing and managing existing habits in the BetterDays app.
 * Provides options to update habit properties or delete the habit entirely.
 *
 * Features:
 * - Habit name, description, and colour modification
 * - Display of current habit statistics and streaks
 * - Deletion functionality with confirmation safeguard
 * - Creation date and streak information display
 * - Form validation with error messaging
 * - CSRF token integration for secure form submission
 *
 * This component focuses on the management of existing habits,
 * complementing the CreateHabits component by handling editing
 * and deletion operations.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./css/HabitModals.css";
import BACKEND_BASE_URL from "../Constants";

interface User {
  id: number;
}

interface Habit {
  id: number;
  user: number | User;
  habit_name: string;
  habit_description: string | null;
  habit_colour: string;
  habit_frequency: number;
  completions: Record<string, boolean>;
  streak_count: number;
  last_completed: string | null;
  created_at: string;
  updated_at: string;
  accountability_partner: number | User | null;
}

interface EditHabitProps {
  show: boolean;
  handleClose: () => void;
  onSuccessCallback: () => void;
  habit: Habit | null;
  fetchHabits: () => void;
}

const EditHabit: React.FC<EditHabitProps> = ({
  show,
  handleClose,
  onSuccessCallback,
  habit,
  fetchHabits,
}) => {
  // State for form fields
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [habitColour, setHabitColour] = useState("#ADD8E6");
  const [habitFrequency, setHabitFrequency] = useState(1);
  const [streakCount, setStreakCount] = useState(0);
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);

  // State for form handling
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch the CSRF token when component mounts
  useEffect(() => {
    if (show) {
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
    }
  }, [show]);

  // Populate form with habit data
  useEffect(() => {
    if (habit) {
      setHabitName(habit.habit_name);
      setHabitDescription(habit.habit_description || "");
      setHabitColour(habit.habit_colour);
      setHabitFrequency(habit.habit_frequency);
      setStreakCount(habit.streak_count);
      setLastCompleted(habit.last_completed);
    } else {
      // Reset form if habit is null
      setHabitName("");
      setHabitDescription("");
      setHabitColour("#ADD8E6");
      setHabitFrequency(1);
      setStreakCount(0);
      setLastCompleted(null);
      setError(null);
    }
    // Reset delete confirmation when modal reopens
    setShowDeleteConfirm(false);
  }, [habit, show]);

  // Form validation
  useEffect(() => {
    setIsValid(habitName.trim() !== "" && habitFrequency > 0);
  }, [habitName, habitFrequency]);

  // Handle delete habit
  const handleDeleteHabit = useCallback(async () => {
    if (!habit) return;

    setLoading(true);
    setError(null);

    try {
      const url = BACKEND_BASE_URL + `api/habits/${habit.id}/`;
      const method = "DELETE";
      const headers: Record<string, string> = {};

      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      const response = await fetch(url, {
        method,
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to delete habit: ${response.status} ${errorData}`
        );
      }

      // Close modal and refresh habits list on success
      handleClose();
      fetchHabits();
      onSuccessCallback();
    } catch (error: any) {
      console.error("Error deleting habit:", error);
      setError(`Failed to delete habit: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [csrfToken, fetchHabits, habit, handleClose, onSuccessCallback]);

  // Handle form submission for updating habit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !habit) return;

    setSubmitting(true);
    setError(null);

    const habitData = {
      habit_name: habitName.trim(),
      habit_description: habitDescription.trim() || null,
      habit_colour: habitColour,
      habit_frequency: habitFrequency,
      // We don't update streak_count or last_completed through this form
    };

    try {
      const url = BACKEND_BASE_URL + `api/habits/${habit.id}/`;
      const method = "PUT";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add CSRF token if available
      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      } else {
        console.warn("CSRF token missing. Update might fail.");
      }

      const response = await fetch(url, {
        method: method,
        headers: headers,
        credentials: "include",
        body: JSON.stringify(habitData),
      });

      const responseData = await response.text();

      if (!response.ok) {
        try {
          const errorJson = JSON.parse(responseData);
          const message =
            errorJson.detail || errorJson.error || JSON.stringify(errorJson);
          throw new Error(`Failed to update habit: ${message}`);
        } catch (parseError) {
          throw new Error(
            `Failed to update habit: ${response.status} ${response.statusText}. Response: ${responseData}`
          );
        }
      }

      // Success
      onSuccessCallback();
      handleClose();
    } catch (err: any) {
      console.error("Error updating habit:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="habit-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Edit Habit</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        {!csrfToken && (
          <div className="alert alert-warning mb-3">
            Warning: CSRF token missing. Form submission may fail.
          </div>
        )}

        {/* Habit Stats Section */}
        {habit && (
          <div className="habit-stats mb-4">
            <Form.Label>Habit Statistics</Form.Label>
            <div className="d-flex justify-content-between">
              <div>
                <small className="text-muted">Current Streak</small>
                <div className="fs-5 fw-bold">{streakCount} days</div>
              </div>
              {/* <div>
                <small className="text-muted">Last Completed</small>
                <div>{formatLastCompleted()}</div>
              </div> */}
              <div>
                <small className="text-muted">Created</small>
                <div>
                  {habit
                    ? new Date(habit.created_at).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group
            className="mb-3"
            controlId="habitName"
          >
            <Form.Label>Habit Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Drink Water, Exercise"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              required
              disabled={submitting || loading}
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="habitDescription"
          >
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Any details about this habit?"
              value={habitDescription}
              onChange={(e) => setHabitDescription(e.target.value)}
              disabled={submitting || loading}
            />
          </Form.Group>

          <Form.Group
            className="mb-4"
            controlId="habitColour"
          >
            <Form.Label>Colour Tag</Form.Label>
            <Form.Control
              type="color"
              value={habitColour}
              onChange={(e) => setHabitColour(e.target.value)}
              title="Choose a colour for this habit"
              disabled={submitting || loading}
              className="habit-color-input"
            />
          </Form.Group>

          {/* Reset Streak Section - Optional */}
          {/* {habit && habit.streak_count > 0 && (
            <div className="reset-streak-section mt-4 mb-3 p-3 border border-warning rounded">
              <h6 className="text-warning mb-2">Reset Streak</h6>
              <p className="text-muted small mb-2">
                If needed, you can reset this habit's streak to zero.
              </p>
            </div>
          )} */}

          {/* Delete Habit Section */}
          {habit && (
            <div className="delete-habit-section mt-4 mb-3 p-3 border border-danger rounded">
              <h6 className="text-danger mb-2">Delete Habit</h6>
              <p className="text-muted small mb-2">
                This will permanently remove this habit and all its tracking
                data.
              </p>

              {!showDeleteConfirm ? (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading || submitting}
                >
                  Delete this habit
                </Button>
              ) : (
                <div className="d-flex flex-column">
                  <p className="text-danger fw-bold mb-2">Are you sure?</p>
                  <div className="d-flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDeleteHabit}
                      disabled={loading || submitting}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Deleting...
                        </>
                      ) : (
                        "Yes, delete"
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={loading || submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={submitting || loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={submitting || !isValid || loading}
          className="save-btn-habit"
        >
          {submitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Updating...
            </>
          ) : (
            "Update Habit"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditHabit;
