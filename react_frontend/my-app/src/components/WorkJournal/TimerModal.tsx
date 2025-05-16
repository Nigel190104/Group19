/**
 * TimerModal Component
 *
 * A time tracking interface that allows users to record time spent on tasks
 * within the work journal. Features a stopwatch-style timer with save functionality.
 *
 * Features:
 * - Start/stop timer controls for tracking task duration
 * - Real-time display of elapsed time in hours:minutes:seconds format
 * - Automatic conversion of elapsed seconds to minutes for time logging
 * - Confirmation dialogue when attempting to close with unsaved time
 * - Display of current logged time for the selected task
 * - Prevention of accidental timer interruption
 *
 * The component helps users accurately track and record time spent on work
 * tasks to improve productivity monitoring and task management.
 */

import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";

interface Task {
  id: string;
  task_name: string;
  time_spent: number;
}

interface TimerModalProps {
  show: boolean;
  onHide: () => void;
  task: Task | null;
  onTimerStop: (taskId: string, additionalMinutes: number) => void;
}

const TimerModal: React.FC<TimerModalProps> = ({
  show,
  onHide,
  task,
  onTimerStop,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeSaved, setTimeSaved] = useState(true);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Reset timer when modal opens
  useEffect(() => {
    if (show) {
      setElapsedTime(0);
      setTimerActive(false);
      setTimeSaved(true);
    }
  }, [show]);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
        setTimeSaved(false);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleStartTimer = () => {
    setTimerActive(true);
  };

  const handleStopTimer = () => {
    setTimerActive(false);

    if (task) {
      const minutesElapsed = Math.max(1, Math.floor(elapsedTime / 60));
      onTimerStop(task.id, minutesElapsed);
      setTimeSaved(true);
    }
  };

  const handleClose = () => {
    if (!timeSaved && elapsedTime > 0) {
      setShowConfirmClose(true);
    } else {
      onHide();
    }
  };

  const handleForceClose = () => {
    setShowConfirmClose(false);
    onHide();
  };

  const handleSaveAndClose = () => {
    if (task && elapsedTime > 0) {
      const minutesElapsed = Math.max(1, Math.floor(elapsedTime / 60));
      onTimerStop(task.id, minutesElapsed);
    }
    setShowConfirmClose(false);
    onHide();
  };

  // Format time display
  const formatTimer = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format time in hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <Modal
        show={show && !showConfirmClose}
        onHide={handleClose}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton={!timerActive}>
          <Modal.Title>Time Tracking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {task && (
            <div className="text-center">
              <h4 className="mb-3">{task.task_name}</h4>
              <div className="timer-display mb-4">
                <div className="time h1">{formatTimer(elapsedTime)}</div>
              </div>
              <div className="mb-3">
                {!timerActive ? (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleStartTimer}
                  >
                    Start Timer
                  </button>
                ) : (
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={handleStopTimer}
                  >
                    Stop Timer
                  </button>
                )}
              </div>
              <p className="mb-0">
                Current logged time: {formatTime(task.time_spent)}
              </p>
              {!timeSaved && elapsedTime > 0 && (
                <p className="text-danger small mt-2">
                  Don't forget to stop the timer to save your progress
                </p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={timerActive}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        show={showConfirmClose}
        onHide={() => setShowConfirmClose(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title>Unsaved Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You have unsaved time tracking progress. What would you like to do?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={handleForceClose}
          >
            Discard Time
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveAndClose}
          >
            Save Time
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TimerModal;
