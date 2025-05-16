/**
 * JournalDemo Component
 *
 * A marketing showcase of the journal functionality in the BetterDays app.
 * Displays a sample journal entry alongside descriptive text highlighting
 * key features of the journaling experience.
 *
 * The component presents a realistic journal entry with date, title, content,
 * and mood indicator next to promotional copy emphasising privacy, emotional
 * tracking, and organisational benefits of the journaling feature.
 */

import "../css/JournalDemo.css";

const JournalDemo: React.FC = () => {
  return (
    <section className="journal-info-section">
      <div className="container-fluid">
        <div className="row align-items-center">
          <div
            className="col-lg-6"
            data-aos="fade-left"
            data-aos-duration="1000"
            data-aos-delay="200"
          >
            {/* <div className="journal-preview-container"> */}
            <div className="note-card position-relative">
              <div className="note-header d-flex align-items-center mb-3">
                <div className="date-info-calendar me-3">
                  <span className="month">Tue</span>
                  <span className="day">6</span>
                </div>
                <h3 className="title mb-0">Productive morning walk</h3>
              </div>
              <p className="note-content">
                Headed out for an early walk this morning before starting work.
                The crisp air and quiet neighborhood created the perfect
                environment to clear my head. With the project deadline
                approaching, I needed this mental space. As I walked, my
                thoughts about the project naturally organised themselves. By
                the time I reached the park, I had a clear plan for tackling the
                remaining tasks. Watching the ducks on the pond reminded me that
                even complex problems can be approached calmly. Returned home
                feeling energized and focused, ready to face the day's
                challenges with renewed clarity.
              </p>
              <div className="mood-display mt-3">
                <div className="mood-badge-demo">
                  <span className="mood-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                    </svg>
                  </span>
                  <span className="mood-text">
                    I felt <strong className="mood-name">Motivated</strong>
                    <span className="mood-category">(Energy Levels)</span>
                  </span>
                </div>
              </div>
            </div>
            {/* </div> */}
          </div>
          <div
            className="col-lg-6 mb-5 mb-lg-0"
            data-aos="fade-right"
            data-aos-duration="1000"
          >
            <h2 className="app-info-heading">Journal Your Thoughts</h2>
            <p className="app-info-text">
              Document your thoughts, feelings, and experiences in a secure,
              encrypted journal. Our intuitive interface lets you express
              yourself freely while tracking your emotional wellbeing.
            </p>
            <div className="app-stats-container">
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Private
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
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <span className="app-stat-text">
                  End-to-end encryption keeps your thoughts secure
                </span>
              </div>
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Emotional Compass
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M9 13h6"></path>
                    <path d="M9 17h6"></path>
                    <path d="M9 9h1"></path>
                  </svg>
                </span>
                <span className="app-stat-text">
                  Track emotional patterns with mood analytics
                </span>
              </div>
              <div className="app-stat">
                <span className="app-stat-highlight d-flex">
                  Organised
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
                  Easily find past entries with search and filters
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JournalDemo;
