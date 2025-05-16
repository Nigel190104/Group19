/**
 * FeatureCards Component
 *
 * Displays a responsive row of three feature cards highlighting the main
 * functionality of the BetterDays app:
 * 1. Habit Tracking - For building and monitoring personal routines
 * 2. Journal Experience - For capturing personal reflections and mood tracking
 * 3. Community Building - For connecting with others for motivation and support
 *
 * Each card includes an icon, title, subtitle, feature list, and a call-to-action
 * link to the corresponding section of the application.
 */

import { Link } from "react-router-dom";

const FeatureCards = () => {
  return (
    <div className="row row-cols-1 row-cols-lg-3 g-4">
      {/* Habits Card */}
      <div
        className="col"
        data-aos="fade-up"
        data-aos-delay="0"
      >
        <div className="card feature-card h-100 shadow-sm border-0">
          <div className="card-feature-icon d-flex justify-content-center align-items-center">
            <i className="bi bi-calendar-check feature-icon"></i>
          </div>
          <div className="card-body">
            <h3 className="card-title fw-semibold">Track Habits</h3>
            <p className="card-subtitle mb-3 text-muted">
              Build lasting routines that stick
            </p>
            <ul className="feature-list">
              <li>Set custom goals with flexible schedules</li>
              <li>View progress with interactive charts</li>
              <li>Create habit streaks and earn badges</li>
              <li>Receive smart reminders based on your patterns</li>
              <li>Analyze your productivity trends over time</li>
            </ul>
          </div>
          <div className="card-footer bg-transparent border-top-0">
            <Link
              to="/habits"
              className="btn btn-feature"
              data-aos="fade"
              data-aos-delay="300"
            >
              <span>Explore Habits</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Journal Card */}
      <div
        className="col"
        data-aos="fade-up"
        data-aos-delay="150"
      >
        <div className="card feature-card h-100 shadow-sm border-0">
          <div className="card-feature-icon d-flex justify-content-center align-items-center">
            <i className="bi bi-journal-richtext feature-icon"></i>
          </div>
          <div className="card-body">
            <h3 className="card-title fw-semibold">Journal Experiences</h3>
            <p className="card-subtitle mb-3 text-muted">
              Capture your growth journey
            </p>
            <ul className="feature-list">
              <li>Daily guided reflection prompts</li>
              <li>Track mood patterns with visual insights</li>
              <li>Include photos and voice notes in entries</li>
              <li>Get monthly reflection summaries</li>
              <li>Set journal goals and track completion</li>
            </ul>
          </div>
          <div className="card-footer bg-transparent border-top-0">
            <Link
              to="/journal"
              className="btn btn-feature"
              data-aos="fade"
              data-aos-delay="350"
            >
              <span>Start Journaling</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Community Card */}
      <div
        className="col"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <div className="card feature-card h-100 shadow-sm border-0">
          <div className="card-feature-icon d-flex justify-content-center align-items-center">
            <i className="bi bi-people-fill feature-icon"></i>
          </div>
          <div className="card-body">
            <h3 className="card-title fw-semibold">Build Community</h3>
            <p className="card-subtitle mb-3 text-muted">
              Connect with others on similar journeys
            </p>
            <ul className="feature-list">
              <li>Join interest-based challenge groups</li>
              <li>Share achievements and receive support</li>
              <li>Find accountability partners</li>
              <li>Participate in weekly wellness challenges</li>
              <li>Access expert-led workshops and resources</li>
            </ul>
          </div>
          <div className="card-footer bg-transparent border-top-0">
            <Link
              to="/community"
              className="btn btn-feature"
              data-aos="fade"
              data-aos-delay="400"
            >
              <span>Join Community</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCards;
