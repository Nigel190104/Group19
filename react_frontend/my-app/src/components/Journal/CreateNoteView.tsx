/**
 * CreateNoteView Component
 *
 * A form interface for creating and editing journal entries in the BetterDays app.
 * Supports both standalone and modal presentation modes with optional encryption.
 *
 * Features:
 * - Title and content fields for journal entries
 * - Two-level mood selection (category and subcategory)
 * - Descriptive information about selected moods
 * - Support for encrypted journal entries
 * - Form validation and submission handling
 * - Edit mode for updating existing entries
 *
 * The component communicates with the backend API to fetch mood categories
 * and subcategories, and to save or update journal entries.
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/CreateNoteView.css";
import BACKEND_BASE_URL from "../../Constants";

//---------------------------------Interfaces-------------------
// Define interfaces for mood data
interface MoodCategory {
  id: number;
  name: string;
}

interface MoodSubcategory {
  id: number;
  name: string;
  category: MoodCategory;
  description: string;
  mbti_insight: string;
}

interface Note {
  id: string;
  note_caption: string;
  note_content: string;
  note_date_created: string | null;
  mood_subcategory: number | null;
}

interface CreateNoteViewProps {
  inModal?: boolean;
  onSuccessCallback?: () => void;
  onCancelCallback?: () => void;
  noteToEdit?: Note | null;
  encryptNote?: (text: string, key: string) => string;
  decryptNote?: (ciphertext: string, key: string) => string;
  encryptionKey?: string;
}

//------------------------------------------------------------

const CreateNoteView: React.FC<CreateNoteViewProps> = ({
  inModal = false,
  onSuccessCallback,
  onCancelCallback,
  encryptNote,
  encryptionKey,
  noteToEdit = null,
}) => {
  // State for form fields
  const [caption, setCaption] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  // State for mood data
  const [moodCategories, setMoodCategories] = useState<MoodCategory[]>([]);
  const [moodSubcategories, setMoodSubcategories] = useState<MoodSubcategory[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    MoodSubcategory[]
  >([]);
  const [selectedSubcategoryDetails, setSelectedSubcategoryDetails] =
    useState<MoodSubcategory | null>(null);

  // State for form handling
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Fetch the CSRF token when component mounts
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (noteToEdit) {
      setCaption(noteToEdit.note_caption);
      setContent(noteToEdit.note_content);
      setSelectedMood(noteToEdit.mood_subcategory);
    }
  }, [noteToEdit]);

  useEffect(() => {
    const fetchMoodCategories = async () => {
      try {
        const response = await fetch(
          BACKEND_BASE_URL + "api/mood-categories/",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch mood categories");
        }

        const data = await response.json();
        setMoodCategories(data);
      } catch (err: any) {
        console.error("Error fetching mood categories:", err);
      }
    };

    fetchMoodCategories();
  }, []);

  // Fetch mood subcategories
  useEffect(() => {
    const fetchMoodSubcategories = async () => {
      try {
        const response = await fetch(
          BACKEND_BASE_URL + "api/mood-subcategories/",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch mood subcategories");
        }

        const data = await response.json();
        setMoodSubcategories(data);

        // If editing a note with a mood, select the corresponding category
        if (noteToEdit?.mood_subcategory) {
          const subcategory = data.find(
            (sub: MoodSubcategory) => sub.id === noteToEdit.mood_subcategory
          );
          if (subcategory) {
            setSelectedCategory(subcategory.category.id);
          }
        }
      } catch (err: any) {
        console.error("Error fetching mood subcategories:", err);
      }
    };

    fetchMoodSubcategories();
  }, [noteToEdit]);

  // Filter subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered = moodSubcategories.filter(
        (subcat) => subcat.category.id === selectedCategory
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategory, moodSubcategories]);

  // Update subcategory details when mood changes
  useEffect(() => {
    if (selectedMood) {
      const details = moodSubcategories.find(
        (subcat) => subcat.id === selectedMood
      );
      setSelectedSubcategoryDetails(details || null);
    } else {
      setSelectedSubcategoryDetails(null);
    }
  }, [selectedMood, moodSubcategories]);

  // Form validation
  useEffect(() => {
    // Simple validation: caption must not be empty
    setIsValid(caption.trim() !== "");
  }, [caption, content]);

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = parseInt(e.target.value);
    setSelectedCategory(categoryId);
    setSelectedMood(null); // Reset selected mood when category changes
    setSelectedSubcategoryDetails(null);
  };

  // Handle mood subcategory change
  const handleMoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const moodId = parseInt(e.target.value);
    setSelectedMood(moodId);

    // Find the details for this subcategory
    const details = moodSubcategories.find((subcat) => subcat.id === moodId);
    setSelectedSubcategoryDetails(details || null);
  };

  // Reset form fields
  const resetForm = () => {
    setCaption("");
    setContent("");
    setSelectedCategory(null);
    setSelectedMood(null);
    setSelectedSubcategoryDetails(null);
    setSubmitSuccess(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let noteData = {
      note_caption: caption,
      note_content: content,
      mood_subcategory: selectedMood,
    };

    //ENCRYPTION OF NOTE
    if (encryptNote && encryptionKey) {
      noteData = {
        ...noteData,
        note_caption: encryptNote(noteData.note_caption, encryptionKey),
        note_content: encryptNote(noteData.note_content, encryptionKey),
      };
    }

    try {
      // Determine if we're creating or updating
      const url = noteToEdit
        ? BACKEND_BASE_URL + `api/notes/${noteToEdit.id}/`
        : BACKEND_BASE_URL + "api/notes/";

      const method = noteToEdit ? "PUT" : "POST";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add CSRF token if available
      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      const response = await fetch(url, {
        method: method,
        headers: headers,
        credentials: "include",
        body: JSON.stringify(noteData),
      });

      const responseData = await response.text();

      if (!response.ok) {
        throw new Error(`Failed to save note: ${responseData}`);
      }

      // Call success callback if provided
      if (onSuccessCallback) {
        onSuccessCallback();
      }

      // Reset form if not in modal
      if (!inModal) {
        resetForm();
      }

      setSubmitSuccess(true);
      setError(null);
    } catch (err: any) {
      console.error("Error saving note:", err);
      setError(err.message);
      setSubmitSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`create-note-view ${inModal ? "in-modal" : ""}`}>
      {submitSuccess && !inModal && (
        <div className="alert alert-success mb-4">Note saved successfully!</div>
      )}

      {error && <div className="alert alert-danger mb-4">Error: {error}</div>}

      {!csrfToken && (
        <div className="alert alert-warning mb-4">
          Warning: CSRF token missing. Form submission may fail.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="note-form"
      >
        <div className="mb-4">
          <label
            htmlFor="note-caption"
            className="form-label"
          >
            Title
          </label>
          <input
            type="text"
            className="form-control note-title"
            id="note-caption"
            placeholder="Give your entry a title"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="note-content"
            className="form-label"
          >
            Journal Entry
          </label>
          <textarea
            className="form-control note-textarea"
            id="note-content"
            rows={6}
            placeholder="Write your thoughts here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>

        <div className="mood-selector mb-4">
          <h4 className="h5 mb-3">How are you feeling?</h4>

          <div className="mb-3">
            <label
              htmlFor="mood-category"
              className="form-label"
            >
              Mood Category
            </label>
            <select
              className="form-select"
              id="mood-category"
              value={selectedCategory || ""}
              onChange={handleCategoryChange}
            >
              <option value="">Select a category</option>
              {moodCategories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <div className="mb-3">
              <label
                htmlFor="mood-subcategory"
                className="form-label"
              >
                Specific Mood
              </label>
              <select
                className="form-select"
                id="mood-subcategory"
                value={selectedMood || ""}
                onChange={handleMoodChange}
                disabled={filteredSubcategories.length === 0}
              >
                <option value="">Select a specific mood</option>
                {filteredSubcategories.map((subcategory) => (
                  <option
                    key={subcategory.id}
                    value={subcategory.id}
                  >
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedSubcategoryDetails && (
            <div className="mood-details p-3 bg-light rounded mt-3">
              <h5 className="h6 mb-2">About this mood:</h5>
              <p className="mb-2 small">
                {selectedSubcategoryDetails.description}
              </p>
              {/* <h5 className="h6 mb-2">Personality insight:</h5> */}
              {/* <p className="mb-0 small">
                {selectedSubcategoryDetails.mbti_insight}
              </p> */}
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between mt-4">
          {inModal ? (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancelCallback}
              disabled={submitting}
            >
              Cancel
            </button>
          ) : (
            <Link
              to="/journal"
              className="btn btn-outline-secondary"
            >
              Back to Journal
            </Link>
          )}

          <button
            type="submit"
            className="btn btn-primary save-btn"
            disabled={submitting || !isValid}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {noteToEdit ? "Updating..." : "Saving..."}
              </>
            ) : noteToEdit ? (
              "Update Entry"
            ) : (
              "Save Entry"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNoteView;
