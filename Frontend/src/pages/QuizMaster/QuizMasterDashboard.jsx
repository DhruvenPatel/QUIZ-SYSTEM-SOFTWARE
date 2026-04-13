import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  ListChecks,
  CircleHelp,
  ArrowRight,
  ClipboardList,
  Activity,
  FolderKanban,
  CalendarClock,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const theme = {
  primary: "#2563eb",
  primarySoft: "rgba(37, 99, 235, 0.08)",
  primaryBorder: "rgba(37, 99, 235, 0.14)",
  success: "#15803d",
  warning: "#b45309",
  danger: "#dc2626",
  surface: "#ffffff",
  surfaceSoft: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  shadowSm: "0 4px 14px rgba(15, 23, 42, 0.05)",
};

const PIE_COLORS = ["#2563eb", "#15803d", "#b45309", "#64748b"];

const getStatusStyles = (status) => {
  const normalized = (status || "").toLowerCase();

  if (normalized === "live") {
    return {
      label: "Live",
      color: theme.success,
      background: "rgba(21, 128, 61, 0.08)",
      border: "1px solid rgba(21, 128, 61, 0.14)",
    };
  }

  if (normalized === "published") {
    return {
      label: "Published",
      color: theme.primary,
      background: theme.primarySoft,
      border: `1px solid ${theme.primaryBorder}`,
    };
  }

  if (normalized === "completed") {
    return {
      label: "Completed",
      color: "#64748b",
      background: "rgba(100, 116, 139, 0.08)",
      border: "1px solid rgba(100, 116, 139, 0.14)",
    };
  }

  return {
    label: "Draft",
    color: theme.warning,
    background: "rgba(180, 83, 9, 0.08)",
    border: "1px solid rgba(180, 83, 9, 0.14)",
  };
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const getMonthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}`;
};

const getMonthLabel = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: "short" });
};

const EmptyState = ({ title = "No data available", text = "There is no data to display right now." }) => (
  <div style={styles.emptyState}>
    <p style={styles.emptyTitle}>{title}</p>
    <p style={styles.emptyText}>{text}</p>
  </div>
);

const QuizMasterDashboard = () => {
  const { userInfo } = useAuth();
  const user = userInfo?.user || {};

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/quizzes");
        setQuizzes(data.quizzes || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const dashboardData = useMemo(() => {
    const total = quizzes.length;
    const draft = quizzes.filter(
      (q) => (q.status || "").toLowerCase() === "draft"
    ).length;
    const published = quizzes.filter(
      (q) => (q.status || "").toLowerCase() === "published"
    ).length;
    const live = quizzes.filter(
      (q) => (q.status || "").toLowerCase() === "live"
    ).length;
    const completed = quizzes.filter(
      (q) => (q.status || "").toLowerCase() === "completed"
    ).length;

    const upcoming = quizzes.filter((q) => {
      if (!q.startTime) return false;
      const start = new Date(q.startTime);

      return (
        !Number.isNaN(start.getTime()) &&
        start > new Date() &&
        (q.status || "").toLowerCase() !== "completed"
      );
    }).length;

    const recentQuizzes = [...quizzes]
      .sort((a, b) => {
        const aTime = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const bTime = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 5);

    const lastSixMonthsMap = new Map();
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      lastSixMonthsMap.set(getMonthKey(d), {
        name: getMonthLabel(d),
        quizzes: 0,
      });
    }

    quizzes.forEach((quiz) => {
      const createdAt = quiz.createdAt || quiz.updatedAt;
      if (!createdAt) return;
      const key = getMonthKey(createdAt);
      if (lastSixMonthsMap.has(key)) {
        lastSixMonthsMap.get(key).quizzes += 1;
      }
    });

    const lineData = Array.from(lastSixMonthsMap.values());
    const hasLineData = lineData.some((item) => item.quizzes > 0);

    const pieData = [
      { name: "Draft", value: draft },
      { name: "Published", value: published },
      { name: "Live", value: live },
      { name: "Completed", value: completed },
    ].filter((item) => item.value > 0);

    return {
      total,
      draft,
      published,
      live,
      completed,
      upcoming,
      recentQuizzes,
      lineData,
      pieData,
      hasLineData,
    };
  }, [quizzes]);

  const metricCards = [
    {
      key: "total",
      title: "Total Quizzes",
      value: dashboardData.total,
      note: "All records",
      icon: <ClipboardList size={16} />,
      show: dashboardData.total > 0,
    },
    {
      key: "live",
      title: "Live",
      value: dashboardData.live,
      note: "Currently active",
      icon: <Activity size={16} />,
      show: dashboardData.live > 0,
    },
    {
      key: "draft",
      title: "Drafts",
      value: dashboardData.draft,
      note: "Still in progress",
      icon: <FolderKanban size={16} />,
      show: dashboardData.draft > 0,
    },
    {
      key: "upcoming",
      title: "Upcoming",
      value: dashboardData.upcoming,
      note: "Scheduled ahead",
      icon: <CalendarClock size={16} />,
      show: dashboardData.upcoming > 0,
    },
  ].filter((item) => item.show);

  const quickActions = [
    {
      title: "Create Quiz",
      description: "Set up a new quiz with title, code, and schedule.",
      to: "/create-quiz",
      icon: <PlusCircle size={16} />,
      primary: true,
    },
    {
      title: "Manage Quizzes",
      description: "Review existing quizzes and continue editing.",
      to: "/quizzes",
      icon: <ListChecks size={16} />,
    },
    {
      title: "Add Question",
      description: "Create new questions with marks and answer logic.",
      to: "/add-question",
      icon: <CircleHelp size={16} />,
    },
  ];

  return (
    <>
      <header style={styles.header}>
        <div>
          <p style={styles.headerEyebrow}>Dashboard</p>
          <h2 style={styles.headerTitle}>
            Welcome back, {user?.name || "Quiz Master"}
          </h2>
          <p style={styles.headerText}>
            Review quiz activity, current workflow status, and recent updates from one dashboard.
          </p>
        </div>

        <div style={styles.headerActions}>
          <Link to="/quizzes" style={styles.secondaryButton}>
            <ListChecks size={16} />
            <span>View Quizzes</span>
          </Link>
          
          <Link to="/create-quiz" style={styles.primaryButton}>
            <PlusCircle size={16} />
            <span>Create Quiz</span>
          </Link>
        </div>
      </header>

      {loading && (
        <div style={styles.stateCard}>
          <p style={styles.stateTitle}>Loading dashboard...</p>
          <p style={styles.stateText}>Fetching workspace data.</p>
        </div>
      )}

      {!loading && error && (
        <div style={styles.stateCard}>
          <p style={{ ...styles.stateTitle, color: theme.danger }}>
            Something went wrong
          </p>
          <p style={styles.stateText}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {metricCards.length > 0 ? (
            <section
              style={{
                ...styles.metricsGrid,
                gridTemplateColumns: `repeat(${Math.min(metricCards.length, 4)}, minmax(0, 1fr))`,
              }}
            >
              {metricCards.map((item) => (
                <div key={item.key} style={styles.metricCard}>
                  <div style={styles.metricIcon}>{item.icon}</div>
                  <div>
                    <p style={styles.metricLabel}>{item.title}</p>
                    <h3 style={styles.metricValue}>{item.value}</h3>
                    <p style={styles.metricNote}>{item.note}</p>
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <section style={styles.singleSection}>
              <EmptyState
                title="No quiz metrics yet"
                text="Create your first quiz to start seeing dashboard metrics."
              />
            </section>
          )}

          <section style={styles.chartGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>Quiz activity</h3>
                  <p style={styles.panelText}>Created quizzes over the last 6 months.</p>
                </div>
              </div>

              {dashboardData.hasLineData ? (
                <div style={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dashboardData.lineData}>
                      <CartesianGrid stroke={theme.border} vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: theme.muted }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: theme.muted }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="quizzes"
                        stroke={theme.primary}
                        strokeWidth={2}
                        dot={{ r: 2.5 }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title="No activity data available"
                  text="Quiz creation activity will appear here once records exist."
                />
              )}
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>Status distribution</h3>
                  <p style={styles.panelText}>Current quiz breakdown by status.</p>
                </div>
              </div>

              {dashboardData.pieData.length > 0 ? (
                <div style={styles.pieLayout}>
                  <div style={styles.pieWrap}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={dashboardData.pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={42}
                          outerRadius={68}
                          paddingAngle={3}
                        >
                          {dashboardData.pieData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={styles.legendList}>
                    {dashboardData.pieData.map((item, index) => (
                      <div key={item.name} style={styles.legendItem}>
                        <div style={styles.legendLeft}>
                          <span
                            style={{
                              ...styles.legendDot,
                              background: PIE_COLORS[index % PIE_COLORS.length],
                            }}
                          />
                          <span style={styles.legendName}>{item.name}</span>
                        </div>
                        <span style={styles.legendValue}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No status data available"
                  text="Quiz status distribution will appear here once quizzes are created."
                />
              )}
            </div>
          </section>

          <section style={styles.contentGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>Recent quizzes</h3>
                  <p style={styles.panelText}>Recently created or updated quiz records.</p>
                </div>
              </div>

              {dashboardData.recentQuizzes.length > 0 ? (
                <div style={styles.recentList}>
                  {dashboardData.recentQuizzes.map((quiz) => {
                    const status = getStatusStyles(quiz.status);

                    return (
                      <div key={quiz._id} style={styles.recentItem}>
                        <div style={styles.recentTop}>
                          <p style={styles.recentTitle}>
                            {quiz.title || "Untitled Quiz"}
                          </p>
                          <span
                            style={{
                              ...styles.statusBadge,
                              color: status.color,
                              background: status.background,
                              border: status.border,
                            }}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div style={styles.recentMeta}>
                          <span>{quiz.quizCode || "-"}</span>
                          <span>{formatDate(quiz.createdAt || quiz.updatedAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No recent quizzes"
                  text="Recent quiz activity will show here once records are available."
                />
              )}
            </div>

            <div style={styles.sideColumn}>
              <div style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div>
                    <h3 style={styles.panelTitle}>Quick actions</h3>
                    <p style={styles.panelText}>Common workspace actions.</p>
                  </div>
                </div>

                <div style={styles.quickGrid}>
                  {quickActions.map((item) => (
                    <Link
                      key={item.title}
                      to={item.to}
                      style={{
                        ...styles.quickCard,
                        ...(item.primary ? styles.quickCardPrimary : {}),
                      }}
                    >
                      <div
                        style={{
                          ...styles.quickIcon,
                          ...(item.primary ? styles.quickIconPrimary : {}),
                        }}
                      >
                        {item.icon}
                      </div>

                      <div>
                        <h4 style={styles.quickTitle}>{item.title}</h4>
                        <p style={styles.quickDescription}>{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div>
                    <h3 style={styles.panelTitle}>Account summary</h3>
                    <p style={styles.panelText}>Current identity and access details.</p>
                  </div>
                </div>

                <div style={styles.summaryList}>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryKey}>Full Name</span>
                    <span style={styles.summaryValue}>{user?.name || "-"}</span>
                  </div>

                  <div style={styles.summaryRow}>
                    <span style={styles.summaryKey}>Email</span>
                    <span style={styles.summaryValue}>{user?.email || "-"}</span>
                  </div>

                  <div style={styles.summaryRow}>
                    <span style={styles.summaryKey}>Role</span>
                    <span style={styles.summaryValue}>
                      {user?.role?.replace("_", " ") || "-"}
                    </span>
                  </div>

                  <div style={styles.summaryRow}>
                    <span style={styles.summaryKey}>Workspace</span>
                    <span style={styles.summaryValue}>Quiz Management</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

const styles = {
  header: {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 18,
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    boxShadow: theme.shadowSm,
    flexWrap: "wrap",
  },

  headerEyebrow: {
    margin: 0,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: theme.primary,
    fontWeight: 700,
  },

  headerTitle: {
    margin: "6px 0 0",
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    color: theme.text,
    fontWeight: 700,
  },

  headerText: {
    margin: "8px 0 0",
    fontSize: 13,
    lineHeight: 1.65,
    color: theme.muted,
    maxWidth: 680,
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  primaryButton: {
    minHeight: 36,
    padding: "0 12px",
    borderRadius: 10,
    background: theme.primary,
    color: "#fff",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: theme.shadowSm,
  },

  secondaryButton: {
    minHeight: 36,
    padding: "0 12px",
    borderRadius: 10,
    background: theme.surface,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },

  textButton: {
    minHeight: 36,
    padding: "0 6px",
    color: theme.primary,
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },

  stateCard: {
    marginTop: 16,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    padding: 18,
  },

  stateTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: theme.text,
  },

  stateText: {
    margin: "6px 0 0",
    fontSize: 13,
    color: theme.muted,
    lineHeight: 1.6,
  },

  singleSection: {
    marginTop: 16,
  },

  metricsGrid: {
    marginTop: 16,
    display: "grid",
    gap: 14,
  },

  metricCard: {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 14,
    padding: 16,
    boxShadow: theme.shadowSm,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: theme.primarySoft,
    color: theme.primary,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  metricLabel: {
    margin: 0,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: theme.muted,
    fontWeight: 700,
  },

  metricValue: {
    margin: "4px 0 0",
    fontSize: 22,
    lineHeight: 1.1,
    color: theme.text,
    fontWeight: 700,
  },

  metricNote: {
    margin: "4px 0 0",
    fontSize: 12,
    lineHeight: 1.5,
    color: theme.muted,
  },

  chartGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 16,
    alignItems: "start",
  },

  contentGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 16,
    alignItems: "start",
  },

  sideColumn: {
    display: "grid",
    gap: 16,
  },

  panel: {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 18,
    padding: 18,
    boxShadow: theme.shadowSm,
  },

  panelHeader: {
    marginBottom: 14,
  },

  panelTitle: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.2,
    color: theme.text,
    fontWeight: 700,
  },

  panelText: {
    margin: "6px 0 0",
    color: theme.muted,
    fontSize: 12,
    lineHeight: 1.6,
  },

  chartWrap: {
    width: "100%",
    height: 200,
  },

  pieLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 150px",
    gap: 10,
    alignItems: "center",
  },

  pieWrap: {
    width: "100%",
    height: 200,
  },

  legendList: {
    display: "grid",
    gap: 10,
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  legendLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    display: "inline-block",
  },

  legendName: {
    fontSize: 12,
    color: theme.text,
    fontWeight: 600,
  },

  legendValue: {
    fontSize: 12,
    color: theme.muted,
    fontWeight: 700,
  },

  recentList: {
    display: "grid",
    gap: 10,
  },

  recentItem: {
    padding: 12,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    background: theme.surfaceSoft,
  },

  recentTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  recentTitle: {
    margin: 0,
    fontSize: 13,
    color: theme.text,
    fontWeight: 600,
  },

  recentMeta: {
    marginTop: 8,
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    fontSize: 12,
    color: theme.muted,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
    padding: "0 8px",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.02em",
  },

  quickGrid: {
    display: "grid",
    gap: 10,
  },

  quickCard: {
    textDecoration: "none",
    borderRadius: 14,
    padding: 14,
    border: `1px solid ${theme.border}`,
    background: theme.surfaceSoft,
    display: "grid",
    gap: 10,
  },

  quickCardPrimary: {
    background: "#eff6ff",
    border: `1px solid ${theme.primaryBorder}`,
  },

  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    color: theme.primary,
    display: "grid",
    placeItems: "center",
  },

  quickIconPrimary: {
    background: theme.primary,
    border: `1px solid ${theme.primary}`,
    color: "#fff",
  },

  quickTitle: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.25,
    color: theme.text,
    fontWeight: 600,
  },

  quickDescription: {
    margin: "4px 0 0",
    fontSize: 12,
    lineHeight: 1.6,
    color: theme.muted,
  },

  summaryList: {
    display: "grid",
    gap: 10,
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    padding: "10px 0",
    borderBottom: `1px solid ${theme.border}`,
  },

  summaryKey: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: 600,
  },

  summaryValue: {
    color: theme.text,
    fontSize: 12,
    fontWeight: 700,
    textAlign: "right",
    wordBreak: "break-word",
  },

  emptyState: {
    minHeight: 180,
    border: `1px dashed ${theme.border}`,
    borderRadius: 14,
    background: theme.surfaceSoft,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: 20,
  },

  emptyTitle: {
    margin: 0,
    fontSize: 14,
    color: theme.text,
    fontWeight: 700,
  },

  emptyText: {
    margin: "6px 0 0",
    fontSize: 12,
    color: theme.muted,
    lineHeight: 1.6,
    maxWidth: 300,
  },
};

export default QuizMasterDashboard;