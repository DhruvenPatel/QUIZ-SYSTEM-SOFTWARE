import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Target,
  BarChart3,
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
  successSoft: "rgba(22, 163, 74, 0.1)",
  danger: "#dc2626",
  dangerSoft: "rgba(220, 38, 38, 0.1)",
  warning: "#d97706",
  warningSoft: "rgba(217, 119, 6, 0.1)",
  shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const StatCard = ({ icon, title, value, tone = "primary" }) => {
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
        <p style={styles.statLabel}>{title}</p>
        <h3 style={styles.statValue}>{value ?? 0}</h3>
      </div>
    </div>
  );
};

const Result = () => {
  const { quizId } = useParams();

  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(`/results/my/${quizId}`);
        setResultData(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to fetch result.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [quizId]);

  if (loading) {
    return <div style={styles.center}>Loading result...</div>;
  }

  if (error) {
    return <div style={styles.centerError}>{error}</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Participant / Quiz Result</p>
            <h1 style={styles.title}>Quiz Result</h1>
            <p style={styles.subText}>{resultData?.quiz?.title || "-"}</p>
          </div>

          <div style={styles.badge}>
            <Trophy size={16} />
            <span>Your performance summary</span>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <StatCard
            icon={<BarChart3 size={18} />}
            title="Total Score"
            value={resultData?.result?.totalScore}
            tone="primary"
          />
          <StatCard
            icon={<Target size={18} />}
            title="Total Attempts"
            value={resultData?.result?.totalAttempts}
            tone="warning"
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            title="Correct Answers"
            value={resultData?.result?.correctAnswers}
            tone="success"
          />
          <StatCard
            icon={<XCircle size={18} />}
            title="Wrong Answers"
            value={resultData?.result?.wrongAnswers}
            tone="danger"
          />
        </div>

        <div style={styles.actions}>
          <Link to={`/leaderboard/${quizId}`} style={styles.secondaryButton}>
            View Leaderboard
          </Link>

          <Link to="/participant-dashboard" style={styles.button}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "grid",
    gap: "20px",
    width: "100%",
  },

  card: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "20px",
    padding: "24px",
    boxShadow: theme.shadow,
    display: "grid",
    gap: "20px",
    boxSizing: "border-box",
  },

  header: {
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
    margin: "6px 0 8px",
    fontSize: "30px",
    color: theme.text,
    fontWeight: 800,
    lineHeight: 1.1,
  },

  subText: {
    margin: 0,
    color: theme.muted,
    fontSize: "15px",
    lineHeight: 1.6,
  },

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

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },

  statCard: {
    border: `1px solid ${theme.border}`,
    borderRadius: "18px",
    padding: "18px",
    background: "#fff",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },

  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  statLabel: {
    margin: 0,
    fontSize: "13px",
    color: theme.muted,
    fontWeight: 600,
  },

  statValue: {
    margin: "6px 0 0",
    fontSize: "26px",
    color: theme.text,
    fontWeight: 800,
    lineHeight: 1,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },

  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    padding: "0 16px",
    borderRadius: "12px",
    background: "#111",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    padding: "0 16px",
    borderRadius: "12px",
    background: "#444",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
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

export default Result;