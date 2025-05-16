/**
 * MoodAnalyticsDemo Component
 *
 * A visual demonstration of the mood tracking analytics functionality in the BetterDays app.
 * Displays a responsive line chart showing mood data over time using recharts library.
 *
 * Features:
 * - Interactive chart with custom tooltips displaying mood details
 * - Color-coded data points representing different mood categories
 * - Trend calculation showing percentage change in mood over the period
 * - Visual indicators for positive/negative trends
 *
 * Uses hardcoded sample data to simulate the mood tracking experience without
 * requiring actual user data.
 */

"use client";

import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

// Interface for mood data
interface MoodChartData {
  date: string;
  mood: number;
  moodName: string;
  category: string;
  fill: string;
}

// Hardcoded chart data
const chartData: MoodChartData[] = [
  {
    date: "Jan 5",
    mood: 3.5,
    moodName: "Content",
    category: "Calm",
    fill: "hsl(31, 41%, 48%)",
  },
  {
    date: "Jan 12",
    mood: 2.0,
    moodName: "Melancholy",
    category: "Sad",
    fill: "hsl(26, 36%, 34%)",
  },
  {
    date: "Jan 19",
    mood: 1.8,
    moodName: "Anxious",
    category: "Fearful",
    fill: "hsl(25, 34%, 28%)",
  },
  {
    date: "Jan 26",
    mood: 3.0,
    moodName: "Focused",
    category: "Energy Levels",
    fill: "hsl(28, 40%, 40%)",
  },
  {
    date: "Feb 2",
    mood: 4.2,
    moodName: "Peaceful",
    category: "Calm",
    fill: "hsl(31, 41%, 48%)",
  },
  {
    date: "Feb 9",
    mood: 5.0,
    moodName: "Joyful",
    category: "Happy",
    fill: "hsl(35, 43%, 53%)",
  },
  {
    date: "Feb 16",
    mood: 4.8,
    moodName: "Cheerful",
    category: "Happy",
    fill: "hsl(35, 43%, 53%)",
  },
];

// Custom tooltip component
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as MoodChartData;
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#f8f5f2",
          padding: "10px",
          border: "1px solid #e4ddd3",
          borderRadius: "4px",
        }}
      >
        <p
          className="label"
          style={{ margin: "0", fontWeight: "bold", color: "#7a4a2b" }}
        >
          {data.moodName}
        </p>
        <p
          className="category"
          style={{ margin: "0", color: "#666" }}
        >
          {data.category}
        </p>
        <p
          className="date"
          style={{ margin: "0", fontSize: "0.85rem", color: "#888" }}
        >
          {data.date}
        </p>
      </div>
    );
  }
  return null;
};

const MoodAnalyticsDemo = () => {
  const firstValue = chartData[0].mood;
  const lastValue = chartData[chartData.length - 1].mood;
  const change = ((lastValue - firstValue) / firstValue) * 100;
  const trendPercentage = Math.abs(Math.round(change * 10) / 10);
  const isPositiveTrend = change >= 0;
  const dateRange = `${chartData[0].date} - ${
    chartData[chartData.length - 1].date
  }`;

  return (
    <div className="journal-card shadow-sm p-4 mt-4">
      <div className="card-header border-0 bg-transparent mb-3">
        <div className="d-flex align-items-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7a4a2b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="me-2"
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
          <h2 className="card-title h4 mb-0">Mood Analytics</h2>
        </div>
        <p className="card-subtitle text-muted mb-2">{dateRange}</p>
      </div>

      <div className="card-body p-0">
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 15, left: 15, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e4ddd3"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#7a4a2b" }}
                tickLine={false}
                axisLine={{ stroke: "#e4ddd3" }}
              />
              <YAxis
                domain={[0, 6]}
                tick={false}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#7a4a2b"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={payload.fill}
                      stroke="none"
                    />
                  );
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="d-flex align-items-center gap-2 mt-3">
          <div className="d-flex align-items-center gap-2 font-medium">
            <span>
              {isPositiveTrend ? "Trending positive" : "Trending negative"} by{" "}
              {trendPercentage}%
            </span>
            {isPositiveTrend ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-success"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-danger"
              >
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </svg>
            )}
          </div>
        </div>
        <div className="text-muted mt-1">
          {isPositiveTrend
            ? "Your mood has been improving over this period"
            : "Your mood has been declining over this period"}
        </div>
      </div>
    </div>
  );
};

export default MoodAnalyticsDemo;
