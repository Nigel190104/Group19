/**
 * Journal Component
 *
 * A comprehensive interface for viewing, creating, editing and managing journal entries.
 * Provides the main journal experience with mood tracking analytics in the BetterDays app.
 *
 * Features:
 * - Month-based navigation and filtering of journal entries
 * - Creation and editing of encrypted journal entries
 * - Mood categorisation and filtering of entries
 * - Search functionality for finding specific entries
 * - Mood history visualisation and analytics
 * - Pagination for handling multiple entries
 * - Toggle between personal and work journals
 *
 * The component handles end-to-end encryption for private journal entries
 * and integrates multiple sub-components to provide a complete journalling experience.
 */

import "aos/dist/aos.css";
import CryptoJS from "crypto-js";
import React, { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { AuthContext } from "../../App";
import BACKEND_BASE_URL from "../../Constants";
import "../css/Journal.css";
import "../css/NoteOperationsDropdown.css";
import CreateNoteView from "./CreateNoteView";
import JournalNote from "./JournalNote";
import MonthSelector from "../MonthSelector";
import MoodAnalytics from "../MoodAnalytics";
import MoodHistory from "../MoodHistory";
import NoteSearchBar from "../NotesSearchBar";
import SortDropdown from "../SortDrowdown";
import JournalToggle from "./JournalToggle";

//---------------------Interfaces----------------------------
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
  mood_subcategory: number | null; // Just the ID from the API
}
//-------------------------------------------------------------

interface JournalProps {
  activeJournal: "personal" | "work";
  onToggleJournal: (journal: "personal" | "work") => void;
}

const Journal: React.FC<JournalProps> = ({
  activeJournal,
  onToggleJournal,
}) => {
  const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || "";

  //-----------------for month selector-----------------
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  //-------------------for notes display-----------------
  const { isAuthenticated } = useContext(AuthContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [moodSubcategories, setMoodSubcategories] = useState<MoodSubcategory[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [moodsLoading, setMoodsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 5;

  //-------------------for modal + editing --------------
  // State for the note creation/editing modal
  const [showModal, setShowModal] = useState(false);
  // New states for editing and deleting notes
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  //-------------------for search bar + category filtering --------------
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<Note[]>([]);

  //-------------------utility functions-----------------
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

  //-------------------data fetching--------------------
  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([getNotes(), fetchMoodSubcategories()]);
    }
  }, [isAuthenticated]);

  // Filter notes based on selected month and year
  useEffect(() => {
    if (notes.length > 0) {
      const filtered = notes.filter((note) => {
        if (!note.note_date_created) return false;

        const noteDate = new Date(note.note_date_created);
        return (
          noteDate.getMonth() === selectedMonth &&
          noteDate.getFullYear() === selectedYear
        );
      });

      setFilteredNotes(filtered);
      setCurrentPage(1);

      // Clear search when changing months
      if (isSearchActive) {
        setIsSearchActive(false);
        setSearchResults([]);
      }
    }
  }, [notes, selectedMonth, selectedYear]);

  const getNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(BACKEND_BASE_URL + "api/notes/", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();

      // Decrypt individual notes if we have an encryption key
      if (ENCRYPTION_KEY) {
        const decryptedNotes = data.map((note: Note) => {
          try {
            // Attempt to decrypt the note fields
            return {
              ...note,
              note_caption: decryptNote(note.note_caption, ENCRYPTION_KEY),
              note_content: decryptNote(note.note_content, ENCRYPTION_KEY),
            };
          } catch (error) {
            console.warn(
              `Failed to decrypt note ${note.id}, assuming it's not encrypted:`,
              error
            );
            // Return the original note if decryption fails
            return note;
          }
        });

        setNotes(decryptedNotes.reverse());
      } else {
        // If no encryption key, just use the notes as-is
        setNotes(data.reverse());
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch mood subcategories
  const fetchMoodSubcategories = async () => {
    setMoodsLoading(true);
    try {
      // Adjust the endpoint URL to match your actual API
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
    } catch (err: any) {
    } finally {
      setMoodsLoading(false);
    }
  };

  //-------------------modal handling-------------------
  // Function to handle opening the modal
  const handleShowModal = () => {
    setEditingNote(null); // Reset editing state when creating a new note
    setShowModal(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null); // Clear any editing state
  };

  // Function to handle successful note creation or edit
  const handleNoteCreated = () => {
    setShowModal(false);
    setEditingNote(null); // Clear editing state
    getNotes(); // Refresh the notes list
  };

  //-------------------note operations------------------
  // Handle edit note
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowModal(true);
  };

  // Handle delete note
  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note);
    setShowDeleteModal(true);
  };

  //-------------------encryption/decryption of sensitive info------------------
  const encryptNote = (text: string, key: string): string => {
    return CryptoJS.AES.encrypt(text, key).toString();
  };

  const decryptNote = (ciphertext: string, key: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  };
  //-------------------encryption/decryption of sensitive info------------------

  // Function to confirm deletion
  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      // Get CSRF token
      const csrfToken = getCSRFToken();

      const headers: Record<string, string> = {};

      // Add CSRF token if available
      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      const response = await fetch(
        BACKEND_BASE_URL + `api/notes/${noteToDelete.id}/`,
        {
          method: "DELETE",
          headers: headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Delete error response:", errorText);
        throw new Error(`Failed to delete note: ${errorText}`);
      }

      // Remove the deleted note from state
      setNotes(notes.filter((note) => note.id !== noteToDelete.id));
      setFilteredNotes(
        filteredNotes.filter((note) => note.id !== noteToDelete.id)
      );

      // Also remove from search results if search is active
      if (isSearchActive) {
        setSearchResults(
          searchResults.filter((note) => note.id !== noteToDelete.id)
        );
      }

      setShowDeleteModal(false);
      setNoteToDelete(null);
    } catch (err: any) {
      console.error("Error deleting note:", err);
      setError(err.message);
    }
  };

  // Function to cancel deletion
  const cancelDeleteNote = () => {
    setShowDeleteModal(false);
    setNoteToDelete(null);
  };

  //-------------------filtering and sorting------------
  // handles category selection in the search bar
  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategoryFilter(categoryId);
    setCurrentPage(1); // Reset to first page when changing filters

    // Clear search when changing category
    if (isSearchActive) {
      setIsSearchActive(false);
      setSearchResults([]);
    }
  };

  // Handle search functionality
  const handleSearch = (searchResults: Note[]) => {
    setSearchResults(searchResults);
    setIsSearchActive(true);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Clear search results
  const clearSearch = () => {
    setIsSearchActive(false);
    setSearchResults([]);
  };

  // Handle month change from MonthSelector
  const handleMonthChange = (monthIndex: number, year: number) => {
    setSelectedMonth(monthIndex);
    setSelectedYear(year);
  };

  // Determine which notes to display
  const notesToDisplay = isSearchActive
    ? searchResults.filter((note) => {
        // Apply category filter to search results if a category is selected
        if (selectedCategoryFilter === "") {
          return true;
        } else {
          const subcategory = moodSubcategories.find(
            (subcategory) => subcategory.id === note.mood_subcategory
          );
          return (
            subcategory &&
            subcategory.category.id.toString() === selectedCategoryFilter
          );
        }
      })
    : filteredNotes.filter((note) => {
        if (selectedCategoryFilter === "") {
          return true; // Show all notes if no category is selected
        } else {
          // Find the subcategory for this note
          const subcategory = moodSubcategories.find(
            (subcategory) => subcategory.id === note.mood_subcategory
          );

          // Check if the subcategory's category matches the selected one
          return (
            subcategory &&
            subcategory.category.id.toString() === selectedCategoryFilter
          );
        }
      });

  //-------------------pagination----------------------
  // Pagination with updated note source
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = notesToDisplay.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(notesToDisplay.length / notesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  //-------------------data formatting-----------------
  // Function to format mood data for JournalNote component
  const formatMoodForJournalNote = (note: Note) => {
    if (note.mood_subcategory === null) {
      return null;
    }

    // Find the matching subcategory using the ID
    const subcategory = moodSubcategories.find(
      (mood) => mood.id === note.mood_subcategory
    );

    if (subcategory) {
      return {
        name: subcategory.name,
        category: subcategory.category.name,
      };
    }

    // If no mood data yet (still loading)
    if (moodsLoading) {
      return {
        name: "Loading...",
        category: "Loading...",
      };
    }

    // If couldn't find the subcategory, which shouldn't happen if the database is consistent
    console.warn(`Mood subcategory with ID ${note.mood_subcategory} not found`);
    return null;
  };

  // Get month name for display
  const monthName = new Date(selectedYear, selectedMonth).toLocaleString(
    "en-US",
    { month: "long" }
  );

  //-------------------component rendering-------------
  return (
    <div className="container-fluid py-2">
      <div
        className="journal-header d-flex justify-content-between align-items-start mb-4"
        data-aos="fade-down"
        data-aos-duration="800"
      >
        <div className="col-lg-8 ps-0">
          <h1 className="journal-title fw-bold mb-0">Journal</h1>
          <p className="card-subtitle text-muted mb-2">
            Review and reflect on your past thoughts and experiences
          </p>
        </div>

        <div className="col-lg-4 pe-0">
          {/* <NoteSearchBar
            moodSubcategories={moodSubcategories}
            onCategorySelect={handleCategoryFilter}
            selectedCategory={selectedCategoryFilter}
            notes={filteredNotes}
            onSearch={handleSearch}
          /> */}
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

      {/* Show active filters */}
      {(selectedCategoryFilter !== "" || isSearchActive) && (
        <div
          className="mb-3 d-flex align-items-center"
          data-aos="fade-in"
          data-aos-duration="600"
        >
          <span className="me-2">Active filters:</span>
          {selectedCategoryFilter !== "" && (
            <span className="mood-filter fs-5">
              {" "}
              {
                moodSubcategories.find(
                  (m) => m.category.id.toString() === selectedCategoryFilter
                )?.category.name
              }
              <button
                onClick={() => setSelectedCategoryFilter("")}
                className="close-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="#918b87"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  >
                    <path d="M5.47 5.47a.75.75 0 0 1 1.06 0l12 12a.75.75 0 1 1-1.06 1.06l-12-12a.75.75 0 0 1 0-1.06"></path>
                    <path d="M18.53 5.47a.75.75 0 0 1 0 1.06l-12 12a.75.75 0 0 1-1.06-1.06l12-12a.75.75 0 0 1 1.06 0"></path>
                  </g>
                </svg>
              </button>
            </span>
          )}
        </div>
      )}

      <div className="row">
        <div
          data-aos="fade-up"
          data-aos-duration="600"
        >
          <JournalToggle
            activeJournal={activeJournal}
            onToggle={onToggleJournal}
          />
        </div>
        <div className="col-lg-8">
          <div
            className="journal-card-container position-relative"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            {/* Notebook tab style button positioned on top of the card */}
            <button
              className="new-entry-button-5 fw-medium d-flex align-items-center fs-5"
              onClick={handleShowModal}
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
                className="d-flex utility justify-content-between align-items-center"
                data-aos="fade-in"
                data-aos-duration="600"
              >
                <MonthSelector
                  onMonthChange={handleMonthChange}
                  currentMonth={monthName}
                  currentYear={selectedYear}
                />
                <NoteSearchBar
                  moodSubcategories={moodSubcategories}
                  onCategorySelect={handleCategoryFilter}
                  selectedCategory={selectedCategoryFilter}
                  notes={filteredNotes}
                  onSearch={handleSearch}
                />
                <SortDropdown
                  notes={filteredNotes}
                  onSort={setFilteredNotes}
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
                  <p className="mt-2">Loading your journal entries...</p>
                </div>
              ) : notesToDisplay.length === 0 ? (
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
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect
                        x="8"
                        y="2"
                        width="8"
                        height="4"
                        rx="1"
                        ry="1"
                      ></rect>
                      <path d="M12 11h4"></path>
                      <path d="M12 16h4"></path>
                      <path d="M8 11h.01"></path>
                      <path d="M8 16h.01"></path>
                    </svg>
                  </div>
                  <h3
                    className="h5 mb-2"
                    data-aos="fade-up"
                    data-aos-delay="400"
                  >
                    {isSearchActive
                      ? "No entries match your search criteria"
                      : selectedCategoryFilter !== ""
                      ? "No entries match your filter criteria"
                      : `No entries for ${monthName} ${selectedYear}`}
                  </h3>
                  <p
                    className="text-muted mb-4"
                    data-aos="fade-up"
                    data-aos-delay="500"
                  >
                    {isSearchActive
                      ? "Try a different search term or clear the search"
                      : selectedCategoryFilter !== ""
                      ? "Try selecting a different category or clear the current filter"
                      : selectedMonth === today.getMonth() &&
                        selectedYear === today.getFullYear()
                      ? "Start journaling to see your entries here"
                      : "Try selecting a different month or create a new entry"}
                  </p>
                  {selectedMonth === today.getMonth() &&
                  selectedYear === today.getFullYear() &&
                  selectedCategoryFilter === "" &&
                  !isSearchActive ? (
                    <button
                      className="first-entry-btn"
                      onClick={handleShowModal}
                      data-aos="zoom-in"
                      data-aos-delay="600"
                    >
                      Create New Entry
                    </button>
                  ) : (
                    <p
                      className="text-muted small"
                      data-aos="fade-in"
                      data-aos-delay="600"
                    >
                      {isSearchActive || selectedCategoryFilter !== ""
                        ? "Try adjusting your filters to see more entries"
                        : "You can only create entries for the current month"}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="journal-entries-grid">
                    {currentNotes.map((note, index) => {
                      const moodData = formatMoodForJournalNote(note);

                      return (
                        <div
                          key={note.id}
                          className="journal-entry-item mb-4"
                          data-aos="fade-up"
                          data-aos-duration="800"
                          data-aos-delay={100 * (index % 5)}
                        >
                          <JournalNote
                            date={
                              note.note_date_created
                                ? new Date(note.note_date_created)
                                    .getDate()
                                    .toString()
                                : "N/A"
                            }
                            day={
                              note.note_date_created
                                ? new Date(
                                    note.note_date_created
                                  ).toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })
                                : "N/A"
                            }
                            title={note.note_caption}
                            description={note.note_content}
                            mood={moodData}
                            onEdit={() => handleEditNote(note)}
                            onDelete={() => handleDeleteNote(note)}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div
                      className="pagination-container mt-4 d-flex justify-content-center"
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      <nav aria-label="Journal entries pagination">
                        <ul className="pagination">
                          <li
                            className={`page-item ${
                              currentPage === 1 ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>

                          {[...Array(totalPages)].map((_, index) => (
                            <li
                              key={index}
                              className={`page-item ${
                                currentPage === index + 1 ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => paginate(index + 1)}
                              >
                                {index + 1}
                              </button>
                            </li>
                          ))}

                          <li
                            className={`page-item ${
                              currentPage === totalPages ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => paginate(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div
            className="journal-card shadow-sm p-4 mb-4"
            data-aos="fade-left"
            data-aos-duration="800"
            data-aos-delay="300"
          >
            <div className="card-header border-0 bg-transparent mb-3">
              <div className="d-flex align-items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7a4a2b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  ></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line
                    x1="9"
                    y1="9"
                    x2="9.01"
                    y2="9"
                  ></line>
                  <line
                    x1="15"
                    y1="9"
                    x2="15.01"
                    y2="9"
                  ></line>
                </svg>
                <h2 className="card-title h4 mb-0">Mood History</h2>
              </div>

              <p className="card-subtitle text-muted mb-2">
                Track your emotional wellbeing over time
              </p>
            </div>
            <div className="card-body p-0">
              {moodsLoading || loading ? (
                <div className="text-center py-4">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 small text-muted">Loading mood data...</p>
                </div>
              ) : (
                <MoodHistory
                  notes={notes}
                  moodSubcategories={moodSubcategories}
                />
              )}
            </div>
          </div>

          <div
            data-aos="fade-left"
            data-aos-duration="800"
            data-aos-delay="400"
          >
            <MoodAnalytics
              notes={notes}
              moodSubcategories={moodSubcategories}
            />
          </div>
        </div>
      </div>

      {/* Modal for creating or editing a note */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
        className="journal-note-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingNote ? "Edit Journal Entry" : "New Journal Entry"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="create-note-modal-wrapper">
            <CreateNoteView
              inModal={true}
              onSuccessCallback={handleNoteCreated}
              onCancelCallback={handleCloseModal}
              noteToEdit={editingNote}
              encryptNote={encryptNote}
              encryptionKey={ENCRYPTION_KEY}
            />
          </div>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={cancelDeleteNote}
        backdrop="static"
        keyboard={false}
        size="sm"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this journal entry?</p>
          <p className="text-muted small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-outline-secondary"
            onClick={cancelDeleteNote}
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

export default Journal;
