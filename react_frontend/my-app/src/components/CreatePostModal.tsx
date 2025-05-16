/**
 * CreatePostModal Component
 *
 * A modal interface for creating and editing social posts in the community feed.
 * Supports text content and media uploads with preview functionality.
 *
 * Features:
 * - Creation of text posts with optional title
 * - Media upload support for images and videos
 * - Preview display of selected media before posting
 * - Form validation with error messaging
 * - Edit mode for modifying existing posts
 * - CSRF token integration for secure submission
 * - Loading state indication during API operations
 *
 * This component facilitates social interaction within the BetterDays app,
 * enabling users to share updates, achievements, and media with the community.
 */

import React, { useState, useEffect, ChangeEvent, useContext } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./css/CreatePostModal.css"; // Import a new CSS file for the modal
import BACKEND_BASE_URL from "../Constants"; // Assuming you have this
import { AuthContext } from "../App";

interface CreatePostModalProps {
  show: boolean;
  handleClose: () => void;
  onPostSuccess: () => void; // Callback after successful post
  initialData?: {
    id: number;
    content: string;
    image_url?: string;
    media_type?: "image" | "video";
  } | null;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  show,
  handleClose,
  onPostSuccess,
  initialData = null,
}) => {
  const { userId } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(initialData?.content || "");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(
    initialData?.image_url || null
  );
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(
    initialData?.media_type || null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

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
      setCsrfToken(getCSRFToken());
    }
  }, [show]);

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || "");
      setMediaPreviewUrl(initialData.image_url || null);
      setMediaType(initialData.media_type || null);
      setMediaFile(null);
    } else {
      setTitle("");
      setContent("");
      setMediaFile(null);
      setMediaPreviewUrl(null);
      setMediaType(null);
      setError(null);
    }
  }, [initialData, show]);

  useEffect(() => {
    setIsValid(content.trim() !== "" || mediaFile !== null);
  }, [content, mediaFile]);

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleMediaUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaType(file.type.startsWith("video") ? "video" : "image");
      setMediaPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setMediaType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    if (!userId) {
      setError("User ID is required to create a post");
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("user", userId.toString());
    formData.append("post_title", title);
    formData.append("post_description", content.trim());
    formData.append(
      "post_date_created",
      new Date().toISOString().slice(0, 19) + "Z"
    );
    formData.append("achievements", null as any);
    if (mediaFile) {
      formData.append("post_image", mediaFile);
    }

    const url = initialData?.id
      ? BACKEND_BASE_URL + `api/posts/${initialData.id}/`
      : BACKEND_BASE_URL + "api/posts/";
    const method = initialData?.id ? "PUT" : "POST";

    const headers: Record<string, string> = {};
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        credentials: "include",
        body: formData,
      });

      const responseData = await response.text();

      if (!response.ok) {
        try {
          const errorJson = JSON.parse(responseData);
          const message =
            errorJson.detail || errorJson.error || JSON.stringify(errorJson);
          throw new Error(
            `Failed to ${
              initialData?.id ? "update" : "create"
            } post: ${message}`
          );
        } catch (parseError) {
          throw new Error(
            `Failed to ${initialData?.id ? "update" : "create"} post: ${
              response.status
            } ${response.statusText}. Response: ${responseData}`
          );
        }
      }

      onPostSuccess();
      handleClose();
      setTitle("");
      setContent("");
      setMediaFile(null);
      setMediaPreviewUrl(null);
      setMediaType(null);
    } catch (err: any) {
      console.error("Error with post:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    handleClose();
    setTitle("");
    setContent("");
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setMediaType(null);
    setError(null);
  };

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      centered
      className="create-post-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Create New Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        {!csrfToken && show && (
          <div className="alert alert-warning mb-3">
            Warning: CSRF token missing. Post submission may fail.
          </div>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group
            className="mb-3"
            controlId="postTitle"
          >
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter post title..."
              value={title}
              onChange={handleTitleChange}
              disabled={submitting}
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="postContent"
          >
            <Form.Label>What's on your mind?</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Write something here..."
              value={content}
              onChange={handleContentChange}
              disabled={submitting}
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="mediaUpload"
          >
            <Form.Label>Add Media (Optional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              disabled={submitting}
            />
            {mediaPreviewUrl && (
              <div className="mt-2">
                {mediaType === "video" ? (
                  <video
                    src={mediaPreviewUrl}
                    controls
                    className="img-fluid"
                    style={{ maxHeight: "200px" }}
                  />
                ) : (
                  <img
                    src={mediaPreviewUrl}
                    alt="Media Preview"
                    className="img-fluid"
                    style={{ maxHeight: "200px" }}
                  />
                )}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleRemoveMedia}
                  className="mt-1"
                >
                  Remove Media
                </Button>
              </div>
            )}
          </Form.Group>
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
          onClick={handleSubmit}
          disabled={submitting || !isValid}
          className="post-btn"
        >
          {submitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePostModal;
