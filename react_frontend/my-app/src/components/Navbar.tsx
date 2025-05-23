/**
 * Navbar Component
 *
 * Responsive navigation header for the BetterDays app that displays:
 * - App logo and brand name
 * - Main navigation links with icons (Dashboard, Habits, Feed, Journal)
 * - Authentication controls (Login/Signup or Logout button)
 *
 * Features responsive mobile toggle and adapts based on user authentication state
 * using AuthContext.
 */

import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import Logo from "./img/Logo_no_bg.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Navbar.css";
import { AuthContext } from "../App";
import LogoutButton from "./LogoutButton";

function Navbar() {
  const { isAuthenticated, username } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="container-fluid">
      <header className="w-100 d-flex align-items-center justify-content-between py-3 mb-4 ">
        {/* Logo & Brand Name*/}
        <div className="d-flex align-items-center">
          <Link
            to="/"
            className="d-inline-flex link-body-emphasis text-decoration-none"
          >
            <img
              src={Logo}
              width="64px"
              alt="Better Days logo"
            />
            <b
              id="brand-name"
              className="mx-2"
            >
              BetterDays
            </b>
          </Link>
        </div>

        {/* Mobile menu toggle button */}
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          onClick={toggleMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links*/}
        <div className={`navbar-collapse ${isMenuOpen ? "show" : ""}`}>
          <ul className="nav justify-content-center flex-grow-1">
            <li>
              <Link
                to="/dashboard"
                className="nav-link px-3 d-flex align-items-center gap-1"
              >
                <button
                  type="button"
                  className="nav-button d-flex align-items-center py-2"
                >
                  <svg
                    className="me-2"
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.2374 2.62499C14.9092 2.29691 14.4642 2.11261 14.0001 2.11261C13.5361 2.11261 13.0911 2.29691 12.7629 2.62499L1.13063 14.2555C1.04927 14.3368 0.984741 14.4334 0.940713 14.5397C0.896685 14.646 0.874023 14.7599 0.874023 14.875C0.874023 14.99 0.896685 15.104 0.940713 15.2103C0.984741 15.3166 1.04927 15.4131 1.13063 15.4945C1.29493 15.6588 1.51777 15.7511 1.75013 15.7511C1.86518 15.7511 1.97911 15.7284 2.0854 15.6844C2.19169 15.6404 2.28827 15.5758 2.36963 15.4945L3.50013 14.3622V23.625C3.50013 24.3212 3.77669 24.9889 4.26897 25.4811C4.76126 25.9734 5.42894 26.25 6.12513 26.25H21.8751C22.5713 26.25 23.239 25.9734 23.7313 25.4811C24.2236 24.9889 24.5001 24.3212 24.5001 23.625V14.3622L25.6306 15.4945C25.7949 15.6588 26.0178 15.7511 26.2501 15.7511C26.4825 15.7511 26.7053 15.6588 26.8696 15.4945C27.0339 15.3302 27.1262 15.1073 27.1262 14.875C27.1262 14.6426 27.0339 14.4198 26.8696 14.2555L22.7501 10.1377V4.37499C22.7501 4.14292 22.6579 3.92036 22.4938 3.75627C22.3298 3.59217 22.1072 3.49999 21.8751 3.49999H20.1251C19.8931 3.49999 19.6705 3.59217 19.5064 3.75627C19.3423 3.92036 19.2501 4.14292 19.2501 4.37499V6.63774L15.2374 2.62499ZM22.7501 12.6122V23.625C22.7501 23.857 22.6579 24.0796 22.4938 24.2437C22.3298 24.4078 22.1072 24.5 21.8751 24.5H6.12513C5.89306 24.5 5.6705 24.4078 5.50641 24.2437C5.34232 24.0796 5.25013 23.857 5.25013 23.625V12.6122L14.0001 3.86224L22.7501 12.6122Z"
                      fill="#454545"
                    />
                  </svg>
                  Dashboard
                </button>
              </Link>
            </li>
            <li>
              <Link
                to="/habits"
                className="nav-link px-3 d-flex align-items-center gap-1"
              >
                <button
                  type="button"
                  className="nav-button d-flex align-items-center py-2"
                >
                  <svg
                    className="me-2"
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.5 13.125C10.5 12.8929 10.4078 12.6704 10.2437 12.5063C10.0796 12.3422 9.85706 12.25 9.625 12.25H7.875C7.64294 12.25 7.42038 12.3422 7.25628 12.5063C7.09219 12.6704 7 12.8929 7 13.125V14.875C7 15.1071 7.09219 15.3296 7.25628 15.4937C7.42038 15.6578 7.64294 15.75 7.875 15.75H9.625C9.85706 15.75 10.0796 15.6578 10.2437 15.4937C10.4078 15.3296 10.5 15.1071 10.5 14.875V13.125ZM10.5 18.375C10.5 18.1429 10.4078 17.9204 10.2437 17.7563C10.0796 17.5922 9.85706 17.5 9.625 17.5H7.875C7.64294 17.5 7.42038 17.5922 7.25628 17.7563C7.09219 17.9204 7 18.1429 7 18.375V20.125C7 20.3571 7.09219 20.5796 7.25628 20.7437C7.42038 20.9078 7.64294 21 7.875 21H9.625C9.85706 21 10.0796 20.9078 10.2437 20.7437C10.4078 20.5796 10.5 20.3571 10.5 20.125V18.375ZM13.125 12.25H14.875C15.1071 12.25 15.3296 12.3422 15.4937 12.5063C15.6578 12.6704 15.75 12.8929 15.75 13.125V14.875C15.75 15.1071 15.6578 15.3296 15.4937 15.4937C15.3296 15.6578 15.1071 15.75 14.875 15.75H13.125C12.8929 15.75 12.6704 15.6578 12.5063 15.4937C12.3422 15.3296 12.25 15.1071 12.25 14.875V13.125C12.25 12.8929 12.3422 12.6704 12.5063 12.5063C12.6704 12.3422 12.8929 12.25 13.125 12.25ZM14.875 17.5H13.125C12.8929 17.5 12.6704 17.5922 12.5063 17.7563C12.3422 17.9204 12.25 18.1429 12.25 18.375V20.125C12.25 20.3571 12.3422 20.5796 12.5063 20.7437C12.6704 20.9078 12.8929 21 13.125 21H14.875C15.1071 21 15.3296 20.9078 15.4937 20.7437C15.6578 20.5796 15.75 20.3571 15.75 20.125V18.375C15.75 18.1429 15.6578 17.9204 15.4937 17.7563C15.3296 17.5922 15.1071 17.5 14.875 17.5ZM17.5 13.125C17.5 12.8929 17.5922 12.6704 17.7563 12.5063C17.9204 12.3422 18.1429 12.25 18.375 12.25H20.125C20.3571 12.25 20.5796 12.3422 20.7437 12.5063C20.9078 12.6704 21 12.8929 21 13.125V14.875C21 15.1071 20.9078 15.3296 20.7437 15.4937C20.5796 15.6578 20.3571 15.75 20.125 15.75H18.375C18.1429 15.75 17.9204 15.6578 17.7563 15.4937C17.5922 15.3296 17.5 15.1071 17.5 14.875V13.125Z"
                      fill="#454545"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.875 0C8.10706 0 8.32962 0.0921872 8.49372 0.256282C8.65781 0.420376 8.75 0.642936 8.75 0.875V1.75H19.25V0.875C19.25 0.642936 19.3422 0.420376 19.5063 0.256282C19.6704 0.0921872 19.8929 0 20.125 0C20.3571 0 20.5796 0.0921872 20.7437 0.256282C20.9078 0.420376 21 0.642936 21 0.875V1.75C23.905 1.75 26.25 4.095 26.25 7V21C26.25 23.905 23.905 26.25 21 26.25H7C4.095 26.25 1.75 23.905 1.75 21V7C1.75 4.095 4.095 1.75 7 1.75V0.875C7 0.642936 7.09219 0.420376 7.25628 0.256282C7.42038 0.0921872 7.64294 0 7.875 0ZM24.5 7V8.75H3.5V7C3.5 5.075 5.06625 3.5 7 3.5V4.375C7 4.60706 7.09219 4.82962 7.25628 4.99372C7.42038 5.15781 7.64294 5.25 7.875 5.25C8.10706 5.25 8.32962 5.15781 8.49372 4.99372C8.65781 4.82962 8.75 4.60706 8.75 4.375V3.5H19.25V4.375C19.25 4.60706 19.3422 4.82962 19.5063 4.99372C19.6704 5.15781 19.8929 5.25 20.125 5.25C20.3571 5.25 20.5796 5.15781 20.7437 4.99372C20.9078 4.82962 21 4.60706 21 4.375V3.5C22.925 3.5 24.5 5.06625 24.5 7ZM3.5 21V10.5H24.5V21C24.5 22.925 22.9338 24.5 21 24.5H7C5.075 24.5 3.5 22.9338 3.5 21Z"
                      fill="#454545"
                    />
                  </svg>
                  Habits
                </button>
              </Link>
            </li>
            <li>
              <Link
                to="/feed"
                className="nav-link px-3 d-flex align-items-center gap-1"
              >
                <button
                  type="button"
                  className="nav-button d-flex align-items-center py-2"
                >
                  <svg
                    className="me-2"
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M24.5 1.75C24.9641 1.75 25.4092 1.93437 25.7374 2.26256C26.0656 2.59075 26.25 3.03587 26.25 3.5V17.5C26.25 17.9641 26.0656 18.4092 25.7374 18.7374C25.4092 19.0656 24.9641 19.25 24.5 19.25H20.125C19.5816 19.25 19.0457 19.3765 18.5598 19.6195C18.0738 19.8625 17.651 20.2153 17.325 20.65L14 25.0828L10.675 20.65C10.349 20.2153 9.92624 19.8625 9.44025 19.6195C8.95425 19.3765 8.41836 19.25 7.875 19.25H3.5C3.03587 19.25 2.59075 19.0656 2.26256 18.7374C1.93437 18.4092 1.75 17.9641 1.75 17.5V3.5C1.75 3.03587 1.93437 2.59075 2.26256 2.26256C2.59075 1.93437 3.03587 1.75 3.5 1.75H24.5ZM3.5 0C2.57174 0 1.6815 0.368749 1.02513 1.02513C0.368749 1.6815 0 2.57174 0 3.5L0 17.5C0 18.4283 0.368749 19.3185 1.02513 19.9749C1.6815 20.6313 2.57174 21 3.5 21H7.875C8.14668 21 8.41463 21.0633 8.65762 21.1848C8.90062 21.3063 9.11199 21.4827 9.275 21.7L12.6 26.1327C12.763 26.3501 12.9744 26.5265 13.2174 26.648C13.4604 26.7695 13.7283 26.8328 14 26.8328C14.2717 26.8328 14.5396 26.7695 14.7826 26.648C15.0256 26.5265 15.237 26.3501 15.4 26.1327L18.725 21.7C18.888 21.4827 19.0994 21.3063 19.3424 21.1848C19.5854 21.0633 19.8533 21 20.125 21H24.5C25.4283 21 26.3185 20.6313 26.9749 19.9749C27.6313 19.3185 28 18.4283 28 17.5V3.5C28 2.57174 27.6313 1.6815 26.9749 1.02513C26.3185 0.368749 25.4283 0 24.5 0L3.5 0Z"
                      fill="#454545"
                    />
                    <path
                      d="M13.9995 6.98772C16.9115 3.99347 24.1933 9.23297 13.9995 15.9687C3.8058 9.23122 11.0875 3.99347 13.9995 6.98772Z"
                      fill="#454545"
                    />
                  </svg>
                  Feed
                </button>
              </Link>
            </li>
            <li>
              <Link
                to="/journal"
                className="nav-link px-3 d-flex align-items-center gap-1"
              >
                <button
                  type="button"
                  className="nav-button d-flex align-items-center py-2"
                >
                  <svg
                    className="me-2"
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.5 14V1.75H12.25V12.4548L15.3003 10.6225C15.4361 10.5411 15.5916 10.4981 15.75 10.4981C15.9084 10.4981 16.0639 10.5411 16.1998 10.6225L19.25 12.4548V1.75H21V14C21 14.1548 20.959 14.3069 20.8811 14.4406C20.8031 14.5744 20.6911 14.6851 20.5564 14.7614C20.4217 14.8378 20.2692 14.877 20.1144 14.8751C19.9596 14.8732 19.8081 14.8303 19.6753 14.7507L15.75 12.3953L11.8248 14.7525C11.6918 14.8322 11.5401 14.8751 11.3852 14.8769C11.2302 14.8787 11.0776 14.8393 10.9428 14.7628C10.8081 14.6862 10.6961 14.5753 10.6183 14.4413C10.5405 14.3072 10.4997 14.155 10.5 14Z"
                      fill="#454545"
                    />
                    <path
                      d="M5.25 0H22.75C23.6783 0 24.5685 0.368749 25.2249 1.02513C25.8813 1.6815 26.25 2.57174 26.25 3.5V24.5C26.25 25.4283 25.8813 26.3185 25.2249 26.9749C24.5685 27.6313 23.6783 28 22.75 28H5.25C4.32174 28 3.4315 27.6313 2.77513 26.9749C2.11875 26.3185 1.75 25.4283 1.75 24.5V22.75H3.5V24.5C3.5 24.9641 3.68437 25.4092 4.01256 25.7374C4.34075 26.0656 4.78587 26.25 5.25 26.25H22.75C23.2141 26.25 23.6592 26.0656 23.9874 25.7374C24.3156 25.4092 24.5 24.9641 24.5 24.5V3.5C24.5 3.03587 24.3156 2.59075 23.9874 2.26256C23.6592 1.93437 23.2141 1.75 22.75 1.75H5.25C4.78587 1.75 4.34075 1.93437 4.01256 2.26256C3.68437 2.59075 3.5 3.03587 3.5 3.5V5.25H1.75V3.5C1.75 2.57174 2.11875 1.6815 2.77513 1.02513C3.4315 0.368749 4.32174 0 5.25 0Z"
                      fill="#454545"
                    />
                    <path
                      d="M1.75 8.75V7.875C1.75 7.64294 1.84219 7.42038 2.00628 7.25628C2.17038 7.09219 2.39294 7 2.625 7C2.85706 7 3.07962 7.09219 3.24372 7.25628C3.40781 7.42038 3.5 7.64294 3.5 7.875V8.75H4.375C4.60706 8.75 4.82962 8.84219 4.99372 9.00628C5.15781 9.17038 5.25 9.39294 5.25 9.625C5.25 9.85706 5.15781 10.0796 4.99372 10.2437C4.82962 10.4078 4.60706 10.5 4.375 10.5H0.875C0.642936 10.5 0.420376 10.4078 0.256282 10.2437C0.0921872 10.0796 0 9.85706 0 9.625C0 9.39294 0.0921872 9.17038 0.256282 9.00628C0.420376 8.84219 0.642936 8.75 0.875 8.75H1.75ZM1.75 14V13.125C1.75 12.8929 1.84219 12.6704 2.00628 12.5063C2.17038 12.3422 2.39294 12.25 2.625 12.25C2.85706 12.25 3.07962 12.3422 3.24372 12.5063C3.40781 12.6704 3.5 12.8929 3.5 13.125V14H4.375C4.60706 14 4.82962 14.0922 4.99372 14.2563C5.15781 14.4204 5.25 14.6429 5.25 14.875C5.25 15.1071 5.15781 15.3296 4.99372 15.4937C4.82962 15.6578 4.60706 15.75 4.375 15.75H0.875C0.642936 15.75 0.420376 15.6578 0.256282 15.4937C0.0921872 15.3296 0 15.1071 0 14.875C0 14.6429 0.0921872 14.4204 0.256282 14.2563C0.420376 14.0922 0.642936 14 0.875 14H1.75ZM1.75 19.25V18.375C1.75 18.1429 1.84219 17.9204 2.00628 17.7563C2.17038 17.5922 2.39294 17.5 2.625 17.5C2.85706 17.5 3.07962 17.5922 3.24372 17.7563C3.40781 17.9204 3.5 18.1429 3.5 18.375V19.25H4.375C4.60706 19.25 4.82962 19.3422 4.99372 19.5063C5.15781 19.6704 5.25 19.8929 5.25 20.125C5.25 20.3571 5.15781 20.5796 4.99372 20.7437C4.82962 20.9078 4.60706 21 4.375 21H0.875C0.642936 21 0.420376 20.9078 0.256282 20.7437C0.0921872 20.5796 0 20.3571 0 20.125C0 19.8929 0.0921872 19.6704 0.256282 19.5063C0.420376 19.3422 0.642936 19.25 0.875 19.25H1.75Z"
                      fill="#454545"
                    />
                  </svg>
                  Journal
                </button>
              </Link>
            </li>
          </ul>
        </div>
        {/* Login/Signup*/}
        <div className="d-flex auth-buttons">
          {isAuthenticated ? (
            <>
              <span className="me-3 fw-bold text-dark"></span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-button nav-link me-3"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="nav-button nav-link"
              >
                Sign-up
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default Navbar;
