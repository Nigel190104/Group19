/**
 * HabitTrackerDemo Component
 *
 * An interactive demonstration of the habit tracking functionality in the BetterDays app.
 * Features a functional grid interface showing habit completion across multiple days,
 * allowing users to toggle habit completion statuses by clicking on cells.
 *
 * The component includes sample habits with predefined completion data and
 * displays informational text about the benefits of habit tracking alongside
 * the interactive demo.
 */

import React, { useState } from "react";
// Using the same CSS from your main component

interface Habit {
  id: number;
  name: string;
  completions: Record<string, boolean>; // Format: {'YYYY-MM-DD': true}
  streak_count: number;
  habit_colour: string;
}

const HabitTrackerDemo: React.FC = () => {
  const today = new Date();
  const currentDayOfWeek = today.getDay();

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const dates = [
    { day: 31, month: 2, year: 2025, dateString: "2025-03-31" },
    { day: 1, month: 3, year: 2025, dateString: "2025-04-01" },
    { day: 2, month: 3, year: 2025, dateString: "2025-04-02" },
    { day: 3, month: 3, year: 2025, dateString: "2025-04-03" },
    { day: 4, month: 3, year: 2025, dateString: "2025-04-04" },
  ];

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: 1,
      name: "Journaling",
      completions: {
        "2025-03-31": true,
        "2025-04-01": true,
        "2025-04-02": true,
        "2025-04-04": true,
      },
      streak_count: 3,
      habit_colour: "#ffd1ba",
    },
    {
      id: 2,
      name: "Drink Water",
      completions: {
        "2025-03-31": true,
        "2025-04-02": true,
        "2025-04-03": true,
      },
      streak_count: 2,
      habit_colour: "#ffb8a8",
    },
    {
      id: 4,
      name: "20,000 steps",
      completions: {
        "2025-04-01": true,
        "2025-04-04": true,
      },
      streak_count: 12,
      habit_colour: "#b98c9b",
    },
  ]);

  const toggleHabitCompletion = (
    habitId: number,
    dateObj: { dateString: string }
  ): void => {
    const dateKey = dateObj.dateString;

    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === habitId) {
          const updatedCompletions = { ...habit.completions };

          if (updatedCompletions[dateKey]) {
            delete updatedCompletions[dateKey];
          } else {
            updatedCompletions[dateKey] = true;
          }

          return {
            ...habit,
            completions: updatedCompletions,
          };
        }
        return habit;
      })
    );
  };

  const gridStyle = {
    "--grid-template-columns": `150px repeat(5, 1fr)`,
    "--habit-name-width": "150px",
  } as React.CSSProperties;

  return (
    <section className="app-info-section">
      <div className="container-fluid">
        <div className="row ">
          <div
            className="col-lg-6 mb-5 mb-lg-0"
            data-aos="fade-right"
            data-aos-duration="1000"
          >
            <h2 className="app-info-heading">Transform Your Daily Routine</h2>
            <p className="app-info-text">
              BetterDays helps you create meaningful change through small,
              consistent actions. Whether you're focusing on health,
              productivity, or personal growth, our easy-to-use tracker makes
              building positive habits simple and sustainable.
            </p>
            <div className="app-stats-container">
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Focus
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={36}
                    height={36}
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="none"
                      stroke="#d7845f"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.057 19.398v-.004m-4.595 6.384c-.78.142-1.598.207-2.42.207c-2.728 0-6.542-2.257-6.542-6.522c0-1.993.947-4.001 2.432-5.363c.345-2.196 2.122-5.3 7.518-5.3c1.167 0 2.269.196 3.257.533c1.061-1.785 3.786-3.33 6.689-3.33c2.887 0 4.88 1.073 5.859 2.379"
                      strokeWidth={2}
                    ></path>
                    <path
                      fill="none"
                      stroke="#d7845f"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M38.532 13.054c-.819-2.271-2.52-4.138-4.812-4.87c-2.656-.85-7.337-.045-9.612 5.933c-1.543 4.054-1.054 8.127 2.159 9.611c1.13.523 3.117.554 5.182.123c.65.735 1.928 1.506 4.226 2.378c2.74 1.039 5.781.53 7.254-4.893c.885-3.257-.54-6.949-4.397-8.282"
                      strokeWidth={2}
                    ></path>
                    <path
                      fill="none"
                      stroke="#d7845f"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M42.413 22.895c1.452 1.817 2.228 4.48 2.066 6.945c-.195 2.875-2.155 5.013-5.388 5.404a9.4 9.4 0 0 1-1.834.044c-2.452-.174-5.713-1.74-7.116-4.318a5.5 5.5 0 0 1-.54-1.37c-.728 1.415-1.781 2.488-3.046 3.192c-1.244.695-2.692 1.032-4.233.988a10.6 10.6 0 0 1-3.204-.61c-3.64-1.269-6.44-4.258-6.656-7.393a5.5 5.5 0 0 1 .374-2.431c.691-1.745 2.273-3.208 4.22-3.948v-.004c1.92-.728 4.193-.757 6.323.333"
                      strokeWidth={2}
                    ></path>
                    <path
                      fill="none"
                      stroke="#d7845f"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M22.322 33.78c.52 1.301 1.35 2.887 2.163 4.233c1.578 2.61 3.233 4.468 4.392 3.87c.524-.268.943-1.325 1.008-2.663a14 14 0 0 0 3.623.492c2.489 0 4.9-2.293 5.583-4.468"
                      strokeWidth={2}
                    ></path>
                  </svg>
                </span>

                <span className="app-stat-text">
                  Track what matters most to you
                </span>
              </div>
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Growth
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={32}
                    height={32}
                    viewBox="0 0 14 14"
                  >
                    <g
                      fill="none"
                      stroke="#d7845f"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                    >
                      <path d="m9.008 6.709l3.43-1.516v7.672h-3.43zM4.72 4.814l2.144 3.032l2.144-1.137v6.154H4.72z"></path>
                      <path d="m1.29 6.33l3.43-1.516v8.05H1.29zm12-5.193L7.851 4.613l-2.5-2.923L.878 3.988"></path>
                      <path d="m10.586.678l2.703.45l-.45 2.704"></path>
                    </g>
                  </svg>
                </span>
                <span className="app-stat-text">
                  Build consistent daily routines
                </span>
              </div>
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Insight{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={30}
                    height={30}
                    viewBox="0 0 2048 2048"
                  >
                    <path
                      fill="#d7845f"
                      d="M960 384q119 0 224 45t183 124t123 183t46 224q0 63-8 118t-25 105t-44 99t-64 100q-29 40-51 72t-36 64t-21 70t-7 89v179q0 40-15 75t-41 61t-61 41t-75 15H832q-40 0-75-15t-61-41t-41-61t-15-75v-180q0-51-7-88t-21-69t-36-65t-51-72q-37-51-63-99t-44-99t-26-106t-8-118q0-119 45-224t124-183t183-123t224-46m192 1472v-64H768v64q0 26 19 45t45 19h256q26 0 45-19t19-45m256-896q0-93-35-174t-96-143t-142-96t-175-35q-93 0-174 35t-143 96t-96 142t-35 175q0 89 18 153t47 114t61 94t61 92t48 108t21 143h384q1-83 20-142t48-108t61-92t61-94t47-115t19-153M960 256q-26 0-45-19t-19-45V64q0-26 19-45t45-19t45 19t19 45v128q0 26-19 45t-45 19M192 928H64q-26 0-45-19T0 864t19-45t45-19h128q26 0 45 19t19 45t-19 45t-45 19m53 261q26 0 45 19t19 46q0 20-11 35t-30 24q-11 5-30 13t-41 17t-40 15t-32 7q-26 0-45-19t-19-46q0-20 11-35t30-24q11-4 30-13t41-17t40-15t32-7m152-645q0 26-19 45t-45 19q-18 0-33-9l-109-67q-14-9-22-23t-9-32q0-26 19-45t45-19q16 0 33 10l110 66q14 8 22 23t8 32m83-368q0-26 19-45t45-19q17 0 32 9t24 24l62 112q8 14 8 30q0 27-19 46t-45 19q-17 0-32-9t-24-24l-62-112q-8-14-8-31m1376 624q26 0 45 19t19 45t-19 45t-45 19h-128q-26 0-45-19t-19-45t19-45t45-19zm2 501q0 26-19 45t-45 19q-11 0-30-6t-41-16t-40-17t-31-14q-18-8-29-24t-12-36q0-27 19-45t46-19q12 0 31 7t40 16t40 18t31 13q18 8 29 23t11 36m-271-693q-26 0-45-19t-19-45q0-17 8-32t22-23l110-66q17-10 33-10q26 0 45 19t19 45q0 17-8 31t-23 24l-109 67q-15 9-33 9m-337-321q0-16 8-30l62-112q8-15 23-24t33-9q26 0 45 19t19 45q0 17-8 31l-62 112q-8 15-23 24t-33 9q-26 0-45-19t-19-46"
                    ></path>
                  </svg>
                </span>
                <span className="app-stat-text">Reflect on your journey</span>
              </div>
            </div>
          </div>
          <div
            className="col-lg-6"
            data-aos="fade-left"
            data-aos-duration="1000"
            data-aos-delay="200"
          >
            <div className="app-image-placeholder">
              <div className="interactive-demo-container">
                <div className="habit-tracker">
                  <div
                    className="habit-grid"
                    style={gridStyle}
                  >
                    {/*  Days of Week */}
                    <div className="grid-cell empty-cell non-interactive"></div>
                    {daysOfWeek.map((day, index) => (
                      <div
                        key={day}
                        className={`grid-cell header-cell non-interactive ${
                          index === 1 ? "current-day" : ""
                        }`}
                      >
                        {day}
                      </div>
                    ))}

                    {/* Date Numbers Row */}
                    <div className="grid-cell empty-cell non-interactive"></div>
                    {dates.map((date, index) => {
                      const isDifferentMonth = date.month !== today.getMonth();
                      return (
                        <div
                          key={`date-${index}`}
                          className={`grid-cell date-cell non-interactive ${
                            index === 1 ? "current-day" : ""
                          }`}
                        >
                          {isDifferentMonth && (
                            <span className="month-abbrev">
                              {new Date(
                                date.year,
                                date.month,
                                1
                              ).toLocaleString("default", { month: "short" })}
                            </span>
                          )}
                          {date.day}
                        </div>
                      );
                    })}

                    {/* Habit Rows */}
                    {habits.map((habit) => (
                      <React.Fragment key={habit.id}>
                        <div
                          className="grid-cell habit-name non-interactive"
                          style={{
                            width: "150px",
                            minWidth: "150px",
                            textAlign: "left",
                            paddingLeft: "4px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            borderRight: "1px solid #e6e6e6",
                          }}
                        >
                          {habit.name}
                        </div>
                        {dates.map((date, index) => {
                          const isCompleted =
                            habit.completions[date.dateString];
                          return (
                            <div
                              key={`${habit.id}-${index}`}
                              className={`grid-cell habit-cell ${
                                isCompleted ? "completed" : "not-completed"
                              } ${index === 1 ? "current-day" : ""}`}
                              style={{
                                backgroundColor: isCompleted
                                  ? habit.habit_colour
                                  : "",
                              }}
                              onClick={() =>
                                toggleHabitCompletion(habit.id, date)
                              }
                            >
                              {isCompleted && (
                                <div className="check-icon">
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M5 13l4 4L19 7"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="demo-overlay">
                  <div className="demo-cta">
                    <span className="demo-pulse"></span>
                    <p>Try it out! Click to track a habit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HabitTrackerDemo;
