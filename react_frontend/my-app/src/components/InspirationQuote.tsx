/**
 * InspirationQuote Component
 *
 * Displays a randomly fetched inspirational quote from an external API.
 * Provides visual refreshment and motivation for users throughout the BetterDays app.
 *
 * Features:
 * - Asynchronous fetching of quotes using React Query
 * - Loading state with spinner during API requests
 * - Error handling with retry functionality
 * - Quote display with author attribution
 * - Manual refresh button for new quotes
 * - Styled presentation with decorative quotation marks
 *
 * This component serves as a source of daily inspiration and positive
 * reinforcement, enhancing the overall wellness focus of the application.
 */

import React from "react";
import { useQuery } from "@tanstack/react-query";
import "./css/InspirationQuote.css";

interface Quote {
  quote: string;
  author: string;
}

const fetchQuote = async (): Promise<Quote> => {
  const response = await fetch(
    "https://randominspirationalquotes.onrender.com"
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch quote: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data || !data.quote || !data.author) {
    throw new Error("Invalid API response");
  }

  return data;
};

const InspirationQuote: React.FC = () => {
  const {
    data: quote,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["inspirationalQuote"],
    queryFn: fetchQuote,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  return (
    <div className="quote-container">
      <div className="quote-card">
        {isLoading ? (
          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : isError ? (
          <div className="error-container">
            <p className="error-message">Failed to load quote</p>
            <button
              className="retry-button"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="quote-content">
            <i className="bi bi-quote quote-icon"></i>
            <p className="quote-text">{quote?.quote}</p>
            <p className="quote-author">— {quote?.author}</p>
            {/* <button
              className="refresh-quote-button"
              onClick={() => refetch()}
              aria-label="Get new quote"
            >
              <i className="bi bi-arrow-repeat"></i>
            </button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default InspirationQuote;
