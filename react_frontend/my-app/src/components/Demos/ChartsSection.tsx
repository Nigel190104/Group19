/**
 * ChartSection Component
 *
 * A marketing section that showcases the mood tracking and analytics features
 * of the BetterDays app. Displays two main features with interactive demos:
 * 1. Mood Analytics - Visual charts showing emotional patterns over time
 * 2. Mood History - Comprehensive display of past emotional states
 *
 * Each feature is presented with descriptive text, benefit highlights,
 * and a visual demo component to illustrate the functionality.
 *
 * Used in Landing page (demos section)
 */

import React from "react";
import MoodAnalyticsDemo from "./JournalAnalyticsDemo";
import JournalHistoryDemo from "./JournalHistoryDemo";
import "../css/ChartSection.css";

const ChartSection: React.FC = () => {
  return (
    <section className="mood-analytics-section py-5">
      <div className="container-fluid">
        <div className="row mb-3">
          <div className="col-lg-12 text-center">
            <h2 className="section-title">Track Your Emotional Journey</h2>
            <p className="section-subtitle">
              Visualise your moods and understand patterns in your emotional
              wellbeing
            </p>
          </div>
        </div>

        <div className="row align-items-center mb-5">
          <div
            className="col-lg-6 mb-4 mb-lg-0"
            data-aos="fade-right"
            data-aos-duration="1000"
          >
            <h3 className="feature-title">Intuitive Mood Analytics</h3>
            <p className="feature-text">
              Get meaningful insights about your emotional patterns with our
              beautiful and easy-to-understand charts. See how your mood evolves
              over time and identify factors that influence your wellbeing.
            </p>
            <div className="app-stats-container">
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Visualise
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={32}
                    height={32}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d7845f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="8"
                      rx="2"
                      ry="2"
                    ></rect>
                    <rect
                      x="2"
                      y="14"
                      width="20"
                      height="8"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line
                      x1="6"
                      y1="6"
                      x2="6.01"
                      y2="6"
                    ></line>
                    <line
                      x1="6"
                      y1="18"
                      x2="6.01"
                      y2="18"
                    ></line>
                  </svg>
                </span>
                <span className="app-stat-text">
                  Track how your mood changes over time
                </span>
              </div>
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Insight
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={32}
                    height={32}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d7845f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                  </svg>
                </span>
                <span className="app-stat-text">
                  Discover trends and patterns in your emotional wellbeing
                </span>
              </div>
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Growth
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={32}
                    height={32}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d7845f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 6l-9.5 9.5-5-5L1 18"></path>
                    <path d="M17 6h6v6"></path>
                  </svg>
                </span>
                <span className="app-stat-text">
                  See your emotional growth and improvement over time
                </span>
              </div>
            </div>
          </div>
          <div
            className="col-lg-6"
            data-aos="fade-left"
            data-aos-duration="1000"
            data-aos-delay="200"
          >
            <MoodAnalyticsDemo />
          </div>
        </div>

        <div className="row align-items-center">
          <div
            className="col-lg-6 order-lg-2 mb-4 mb-lg-0"
            data-aos="fade-left"
            data-aos-duration="1000"
          >
            <h3 className="feature-title">Comprehensive Mood History</h3>
            <p className="feature-text">
              Review your past emotional states at a glance with our detailed
              mood history. Understand which emotions dominate your days and
              track positive mood trends to celebrate your progress.
            </p>
            <div className="app-stats-container">
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Track
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={32}
                    height={32}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d7845f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line
                      x1="16"
                      y1="2"
                      x2="16"
                      y2="6"
                    ></line>
                    <line
                      x1="8"
                      y1="2"
                      x2="8"
                      y2="6"
                    ></line>
                    <line
                      x1="3"
                      y1="10"
                      x2="21"
                      y2="10"
                    ></line>
                  </svg>
                </span>
                <span className="app-stat-text">
                  Monitor your emotional states day by day
                </span>
              </div>
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Celebrate
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={32}
                    height={32}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d7845f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                </span>
                <span className="app-stat-text">
                  See your positive mood percentage and celebrate progress
                </span>
              </div>
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Reflect
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={32}
                    height={32}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d7845f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </span>
                <span className="app-stat-text">
                  Easily recall and reflect on your emotional journey
                </span>
              </div>
            </div>
          </div>
          <div
            className="col-lg-6 order-lg-1"
            data-aos="fade-right"
            data-aos-duration="1000"
            data-aos-delay="200"
          >
            <JournalHistoryDemo />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChartSection;
