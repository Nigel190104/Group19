/**
 * CreateHabits Component
 *
 * A modal interface for creating and editing habit entries in the BetterDays app.
 * Provides a form for configuring habit properties with validation.
 *
 * Features:
 * - Creation of new habits with name, description, and visual properties
 * - Editing functionality for existing habits
 * - Colour selection for visual categorisation
 * - Form validation with error messaging
 * - CSRF token integration for secure form submission
 * - Loading state indication during API operations
 *
 * The component handles both creating new habits and modifying existing ones,
 * with appropriate state management to differentiate between these modes.
 */

import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./css/HabitModals.css";
import BACKEND_BASE_URL from "../Constants";

//---------------------------------Interfaces-------------------
interface User {
  id: number;
  // Add other user properties as needed
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

interface CreateHabitsProps {
  show: boolean;
  handleClose: () => void;
  onSuccessCallback: () => void; // Callback after successful creation/update
  habitToEdit?: Habit | null; // Optional habit object for editing
}

//------------------------------------------------------------

const CreateHabits: React.FC<CreateHabitsProps> = ({
  show,
  handleClose,
  onSuccessCallback,
  habitToEdit = null,
}) => {
  // State for form fields
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [habitColour, setHabitColour] = useState("#ADD8E6"); // Default light blue
  const [habitFrequency, setHabitFrequency] = useState(1); // Default to 1 (e.g., once per week/day)

  // State for form handling
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Fetch the CSRF token when component mounts (or when modal becomes visible)
  useEffect(() => {
    if (show) {
      // Function to get CSRF token from cookies
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
  }, [show]); // Re-check token if modal re-opens

  // Populate form if editing
  useEffect(() => {
    if (habitToEdit) {
      setHabitName(habitToEdit.habit_name);
      setHabitDescription(habitToEdit.habit_description || "");
      setHabitColour(habitToEdit.habit_colour);
      setHabitFrequency(habitToEdit.habit_frequency);
    } else {
      // Reset form if opening for creation
      setHabitName("");
      setHabitDescription("");
      setHabitColour("#ADD8E6"); // Reset to default
      setHabitFrequency(1); // Reset to default
      setError(null); // Clear previous errors
    }
  }, [habitToEdit, show]); // Rerun when habitToEdit changes or modal opens

  // Form validation
  useEffect(() => {
    // Simple validation: name is required, frequency > 0
    setIsValid(habitName.trim() !== "" && habitFrequency > 0);
  }, [habitName, habitFrequency]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return; // Prevent submission if form is invalid

    setSubmitting(true);
    setError(null);

    const habitData = {
      habit_name: habitName.trim(),
      habit_description: habitDescription.trim() || null, // Send null if empty
      habit_colour: habitColour,
      habit_frequency: habitFrequency,
    };

    try {
      // Determine API endpoint and method
      const url = habitToEdit
        ? BACKEND_BASE_URL + `api/habits/${habitToEdit.id}/`
        : BACKEND_BASE_URL + "api/habits/";

      const method = habitToEdit ? "PUT" : "POST";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add CSRF token if available
      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      } else {
        console.warn("CSRF token missing. Submission might fail.");
      }

      const response = await fetch(url, {
        method: method,
        headers: headers,
        credentials: "include", // Include cookies for session auth
        body: JSON.stringify(habitData),
      });

      const responseData = await response.text(); // Read response body first

      if (!response.ok) {
        // Try to parse error message if backend sends JSON error
        try {
          const errorJson = JSON.parse(responseData);
          // Extract a meaningful error message (adjust based on your API's error structure)
          const message =
            errorJson.detail || errorJson.error || JSON.stringify(errorJson);
          throw new Error(`Failed to save habit: ${message}`);
        } catch (parseError) {
          // Fallback if response is not JSON or parsing fails
          throw new Error(
            `Failed to save habit: ${response.status} ${response.statusText}. Response: ${responseData}`
          );
        }
      }

      // Success
      onSuccessCallback(); // Call the success callback provided by the parent
      handleClose(); // Close the modal on success
    } catch (err: any) {
      console.error("Error saving habit:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle closing the modal (resets state if not editing)
  const handleModalClose = () => {
    handleClose(); // Call the parent's close handler
    // No need to reset fields here, the useEffect for habitToEdit handles it
  };

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      centered
      className="habit-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {habitToEdit ? "Edit Habit" : "Create New Habit"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        {!csrfToken && (
          <div className="alert alert-warning mb-3">
            Warning: CSRF token missing. Form submission may fail.
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
              className="habit-color-input"
            />
          </Form.Group>

          {/* Footer is outside the form but within the Modal */}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={handleModalClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit" // This button needs to trigger the form's onSubmit
          onClick={handleSubmit} // Also call handleSubmit here to ensure it runs
          disabled={submitting || !isValid}
          className="save-btn-habit" // Use a specific class if needed
        >
          {submitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {habitToEdit ? "Updating..." : "Saving..."}
            </>
          ) : habitToEdit ? (
            "Update Habit"
          ) : (
            "Save Habit"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateHabits;
