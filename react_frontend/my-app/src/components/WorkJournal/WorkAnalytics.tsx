/**
 * WorkAnalytics Component
 *
 * A comprehensive analytics dashboard for work productivity metrics,
 * visualising task completion rates, time distribution, and performance trends.
 *
 * Features:
 * - Summary statistics cards for key performance indicators
 * - Time distribution pie chart showing category breakdown
 * - Daily task progress stacked bar chart
 * - Productivity insights with progress indicators
 * - High priority task completion metrics
 * - Time efficiency calculations
 *
 * The component processes work notes and tasks to generate meaningful
 * visualisations using the Recharts library, providing insights into
 * productivity patterns and work habits for the selected month.
 */

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Task } from "../../types";

interface WorkNote {
  id: string;
  title: string;
  content: string;
  date_created: string;
  tasks: Task[];
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface ProductivityData {
  name: string;
  completed: number;
  pending: number;
}

interface WorkAnalyticsProps {
  notes: WorkNote[];
  selectedMonth: number;
  selectedYear: number;
}

const WorkAnalytics: React.FC<WorkAnalyticsProps> = ({
  notes,
  selectedMonth,
  selectedYear,
}) => {
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [productivityByDay, setProductivityByDay] = useState<
    ProductivityData[]
  >([]);
  const [mostProductiveCategory, setMostProductiveCategory] =
    useState<string>("None");
  const [highPriorityCompletion, setHighPriorityCompletion] = useState(0);

  // Colors for categories
  const categoryColors: Record<string, string> = {
    Planning: "#8884d8",
    Development: "#82ca9d",
    Documentation: "#ffc658",
    Communication: "#ff8042",
    Research: "#a4de6c",
    Meeting: "#d0ed57",
    Design: "#83a6ed",
  };

  // Generate a color for any category
  const getCategoryColor = (category: string): string => {
    if (categoryColors[category]) {
      return categoryColors[category];
    }

    // Generate a color based on the string hash
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }

    return color;
  };

  useEffect(() => {
    if (notes.length > 0) {
      analyseData();
    }
  }, [notes, selectedMonth, selectedYear]);

  const analyseData = () => {
    // Filter notes for the selected month/year
    const filteredNotes = notes.filter((note) => {
      const noteDate = new Date(note.date_created);
      return (
        noteDate.getMonth() === selectedMonth &&
        noteDate.getFullYear() === selectedYear
      );
    });

    // Get all tasks from filtered notes
    const allTasks = filteredNotes.flatMap((note) => note.tasks);

    // Calculate total time spent
    const totalTime = allTasks.reduce(
      (total, task) => total + (task.time_spent || 0),
      0
    );
    setTotalTimeSpent(totalTime);

    // Calculate completion statistics
    const completed = allTasks.filter((task) => task.completed).length;
    const pending = allTasks.filter((task) => !task.completed).length;
    setCompletedTasks(completed);
    setPendingTasks(pending);

    // Calculate high priority task completion rate
    const highPriorityTasks = allTasks.filter(
      (task) => task.priority === "High"
    );
    const completedHighPriority = highPriorityTasks.filter(
      (task) => task.completed
    ).length;
    setHighPriorityCompletion(
      highPriorityTasks.length > 0
        ? Math.round((completedHighPriority / highPriorityTasks.length) * 100)
        : 0
    );

    // Category breakdown
    const categories: Record<string, number> = {};
    allTasks.forEach((task) => {
      const category = task.category || "Uncategorised";
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += task.time_spent || 0;
    });

    // Convert to chart data format
    const categoryChartData = Object.keys(categories).map((category) => ({
      name: category,
      value: categories[category],
      color: getCategoryColor(category),
    }));

    setCategoryData(categoryChartData);

    // Find most productive category (most completed tasks)
    const completedByCategory: Record<string, number> = {};
    allTasks
      .filter((task) => task.completed)
      .forEach((task) => {
        const category = task.category || "Uncategorised";
        if (!completedByCategory[category]) {
          completedByCategory[category] = 0;
        }
        completedByCategory[category]++;
      });

    let maxCompleted = 0;
    let maxCategory = "None";

    Object.entries(completedByCategory).forEach(([category, count]) => {
      if (count > maxCompleted) {
        maxCompleted = count;
        maxCategory = category;
      }
    });

    setMostProductiveCategory(maxCategory);

    // Daily productivity breakdown
    const dailyData: Record<string, { completed: number; pending: number }> =
      {};

    allTasks.forEach((task) => {
      // Use task date if available, otherwise use note date
      const taskDate = new Date(
        task.date_created ||
          filteredNotes.find((note) => note.tasks.some((t) => t.id === task.id))
            ?.date_created ||
          ""
      );

      const dateStr = taskDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { completed: 0, pending: 0 };
      }

      if (task.completed) {
        dailyData[dateStr].completed++;
      } else {
        dailyData[dateStr].pending++;
      }
    });

    // Convert to chart data and sort by date
    const dailyChartData = Object.keys(dailyData).map((date) => ({
      name: date,
      completed: dailyData[date].completed,
      pending: dailyData[date].pending,
    }));

    // Sort by date
    dailyChartData.sort((a, b) => {
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      return dateA.getTime() - dateB.getTime();
    });

    setProductivityByDay(dailyChartData);
  };

  // Format time display
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Custom tooltip formatter for the pie chart
  const renderCustomTooltip = (props: any) => {
    if (props.active && props.payload) {
      const data = props.payload[0].payload;
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <p
            className="label"
            style={{ margin: 0 }}
          >
            <strong>{data.name}</strong>
          </p>
          <p
            className="value"
            style={{ margin: 0 }}
          >
            Time: {formatTime(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="work-analytics">
      {/* Summary Stats Section */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="stat-card p-3 h-100">
            <h5 className="stat-title text-muted">Total Time Spent</h5>
            <div className="stat-value h3 mb-0">
              {formatTime(totalTimeSpent)}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card p-3 h-100">
            <h5 className="stat-title text-muted">Tasks Completed</h5>
            <div className="stat-value h3 mb-0">
              {completedTasks} / {completedTasks + pendingTasks}
              <small className="text-muted ms-2 fs-6">
                (
                {completedTasks + pendingTasks > 0
                  ? Math.round(
                      (completedTasks / (completedTasks + pendingTasks)) * 100
                    )
                  : 0}
                %)
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card p-3 h-100">
            <h5 className="stat-title text-muted">High Priority Completion</h5>
            <div className="stat-value h3 mb-0">{highPriorityCompletion}%</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card p-3 h-100">
            <h5 className="stat-title text-muted">Most Productive In</h5>
            <div className="stat-value h3 mb-0">{mostProductiveCategory}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row">
        {/* Time Distribution by Category */}
        <div className="col-md-6 mb-4">
          <div className="chart-card p-3 h-100">
            <h5 className="mb-3">Time Distribution by Category</h5>
            {categoryData.length > 0 ? (
              <div style={{ height: 300 }}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={renderCustomTooltip} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                No category data available for this period
              </div>
            )}
          </div>
        </div>

        {/* Daily Task Completion */}
        <div className="col-md-6 mb-4">
          <div className="chart-card p-3 h-100">
            <h5 className="mb-3">Daily Task Progress</h5>
            {productivityByDay.length > 0 ? (
              <div style={{ height: 300 }}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={productivityByDay}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="completed"
                      stackId="a"
                      fill="#82ca9d"
                      name="Completed"
                    />
                    <Bar
                      dataKey="pending"
                      stackId="a"
                      fill="#ffc658"
                      name="Pending"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                No daily data available for this period
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="insights-card p-3">
            <h5 className="mb-3">Productivity Insights</h5>
            {completedTasks + pendingTasks > 0 ? (
              <div className="row">
                <div className="col-md-4">
                  <div className="insight-item mb-3">
                    <h6>Task Completion Rate</h6>
                    <p className="mb-1">
                      You've completed {completedTasks} out of{" "}
                      {completedTasks + pendingTasks} tasks (
                      {Math.round(
                        (completedTasks / (completedTasks + pendingTasks)) * 100
                      )}
                      %)
                    </p>
                    <div className="progress">
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{
                          width: `${Math.round(
                            (completedTasks / (completedTasks + pendingTasks)) *
                              100
                          )}%`,
                        }}
                        aria-valuenow={Math.round(
                          (completedTasks / (completedTasks + pendingTasks)) *
                            100
                        )}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="insight-item mb-3">
                    <h6>High Priority Focus</h6>
                    <p className="mb-1">
                      {highPriorityCompletion >= 70
                        ? "Great job focusing on high priority tasks!"
                        : highPriorityCompletion >= 40
                        ? "Moderate focus on high priority tasks"
                        : "Consider focusing more on high priority tasks"}
                    </p>
                    <div className="progress">
                      <div
                        className={`progress-bar ${
                          highPriorityCompletion >= 70
                            ? "bg-success"
                            : highPriorityCompletion >= 40
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                        role="progressbar"
                        style={{ width: `${highPriorityCompletion}%` }}
                        aria-valuenow={highPriorityCompletion}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="insight-item mb-3">
                    <h6>Time Efficiency</h6>
                    <p className="mb-1">
                      {completedTasks > 0
                        ? `Average of ${formatTime(
                            Math.round(totalTimeSpent / completedTasks)
                          )} per completed task`
                        : "No completed tasks to measure time efficiency"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-3 text-muted">
                Complete some tasks to see productivity insights
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkAnalytics;
