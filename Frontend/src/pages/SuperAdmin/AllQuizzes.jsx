import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Search,
  CalendarDays,
  Eye,
  FileCode2,
  UserCircle2,
  Activity,
  FolderKanban,
  Rocket,
  CheckCircle2,
} from "lucide-react";
import api from "../../api/axios";

const theme = {
  bg: "#f4f7fb",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  primary: "#2563eb",
  primarySoft: "rgba(37, 99, 235, 0.08)",
  success: "#16a34a",
  successSoft: "rgba(22, 163, 74, 0.10)",
  warning: "#d97706",
  warningSoft: "rgba(217, 119, 6, 0.10)",
  purple: "#7c3aed",
  purpleSoft: "rgba(124, 58, 237, 0.10)",
  danger: "#dc2626",
  shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const StatCard = ({ icon, title, value, subline, tone = "primary" }) => {
  const tones = {
    primary: {
      color: theme.primary,
      bg: theme.primarySoft,
    },
    success: {
      color: theme.success,
      bg: theme.successSoft,
    },
    warning: {
      color: theme.warning,
      bg: theme.warningSoft,
    },
    purple: {
      color: theme.purple,
      bg: theme.purpleSoft,
    },
  };

  return (
    <div style={styles.statCard}>
      <div
        style={{
          ...styles.statIconWrap,
          background: tones[tone].bg,
          color: tones[tone].color,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={styles.statTitle}>{title}</p>
        <h3 style={styles.statValue}>{value}</h3>
        <p style={styles.statSubline}>{subline}</p>
      </div>
    </div>
  );
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStatus = (status) => {
  return (status || "draft").toLowerCase();
};

const getStatusStyles = (status) => {
  const value = normalizeStatus(status);

  if (value === "live") {
    return {
      label: "Live",
      color: theme.success,
      background: theme.successSoft,
    };
  }

  if (value === "published") {
    return {
      label: "Published",
      color: theme.primary,
      background: theme.primarySoft,
    };
  }

  if (value === "completed") {
    return {
      label: "Completed",
      color: theme.purple,
      background: theme.purpleSoft,
    };
  }

  if (value === "upcoming") {
    return {
      label: "Upcoming",
      color: theme.warning,
      background: theme.warningSoft,
    };
  }

  return {
    label: "Draft",
    color: theme.warning,
    background: "rgba(148, 163, 184, 0.14)",
  };
};

const AllQuizzes = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/quizzes");
      setQuizzes(data?.quizzes || []);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      setError(err?.response?.data?.message || "Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const dashboardData = useMemo(() => {
    const total = quizzes.length;

    const draft = quizzes.filter(
      (quiz) => normalizeStatus(quiz.status) === "draft"
    ).length;

    const published = quizzes.filter(
      (quiz) => normalizeStatus(quiz.status) === "published"
    ).length;

    const live = quizzes.filter(
      (quiz) => normalizeStatus(quiz.status) === "live"
    ).length;

    const completed = quizzes.filter(
      (quiz) => normalizeStatus(quiz.status) === "completed"
    ).length;

    const upcoming = quizzes.filter((quiz) => {
      if (normalizeStatus(quiz.status) === "upcoming") return true;
      if (!quiz.startTime) return false;

      const start = new Date(quiz.startTime).getTime();
      return !Number.isNaN(start) && start > Date.now();
    }).length;

    return {
      total,
      draft,
      published,
      live,
      completed,
      upcoming,
    };
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    const query = search.toLowerCase();

    return quizzes.filter((quiz) => {
      const matchesSearch =
        quiz.title?.toLowerCase().includes(query) ||
        quiz.description?.toLowerCase().includes(query) ||
        quiz.quizCode?.toLowerCase().includes(query) ||
        quiz.createdBy?.name?.toLowerCase().includes(query) ||
        quiz.createdBy?.email?.toLowerCase().includes(query);

      const currentStatus = normalizeStatus(quiz.status);
      const matchesStatus =
        statusFilter === "all" ? true : currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quizzes, search, statusFilter]);

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <p style={styles.kicker}>Super Admin / Quiz Management</p>
          <h1 style={styles.title}>All Quizzes</h1>
          <p style={styles.subline}>
            View all quizzes across the platform, review ownership, track
            statuses, and inspect schedule details from one place.
          </p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          icon={<ClipboardList size={20} />}
          title="Total Quizzes"
          value={dashboardData.total}
          subline="All quiz records on platform"
          tone="primary"
        />
        <StatCard
          icon={<FolderKanban size={20} />}
          title="Draft Quizzes"
          value={dashboardData.draft}
          subline="Still in progress"
          tone="warning"
        />
        <StatCard
          icon={<Activity size={20} />}
          title="Live Quizzes"
          value={dashboardData.live}
          subline="Currently active"
          tone="success"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          title="Completed Quizzes"
          value={dashboardData.completed}
          subline="Finished quiz sessions"
          tone="purple"
        />
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Platform Quiz Records</h2>
            <p style={styles.cardSubline}>
              Search by quiz title, code, description, or quiz master details.
            </p>
          </div>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchWrap}>
            <Search size={18} color={theme.muted} />
            <input
              type="text"
              placeholder="Search by title, quiz code, description, creator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterWrap}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={styles.stateBox}>Loading quizzes...</div>
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Quiz</th>
                  <th style={styles.th}>Quiz Code</th>
                  <th style={styles.th}>Created By</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Schedule</th>
                  <th style={styles.th}>Created At</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredQuizzes.length > 0 ? (
                  filteredQuizzes.map((quiz) => {
                    const status = getStatusStyles(quiz.status);

                    return (
                      <tr key={quiz._id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.quizCell}>
                            <div style={styles.quizIcon}>
                              <ClipboardList size={18} />
                            </div>

                            <div>
                              <p style={styles.quizTitle}>
                                {quiz.title || "Untitled Quiz"}
                              </p>
                              <p style={styles.quizMeta}>
                                {quiz.description || "No description added"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.inlinePill}>
                            <FileCode2 size={14} />
                            <span>{quiz.quizCode || "-"}</span>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.creatorBlock}>
                            <div style={styles.inlineRow}>
                              <UserCircle2 size={14} />
                              <span>{quiz.createdBy?.name || "-"}</span>
                            </div>
                            <p style={styles.creatorEmail}>
                              {quiz.createdBy?.email || "-"}
                            </p>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusPill,
                              color: status.color,
                              background: status.background,
                            }}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.scheduleBlock}>
                            <div style={styles.inlineRow}>
                              <Rocket size={14} />
                              <span>
                                Start: {quiz.startTime ? formatDateTime(quiz.startTime) : "-"}
                              </span>
                            </div>
                            <div style={styles.inlineRow}>
                              <CalendarDays size={14} />
                              <span>
                                End: {quiz.endTime ? formatDateTime(quiz.endTime) : "-"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td style={styles.td}>{formatDate(quiz.createdAt)}</td>

                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <Link to={`/quizzes/${quiz._id}`} style={styles.iconButton}>
                            <Eye size={16} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={styles.emptyState}>
                      No quizzes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "grid",
    gap: "20px",
  },

  hero: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },

  kicker: {
    margin: 0,
    color: theme.primary,
    fontSize: "13px",
    fontWeight: 700,
  },

  title: {
    margin: "6px 0 10px",
    fontSize: "32px",
    lineHeight: 1.1,
    color: theme.text,
    fontWeight: 800,
  },

  subline: {
    margin: 0,
    color: theme.muted,
    fontSize: "15px",
    lineHeight: 1.7,
    maxWidth: "820px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  statCard: {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "18px",
    padding: "18px",
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    boxShadow: theme.shadow,
  },

  statIconWrap: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  statTitle: {
    margin: 0,
    fontSize: "13px",
    color: theme.muted,
    fontWeight: 600,
  },

  statValue: {
    margin: "6px 0 6px",
    fontSize: "28px",
    lineHeight: 1,
    color: theme.text,
    fontWeight: 800,
  },

  statSubline: {
    margin: 0,
    fontSize: "12px",
    color: theme.muted,
    lineHeight: 1.5,
  },

  card: {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "20px",
    padding: "20px",
    boxShadow: theme.shadow,
    display: "grid",
    gap: "18px",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    color: theme.text,
    fontWeight: 800,
  },

  cardSubline: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: theme.muted,
    lineHeight: 1.6,
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },

  searchWrap: {
    flex: 1,
    minWidth: "280px",
    height: "46px",
    borderRadius: "12px",
    border: `1px solid ${theme.border}`,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 14px",
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    color: theme.text,
    background: "transparent",
  },

  filterWrap: {
    minWidth: "180px",
    height: "46px",
    borderRadius: "12px",
    border: `1px solid ${theme.border}`,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
  },

  select: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: "14px",
    color: theme.text,
    cursor: "pointer",
  },

  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: "1180px",
  },

  th: {
    textAlign: "left",
    fontSize: "12px",
    color: theme.muted,
    fontWeight: 700,
    padding: "14px 16px",
    borderBottom: `1px solid ${theme.border}`,
    whiteSpace: "nowrap",
  },

  tr: {
    background: "#fff",
  },

  td: {
    padding: "16px",
    borderBottom: `1px solid ${theme.border}`,
    fontSize: "14px",
    color: theme.text,
    verticalAlign: "middle",
  },

  quizCell: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    minWidth: 0,
  },

  quizIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: theme.primarySoft,
    color: theme.primary,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  quizTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: theme.text,
  },

  quizMeta: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: theme.muted,
    lineHeight: 1.5,
    maxWidth: "320px",
  },

  inlinePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "32px",
    padding: "0 10px",
    borderRadius: "999px",
    background: theme.primarySoft,
    color: theme.primary,
    fontSize: "12px",
    fontWeight: 700,
  },

  creatorBlock: {
    display: "grid",
    gap: "6px",
  },

  creatorEmail: {
    margin: 0,
    color: theme.muted,
    fontSize: "12px",
  },

  inlineRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: theme.muted,
    fontSize: "13px",
  },

  statusPill: {
    width: "fit-content",
    minHeight: "30px",
    padding: "0 10px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 700,
  },

  scheduleBlock: {
    display: "grid",
    gap: "8px",
  },

  iconButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: `1px solid ${theme.border}`,
    background: "#fff",
    color: theme.text,
    display: "inline-grid",
    placeItems: "center",
    cursor: "pointer",
    textDecoration: "none",
  },

  emptyState: {
    padding: "28px 16px",
    textAlign: "center",
    color: theme.muted,
    fontSize: "14px",
  },

  stateBox: {
    padding: "40px 20px",
    border: `1px dashed ${theme.border}`,
    borderRadius: "16px",
    textAlign: "center",
    color: theme.muted,
    fontSize: "14px",
    background: "#fff",
  },

  errorBox: {
    padding: "16px",
    borderRadius: "14px",
    background: "rgba(220, 38, 38, 0.08)",
    color: theme.danger,
    fontSize: "14px",
    fontWeight: 600,
  },
};

export default AllQuizzes;