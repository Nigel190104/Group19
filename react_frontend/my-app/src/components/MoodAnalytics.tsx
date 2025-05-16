/**
 * MoodAnalytics Component
 *
 * A data visualisation component that displays mood trends from journal entries
 * using an interactive line chart.
 *
 * Features:
 * - Time-series chart of mood data using Recharts library
 * - Colour-coded data points based on mood categories
 * - Custom tooltips showing detailed mood information
 * - Trend analysis with percentage calculation
 * - Date range display for the analysed period
 * - Empty state handling for users without mood data
 * - Responsive design that adapts to container width
 *
 * This component helps users visualise their emotional patterns over time,
 * supporting self-awareness and emotional management goals of the application.
 */

import React, { useEffect, useState } from "react";
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
interface MoodCategory {
  id: number;
  name: string;
}

interface MoodSubcategory {
  id: number;
  name: string;
  category: MoodCategory;
  description: string;
  mbti_insight: string;
}

interface Note {
  id: string;
  note_caption: string;
  note_content: string;
  note_date_created: string | null;
  mood_subcategory: number | null;
}

interface MoodChartData {
  date: string;
  mood: number;
  moodName: string;
  category: string;
  fill: string;
}

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

const MoodAnalytics: React.FC<{
  notes?: Note[];
  moodSubcategories?: MoodSubcategory[];
  dashboard?: boolean;
}> = ({ notes = [], moodSubcategories = [] }) => {
  const [chartData, setChartData] = useState<MoodChartData[]>([]);
  const [trendPercentage, setTrendPercentage] = useState<number>(0);
  const [isPositiveTrend, setIsPositiveTrend] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<string>("");

  // mood values for charting (higher number = more positive mood)
  const moodCategoryValues: Record<string, number> = {
    Happy: 5,
    Calm: 4,
    "Energy Levels": 3,
    Sad: 2,
    Fearful: 1.5,
    Angry: 1,
  };

  // each dot will be different colour depending on modd category
  const moodCategoryColors: Record<string, string> = {
    Happy: "hsl(35, 43%, 53%)",
    Calm: "hsl(31, 41%, 48%)",
    "Energy Levels": "hsl(28, 40%, 40%)",
    Sad: "hsl(26, 36%, 34%)",
    Fearful: "hsl(25, 34%, 28%)",
    Angry: "hsl(0, 84%, 37%)",
  };

  useEffect(() => {
    if (notes.length > 0 && moodSubcategories.length > 0) {
      prepareChartData();
    }
  }, [notes, moodSubcategories]);

  const prepareChartData = () => {
    // newest first
    const sortedNotes = [...notes].sort((a, b) => {
      if (!a.note_date_created || !b.note_date_created) return 0;
      return (
        new Date(b.note_date_created).getTime() -
        new Date(a.note_date_created).getTime()
      );
    });

    // last 10 entries (or < if less than 10 overall)
    const recentNotes = sortedNotes.slice(0, 10).reverse();

    // chart data
    const moodData: MoodChartData[] = recentNotes.map((note) => {
      // mood subcategory for this note
      const subcategory = note.mood_subcategory
        ? moodSubcategories.find((mood) => mood.id === note.mood_subcategory)
        : null;

      const categoryName = subcategory?.category?.name || "Unknown";
      const moodName = subcategory?.name || "Unknown";

      // Format the date
      const date = note.note_date_created
        ? new Date(note.note_date_created).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Unknown";

      return {
        date,
        mood: moodCategoryValues[categoryName] || 3,
        moodName,
        category: categoryName,
        fill: moodCategoryColors[categoryName] || "#7a4a2b",
      };
    });

    setChartData(moodData);

    // Set date range for display
    if (moodData.length >= 2) {
      setDateRange(
        `${moodData[0].date} - ${moodData[moodData.length - 1].date}`
      );

      // Calculate trend percentage
      const firstValue = moodData[0].mood;
      const lastValue = moodData[moodData.length - 1].mood;

      const change = ((lastValue - firstValue) / firstValue) * 100;
      setTrendPercentage(Math.abs(Math.round(change * 10) / 10));
      setIsPositiveTrend(change >= 0);
    }
  };

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
        <p className="card-subtitle text-muted mb-2">
          {chartData.length > 0 ? dateRange : "No mood data available"}
        </p>
      </div>

      <div className="card-body p-0">
        {chartData.length > 0 ? (
          <>
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

            <div className="d-flex align-items-center gap-2 mt-3"></div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="mb-0">
              Start journaling with mood tracking to see your emotional patterns
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodAnalytics;
