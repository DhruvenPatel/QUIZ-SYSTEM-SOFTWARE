import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Trophy, Medal, BarChart3 } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const theme = {
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  primary: "#2563eb",
  primarySoft: "rgba(37, 99, 235, 0.08)",
  warning: "#d97706",
  warningSoft: "rgba(217, 119, 6, 0.1)",
  shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const Leaderboard = () => {
  const { quizId } = useParams();

  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get(`/results/leaderboard/${quizId}`);
        setLeaderboardData(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to fetch leaderboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [quizId]);

  if (loading) {
    return <div style={styles.center}>Loading leaderboard...</div>;
  }

  if (error) {
    return <div style={styles.centerError}>{error}</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Participant / Leaderboard</p>
            <h1 style={styles.title}>Leaderboard</h1>
            <p style={styles.subText}>
              {leaderboardData?.quiz?.title || "-"} ({leaderboardData?.quiz?.quizCode || "-"})
            </p>
          </div>

          <div style={styles.badge}>
            <Trophy size={16} />
            <span>Live ranking summary</span>
          </div>
        </div>

        <div style={styles.actions}>
          <Link to={`/result/${quizId}`} style={styles.secondaryButton}>
            My Result
          </Link>
          <Link to="/participant-dashboard" style={styles.button}>
            Dashboard
          </Link>
        </div>

        {leaderboardData?.leaderboard?.length === 0 ? (
          <div style={styles.emptyState}>No leaderboard data available yet.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Rank</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Attempts</th>
                  <th style={styles.th}>Correct</th>
                  <th style={styles.th}>Wrong</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData?.leaderboard?.map((item) => (
                  <tr key={item.participantId}>
                    <td style={styles.td}>
                      <div style={styles.rankWrap}>
                        <div style={styles.rankIcon}>
                          <Medal size={14} />
                        </div>
                        <span>{item.rank}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{item.name}</td>
                    <td style={styles.td}>{item.email}</td>
                    <td style={styles.td}>{item.totalScore}</td>
                    <td style={styles.td}>{item.totalAttempts}</td>
                    <td style={styles.td}>{item.correctAnswers}</td>
                    <td style={styles.td}>{item.wrongAnswers}</td>
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
  card: {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "20px",
    padding: "24px",
    boxShadow: theme.shadow,
    display: "grid",
    gap: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  kicker: { margin: 0, color: theme.primary, fontSize: "13px", fontWeight: 700 },
  title: { margin: "6px 0 8px", fontSize: "30px", color: theme.text, fontWeight: 800 },
  subText: { margin: 0, color: theme.muted, fontSize: "15px" },
  badge: {
    minHeight: "40px",
    padding: "0 14px",
    borderRadius: "999px",
    background: theme.primarySoft,
    color: theme.primary,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  button: {
    textDecoration: "none",
    background: "#111",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: 700,
  },
  secondaryButton: {
    textDecoration: "none",
    background: "#444",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: 700,
  },
  tableWrapper: {
    overflowX: "auto",
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "840px",
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
  },
  rankWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 700,
  },
  rankIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: theme.warningSoft,
    color: theme.warning,
    display: "grid",
    placeItems: "center",
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

export default Leaderboard;