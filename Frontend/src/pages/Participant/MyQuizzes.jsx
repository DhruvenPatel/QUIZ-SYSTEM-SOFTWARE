import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ListChecks,
  Search,
  Trophy,
  CheckCircle2,
  XCircle,
  BarChart3,
  Eye,
  Medal,
} from "lucide-react";
import api from "../../api/axios";

const theme = {
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  primary: "#2563eb",
  primarySoft: "rgba(37, 99, 235, 0.08)",
  success: "#16a34a",
  successSoft: "rgba(22, 163, 74, 0.10)",
  danger: "#dc2626",
  dangerSoft: "rgba(220, 38, 38, 0.10)",
  warning: "#d97706",
  warningSoft: "rgba(217, 119, 6, 0.10)",
  shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
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

const StatCard = ({ icon, title, value, subline, tone = "primary" }) => {
  const tones = {
    primary: { bg: theme.primarySoft, color: theme.primary },
    success: { bg: theme.successSoft, color: theme.success },
    danger: { bg: theme.dangerSoft, color: theme.danger },
    warning: { bg: theme.warningSoft, color: theme.warning },
  };

  return (
    <div style={styles.statCard}>
      <div
        style={{
          ...styles.statIcon,
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

const MyQuizzes = () => {
  const [search, setSearch] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyQuizzes = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/results/my-quizzes");
      setQuizzes(data?.quizzes || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load your quizzes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuizzes();
  }, []);

  const filteredQuizzes = useMemo(() => {
    const q = search.toLowerCase();

    return quizzes.filter((item) => {
      return (
        item.title?.toLowerCase().includes(q) ||
        item.quizCode?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q)
      );
    });
  }, [quizzes, search]);

  const stats = useMemo(() => {
    return {
      totalQuizzes: quizzes.length,
      totalScore: quizzes.reduce((sum, item) => sum + (item.totalScore || 0), 0),
      totalCorrect: quizzes.reduce(
        (sum, item) => sum + (item.correctAnswers || 0),
        0
      ),
      totalWrong: quizzes.reduce((sum, item) => sum + (item.wrongAnswers || 0), 0),
    };
  }, [quizzes]);

  if (loading) {
    return <div style={styles.center}>Loading your quizzes...</div>;
  }

  if (error) {
    return <div style={styles.centerError}>{error}</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <p style={styles.kicker}>Participant / My Activity</p>
          <h1 style={styles.title}>My Quizzes</h1>
          <p style={styles.subline}>
            Review all quizzes you have participated in, check your results, and
            open the leaderboard for each one.
          </p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          icon={<ListChecks size={18} />}
          title="Attempted Quizzes"
          value={stats.totalQuizzes}
          subline="Total quizzes you joined"
          tone="primary"
        />
        <StatCard
          icon={<Trophy size={18} />}
          title="Total Score"
          value={stats.totalScore}
          subline="Combined score across quizzes"
          tone="warning"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          title="Correct Answers"
          value={stats.totalCorrect}
          subline="Total correct answers"
          tone="success"
        />
        <StatCard
          icon={<XCircle size={18} />}
          title="Wrong Answers"
          value={stats.totalWrong}
          subline="Total wrong answers"
          tone="danger"
        />
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Quiz History</h2>
            <p style={styles.cardSubline}>
              Search and explore the quizzes you were part of.
            </p>
          </div>
        </div>

        <div style={styles.searchWrap}>
          <Search size={18} color={theme.muted} />
          <input
            type="text"
            placeholder="Search by quiz title, code, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {filteredQuizzes.length === 0 ? (
          <div style={styles.emptyState}>No quiz history found.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Quiz</th>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Attempts</th>
                  <th style={styles.th}>Correct</th>
                  <th style={styles.th}>Wrong</th>
                  <th style={styles.th}>Attempted At</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((item) => (
                  <tr key={item.resultId}>
                    <td style={styles.td}>
                      <div style={styles.quizCell}>
                        <div style={styles.quizIcon}>
                          <ListChecks size={16} />
                        </div>
                        <div>
                          <p style={styles.quizTitle}>{item.title || "-"}</p>
                          <p style={styles.quizMeta}>{item.status || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{item.quizCode || "-"}</td>
                    <td style={styles.td}>{item.totalScore || 0}</td>
                    <td style={styles.td}>{item.totalAttempts || 0}</td>
                    <td style={styles.td}>{item.correctAnswers || 0}</td>
                    <td style={styles.td}>{item.wrongAnswers || 0}</td>
                    <td style={styles.td}>{formatDate(item.attemptedAt)}</td>
                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        <Link
                          to={`/result/${item.quizId}`}
                          style={styles.secondaryButton}
                        >
                          <Eye size={14} />
                          <span>Result</span>
                        </Link>

                        <Link
                          to={`/leaderboard/${item.quizId}`}
                          style={styles.primaryButton}
                        >
                          <Medal size={14} />
                          <span>Leaderboard</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { display: "grid", gap: "20px" },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  kicker: { margin: 0, color: theme.primary, fontSize: "13px", fontWeight: 700 },
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
    maxWidth: "780px",
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
    boxShadow: theme.shadow,
  },
  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  statTitle: { margin: 0, fontSize: "13px", color: theme.muted, fontWeight: 600 },
  statValue: { margin: "6px 0 6px", fontSize: "26px", color: theme.text, fontWeight: 800 },
  statSubline: { margin: 0, fontSize: "12px", color: theme.muted, lineHeight: 1.5 },
  card: {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "20px",
    padding: "20px",
    boxShadow: theme.shadow,
    display: "grid",
    gap: "18px",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: "12px" },
  cardTitle: { margin: 0, fontSize: "20px", color: theme.text, fontWeight: 800 },
  cardSubline: { margin: "6px 0 0", fontSize: "14px", color: theme.muted, lineHeight: 1.6 },
  searchWrap: {
    height: "46px",
    borderRadius: "12px",
    border: `1px solid ${theme.border}`,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 14px",
    maxWidth: "420px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: "14px",
    color: theme.text,
  },
  tableWrapper: {
    overflowX: "auto",
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
  },
  table: {
    width: "100%",
    minWidth: "980px",
    borderCollapse: "collapse",
    background: "#fff",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    borderBottom: `1px solid ${theme.border}`,
    background: "#fafafa",
    color: theme.muted,
    fontSize: "12px",
    fontWeight: 700,
  },
  td: {
    padding: "14px 16px",
    borderBottom: `1px solid ${theme.border}`,
    color: theme.text,
    fontSize: "14px",
    verticalAlign: "middle",
  },
  quizCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  quizIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: theme.primarySoft,
    color: theme.primary,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  quizTitle: { margin: 0, fontSize: "14px", fontWeight: 700, color: theme.text },
  quizMeta: { margin: "4px 0 0", fontSize: "12px", color: theme.muted },
  actionRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  primaryButton: {
    textDecoration: "none",
    background: theme.primary,
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  secondaryButton: {
    textDecoration: "none",
    background: "#444",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  emptyState: {
    padding: "24px",
    textAlign: "center",
    color: theme.muted,
    border: `1px dashed ${theme.border}`,
    borderRadius: "16px",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
  },
  centerError: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
    color: "red",
  },
};

export default MyQuizzes;