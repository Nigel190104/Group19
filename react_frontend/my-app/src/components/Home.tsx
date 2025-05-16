/**
 * Home Component
 *
 * The landing page of the BetterDays application, showcasing key features
 * and encouraging new user sign-ups.
 *
 * Features:
 * - Hero section with prominent call-to-action buttons
 * - Feature demonstrations including habit tracking, journaling, and analytics
 * - Daily inspiration quote section
 * - Step-by-step explanation of the app workflow
 * - Visual demonstrations of the application's core functionality
 * - Responsive design for various screen sizes
 * - Animation effects for enhanced user experience
 *
 * This component serves as the main entry point for new users,
 * highlighting the app's value proposition and guiding visitors
 * toward registration or further exploration.
 */

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../App";
import { default as HabitTrackerDemo } from "./Demos/HabitTrackerDemo";
import InspirationQuote from "./InspirationQuote";
import JournalDemo from "./Demos/JournalDemo";
import LogoutButton from "./LogoutButton";
import "./css/Home.css";
import JournalAnalyticsDemo from "./Demos/JournalAnalyticsDemo";
import MoodHistoryDemo from "./Demos/JournalHistoryDemo";
import ChartSection from "./Demos/ChartsSection";

const Home: React.FC = () => {
  return (
    <div className="home-page d-flex flex-column min-vh-100">
      <main className="flex-grow-1">
        {/*  Hero Section */}
        <section className="hero-section">
          <div className="container px-4 px-md-5">
            <div
              className="d-flex flex-column align-items-center text-center"
              data-aos="fade-up"
            >
              <div className="mb-4 heading">
                <h1 className="display-4 fw-bold">BetterDays</h1>
                <p className="tag mx-auto mb-4">
                  Encrypted journaling, habit tracking, and community in one.
                  Your private path to wellbeing
                </p>
                <p className="tag"></p>
              </div>
              <div
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <Link
                  to="/signup"
                  className="btn btn-primary me-3 px-4 py-2"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="btn btn-outline-primary px-4 py-2"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
          <div className="demo-placeholder">
            <img
              src="/Demo-Functions.png"
              alt="Pages Image"
              className="functions-demo"
              data-aos="fade-up"
              data-aos-delay="200"
            />
          </div>
        </section>

        {/* FEATURES DEMO SECTIONS */}
        <div className="text-center mb-5">
          <h2
            className="section-heading display-5 fw-bold"
            data-aos="fade-up"
          >
            Our Features
          </h2>
        </div>

        <HabitTrackerDemo />
        <JournalDemo />
        {/* <JournalAnalyticsDemo />
        <MoodHistoryDemo /> */}
        <ChartSection />

        {/*  Features Section */}
        {/* <section className="features-section">
          <div className="container-fluid">
            <FeatureCards />
            <AppWalkthrough />
          </div>
        </section> */}

        {/* Quote Section */}
        <section className="quote-section">
          <div className="container">
            <div className="text-center mb-3">
              <h2
                className="section-title"
                data-aos="fade-up"
              >
                Get Daily Inspiration
              </h2>
            </div>
            <div
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              <InspirationQuote />
            </div>
          </div>
        </section>

        <section className="how-it-works-section">
          <div className=" px-4 px-md-5">
            <div className="text-center mb-5">
              <h2
                className="section-heading display-5 fw-bold"
                data-aos="fade-up"
              >
                How It Works
              </h2>
            </div>

            <div className="row">
              <div
                className="col-md-4 how-it-works-step"
                data-aos="fade-up"
                data-aos-delay="0"
              >
                <div className="step-number">1</div>
                <h3 className="step-title">Set Your Goals</h3>
                <p className="step-description">
                  Define what matters to you. Create personalised goals and
                  break them down into achievable daily habits.
                </p>
              </div>

              <div
                className="col-md-4 how-it-works-step"
                data-aos="fade-up"
                data-aos-delay="150"
              >
                <div className="step-number">2</div>
                <h3 className="step-title">Track Daily Progress</h3>
                <p className="step-description">
                  Check in daily to mark your completed habits, journal your
                  thoughts, and celebrate your wins.
                </p>
              </div>

              <div
                className="col-md-4 how-it-works-step"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div className="step-number">3</div>
                <h3 className="step-title">Grow Together</h3>
                <p className="step-description">
                  Connect with our supportive community, share experiences, and
                  find friends.
                </p>
              </div>
            </div>

            <div
              className="text-center mt-5"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <Link
                to="/signup"
                className="btn btn-primary px-4 py-2"
              >
                Start Your Journey
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
