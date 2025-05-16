/**
 * AppWalkthrough Component
 *
 * An interactive step-by-step demonstration of the BetterDays app features.
 * Presents a timeline interface with 5 key steps showing how the app works,
 * including mood tracking, journaling, analytics, progress tracking, and
 * personalized insights. Each step includes visual examples and explanatory text.
 *
 * Used in Landing page
 */

import React, { useState } from "react";
import "../css/AppWalkthrough.css";
import MoodAnalyticsDemo from "./JournalAnalyticsDemo";
import JournalHistoryDemo from "./JournalHistoryDemo";

const AppWalkthrough = () => {
  const [activeStep, setActiveStep] = useState(1);

  const handleStepClick = (stepNumber: number): void => {
    setActiveStep(stepNumber);
  };

  return (
    <div className="app-walkthrough py-5">
      <div className="container">
        <h2 className="section-title text-center mb-5">How BetterDays Works</h2>

        <div className="timeline-container">
          <div className="timeline-line"></div>

          {/* Step 1 */}
          <div
            className={`timeline-step ${activeStep === 1 ? "active" : ""}`}
            onClick={() => handleStepClick(1)}
          >
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Track Your Moods</h3>
              <p>
                Quickly log how you're feeling each day with our intuitive mood
                tracker. Choose from a variety of emotions and add context to
                each entry.
              </p>
              <div className="step-preview">
                <div className="mood-entry-demo">
                  <div className="mood-selection">
                    <div className="mood-option selected">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mood-icon happy"
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
                      <span>Happy</span>
                    </div>
                    <div className="mood-option">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mood-icon calm"
                      >
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                        <line
                          x1="6"
                          y1="1"
                          x2="6"
                          y2="4"
                        ></line>
                        <line
                          x1="10"
                          y1="1"
                          x2="10"
                          y2="4"
                        ></line>
                        <line
                          x1="14"
                          y1="1"
                          x2="14"
                          y2="4"
                        ></line>
                      </svg>
                      <span>Calm</span>
                    </div>
                    <div className="mood-option">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mood-icon energy"
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                      </svg>
                      <span>Energetic</span>
                    </div>
                  </div>
                  <div className="mood-form">
                    <label>What made you feel this way?</label>
                    <textarea
                      placeholder="Had a productive morning and completed my project ahead of schedule..."
                      rows={2}
                    ></textarea>
                    <button className="save-mood-btn">Save Entry</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`timeline-step ${activeStep === 2 ? "active" : ""}`}
            onClick={() => handleStepClick(2)}
          >
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Journal Your Thoughts</h3>
              <p>
                Write daily journal entries to capture your experiences,
                thoughts, and reflections. Add context to your moods and track
                personal growth.
              </p>
              <div className="step-preview">
                <div className="journal-entry-demo">
                  <div className="journal-header">
                    <div className="date-display">
                      <span className="day">12</span>
                      <span className="month">APR</span>
                    </div>
                    <input
                      type="text"
                      className="journal-title"
                      placeholder="Today's reflection..."
                      value="Morning walk and productive day"
                      readOnly
                    />
                  </div>
                  <div className="journal-body">
                    <textarea
                      placeholder="What's on your mind today?"
                      rows={3}
                      readOnly
                    >
                      Started the day with a refreshing walk in the park. The
                      morning air helped clear my thoughts and I felt energized
                      for the day ahead. Managed to complete two major tasks
                      that had been pending for a while.
                    </textarea>
                  </div>
                  <div className="journal-footer">
                    <div className="journal-mood">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mood-icon energy"
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                      </svg>
                      <span>Feeling Energetic</span>
                    </div>
                    <button className="journal-save-btn">Save Entry</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={`timeline-step ${activeStep === 3 ? "active" : ""}`}
            onClick={() => handleStepClick(3)}
          >
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>View Mood Analytics</h3>
              <p>
                Gain insights from interactive visualizations that reveal
                patterns in your emotional wellbeing over time.
              </p>
              <div className="step-preview">
                <div className="analytics-preview">
                  <div className="mini-chart">
                    {/* This would be a smaller version of your MoodAnalyticsDemo */}
                    <div className="chart-placeholder">
                      <div className="chart-line">
                        <div
                          className="chart-dot"
                          style={{ left: "10%", bottom: "30%" }}
                        ></div>
                        <div
                          className="chart-dot"
                          style={{ left: "25%", bottom: "20%" }}
                        ></div>
                        <div
                          className="chart-dot"
                          style={{ left: "40%", bottom: "15%" }}
                        ></div>
                        <div
                          className="chart-dot"
                          style={{ left: "55%", bottom: "40%" }}
                        ></div>
                        <div
                          className="chart-dot"
                          style={{ left: "70%", bottom: "60%" }}
                        ></div>
                        <div
                          className="chart-dot"
                          style={{ left: "85%", bottom: "70%" }}
                        ></div>
                      </div>
                      <div className="chart-label">
                        Trending positive by 37%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div
            className={`timeline-step ${activeStep === 4 ? "active" : ""}`}
            onClick={() => handleStepClick(4)}
          >
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Track Your Progress</h3>
              <p>
                Review your mood history to see how far you've come. Identify
                trends and celebrate positive changes in your emotional
                wellbeing.
              </p>
              <div className="step-preview">
                <div className="mood-history-preview">
                  <div className="history-stats">
                    <div className="stat-circle">
                      <span className="stat-number">70%</span>
                      <span className="stat-label">Positive Mood</span>
                    </div>
                  </div>
                  <div className="history-entries">
                    <div className="history-entry">
                      <div className="entry-date">Apr 12</div>
                      <div className="entry-mood">Energetic</div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mood-icon energy"
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                      </svg>
                    </div>
                    <div className="history-entry">
                      <div className="entry-date">Apr 10</div>
                      <div className="entry-mood">Happy</div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mood-icon happy"
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div
            className={`timeline-step ${activeStep === 5 ? "active" : ""}`}
            onClick={() => handleStepClick(5)}
          >
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Get Personalized Insights</h3>
              <p>
                Receive tailored recommendations and insights based on your mood
                patterns to help improve your overall wellbeing.
              </p>
              <div className="step-preview">
                <div className="insights-preview">
                  <div className="insight-card">
                    <div className="insight-header">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                      </svg>
                      <h4>Weekly Insight</h4>
                    </div>
                    <div className="insight-body">
                      <p>
                        Your mood tends to improve after outdoor activities.
                        Consider incorporating more nature walks into your
                        routine.
                      </p>
                    </div>
                    <div className="insight-actions">
                      <button className="insight-btn">Save Insight</button>
                      <button className="insight-btn outline">
                        Add to Journal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cta-container text-center mt-5">
          <p className="cta-text">Ready to start your wellness journey?</p>
          <button className="cta-button">Get Started Free</button>
        </div>
      </div>
    </div>
  );
};

export default AppWalkthrough;
