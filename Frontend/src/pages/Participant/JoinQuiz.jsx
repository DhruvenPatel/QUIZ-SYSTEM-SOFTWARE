import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  PlayCircle,
  FileText,
  Hash,
  ArrowRight,
  CheckCircle2,
  Trophy,
  AlertTriangle,
  Ban,
} from "lucide-react";
import api from "../../api/axios";

const theme = {
  card: "#ffffff",
  surface: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  primary: "#2563eb",
  primarySoft: "rgba(37, 99, 235, 0.08)",
  success: "#16a34a",
  successSoft: "rgba(22, 163, 74, 0.10)",
  warning: "#d97706",
  warningSoft: "rgba(217, 119, 6, 0.10)",
  danger: "#dc2626",
  dangerSoft: "rgba(220, 38, 38, 0.10)",
  shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const JoinQuiz = () => {
  const navigate = useNavigate();

  const [quizCode, setQuizCode] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [attemptStatus, setAttemptStatus] = useState("");
  const [terminatedReason, setTerminatedReason] = useState("");
  const [attemptCheckError, setAttemptCheckError] = useState("");
  const [checkingAttempt, setCheckingAttempt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedStatus = (status) => (status || "").toLowerCase();

  const isJoinAllowedByStatus = (status) => {
    const value = normalizedStatus(status);
    return ["live", "published", "active", "upcoming"].includes(value);
  };

  const getStatusMessage = (status) => {
    const value = normalizedStatus(status);

    if (value === "draft") return "This quiz is still in draft and cannot be joined yet.";
    if (value === "completed") return "This quiz has already been completed.";
    if (value === "inactive") return "This quiz is currently inactive.";
    if (value === "closed") return "This quiz is closed.";
    return "";
  };

  const checkIfAlreadyAttempted = async (quizId) => {
    try {
      const { data } = await api.get(`/results/my/${quizId}`);
      return {
        attempted: true,
        status: data?.result?.status || "completed",
        terminatedReason: data?.result?.terminatedReason || "",
        error: "",
      };
    } catch (err) {
      const status = err?.response?.status;

      if (status === 404) {
        return {
          attempted: false,
          status: "",
          terminatedReason: "",
          error: "",
        };
      }

      return {
        attempted: false,
        status: "",
        terminatedReason: "",
        error:
          err?.response?.data?.message ||
          "Could not verify your previous participation.",
      };
    }
  };

  const handleSearchQuiz = async (e) => {
    e.preventDefault();

    const normalizedCode = quizCode.trim().toUpperCase();

    if (!normalizedCode) {
      setError("Please enter a quiz code.");
      setQuiz(null);
      setAlreadyAttempted(false);
      setAttemptStatus("");
      setTerminatedReason("");
      setAttemptCheckError("");
      return;
    }

    setError("");
    setQuiz(null);
    setAlreadyAttempted(false);
    setAttemptStatus("");
    setTerminatedReason("");
    setAttemptCheckError("");
    setLoading(true);
    setCheckingAttempt(false);

    try {
      const { data } = await api.get(`/quizzes/code/${normalizedCode}`);
      const foundQuiz = data?.quiz || null;

      setQuiz(foundQuiz);

      if (foundQuiz?._id) {
        setCheckingAttempt(true);
        const result = await checkIfAlreadyAttempted(foundQuiz._id);
        setAlreadyAttempted(result.attempted);
        setAttemptStatus(result.status);
        setTerminatedReason(result.terminatedReason);
        setAttemptCheckError(result.error);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to find quiz.");
    } finally {
      setLoading(false);
      setCheckingAttempt(false);
    }
  };

  const handleJoinQuiz = () => {
    if (!quiz?._id) return;
    if (alreadyAttempted) return;
    if (attemptCheckError) return;
    if (!isJoinAllowedByStatus(quiz?.status)) return;

    navigate(`/play-quiz/${quiz._id}`);
  };

  const showJoinButton =
    quiz &&
    !alreadyAttempted &&
    !attemptCheckError &&
    isJoinAllowedByStatus(quiz?.status);

  const showAlreadyAttemptedActions = quiz && alreadyAttempted;

  const showStatusBlockedMessage =
    quiz && !alreadyAttempted && !isJoinAllowedByStatus(quiz?.status);

  const getAttemptMessage = () => {
    if (attemptStatus === "terminated") {
      return terminatedReason || "Your quiz session was ended due to policy violations.";
    }

    if (attemptStatus === "disqualified") {
      return terminatedReason || "You were disqualified from this quiz.";
    }

    return "You have already completed this quiz.";
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.kicker}>Participant</p>
          <h1 style={styles.title}>Join Quiz</h1>
          <p style={styles.subline}>
            Enter your quiz code to check access and continue.
          </p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionHead}>
          <h2 style={styles.cardTitle}>Quiz Code</h2>
          <p style={styles.cardSubline}>
            We’ll verify the quiz and your participation status.
          </p>
        </div>

        <form onSubmit={handleSearchQuiz} style={styles.form}>
          <div style={styles.inputWrap}>
            <Hash size={16} color={theme.muted} />
            <input
              type="text"
              placeholder="Enter quiz code"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            <Search size={16} />
            <span>{loading ? "Checking..." : "Find Quiz"}</span>
          </button>
        </form>

        {error ? <div style={styles.errorBox}>{error}</div> : null}

        {quiz ? (
          <div style={styles.quizCard}>
            <div style={styles.quizHeader}>
              <div style={styles.quizIcon}>
                <PlayCircle size={18} />
              </div>

              <div style={{ minWidth: 0 }}>
                <h3 style={styles.quizTitle}>{quiz.title || "Untitled Quiz"}</h3>
                <p style={styles.quizMeta}>Quiz Code: {quiz.quizCode || "-"}</p>
              </div>
            </div>

            <div style={styles.quizInfo}>
              <div style={styles.infoItem}>
                <FileText size={15} />
                <span>{quiz.description || "No description available."}</span>
              </div>

              <div style={styles.infoItem}>
                <Hash size={15} />
                <span>Status: {quiz.status || "-"}</span>
              </div>
            </div>

            {checkingAttempt ? (
              <div style={styles.infoBanner}>
                <AlertTriangle size={15} />
                <span>Checking your participation...</span>
              </div>
            ) : attemptCheckError ? (
              <div style={styles.errorBox}>{attemptCheckError}</div>
            ) : showAlreadyAttemptedActions ? (
              <div style={styles.successBanner}>
                <CheckCircle2 size={15} />
                <span>{getAttemptMessage()}</span>
              </div>
            ) : showStatusBlockedMessage ? (
              <div style={styles.warningBanner}>
                <Ban size={15} />
                <span>{getStatusMessage(quiz?.status)}</span>
              </div>
            ) : (
              <div style={styles.readyBanner}>
                <CheckCircle2 size={15} />
                <span>You are eligible to join this quiz.</span>
              </div>
            )}

            {showAlreadyAttemptedActions ? (
              <div style={styles.actionRow}>
                <Link to={`/result/${quiz._id}`} style={styles.secondaryAction}>
                  <CheckCircle2 size={15} />
                  <span>View Result</span>
                </Link>

                <Link to={`/leaderboard/${quiz._id}`} style={styles.primaryAction}>
                  <Trophy size={15} />
                  <span>View Leaderboard</span>
                </Link>
              </div>
            ) : showJoinButton ? (
              <button style={styles.joinButton} onClick={handleJoinQuiz}>
                <span>Join Quiz</span>
                <ArrowRight size={15} />
              </button>
            ) : null}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>No quiz selected</p>
            <p style={styles.emptyText}>
              Enter a valid quiz code above to preview quiz details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "grid",
    gap: "18px",
    width: "100%",
    maxWidth: "720px",
    margin: "0 auto",
  },
  header: {
    display: "grid",
    gap: "6px",
  },
  kicker: {
    margin: 0,
    color: theme.primary,
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.15,
    color: theme.text,
    fontWeight: 800,
  },
  subline: {
    margin: 0,
    color: theme.muted,
    fontSize: "14px",
    lineHeight: 1.6,
  },
  card: {
    width: "100%",
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "18px",
    padding: "20px",
    boxShadow: theme.shadow,
    display: "grid",
    gap: "16px",
    boxSizing: "border-box",
  },
  sectionHead: {
    display: "grid",
    gap: "4px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "18px",
    color: theme.text,
    fontWeight: 700,
  },
  cardSubline: {
    margin: 0,
    fontSize: "13px",
    color: theme.muted,
    lineHeight: 1.5,
  },
  form: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "10px",
    alignItems: "stretch",
  },
  inputWrap: {
    height: "46px",
    borderRadius: "12px",
    border: `1px solid ${theme.border}`,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 14px",
  },
  input: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    fontWeight: 500,
    color: theme.text,
    background: "transparent",
    textTransform: "uppercase",
  },
  button: {
    minHeight: "46px",
    padding: "0 16px",
    border: "none",
    borderRadius: "12px",
    background: theme.primary,
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  errorBox: {
    padding: "12px 14px",
    borderRadius: "12px",
    background: theme.dangerSoft,
    color: theme.danger,
    fontSize: "13px",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  quizCard: {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    display: "grid",
    gap: "12px",
    boxSizing: "border-box",
  },
  quizHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
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
    fontSize: "18px",
    color: theme.text,
    fontWeight: 700,
    lineHeight: 1.3,
  },
  quizMeta: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: theme.muted,
    fontWeight: 500,
  },
  quizInfo: {
    display: "grid",
    gap: "10px",
  },
  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    color: theme.muted,
    fontSize: "13px",
    lineHeight: 1.6,
  },
  infoBanner: {
    minHeight: "40px",
    padding: "0 14px",
    borderRadius: "12px",
    background: theme.warningSoft,
    color: theme.warning,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 600,
  },
  successBanner: {
    minHeight: "40px",
    padding: "0 14px",
    borderRadius: "12px",
    background: theme.primarySoft,
    color: theme.primary,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 600,
  },
  readyBanner: {
    minHeight: "40px",
    padding: "0 14px",
    borderRadius: "12px",
    background: theme.successSoft,
    color: theme.success,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 600,
  },
  warningBanner: {
    minHeight: "40px",
    padding: "0 14px",
    borderRadius: "12px",
    background: theme.warningSoft,
    color: theme.warning,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 600,
  },
  joinButton: {
    minHeight: "46px",
    border: "none",
    borderRadius: "12px",
    background: theme.success,
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryAction: {
    textDecoration: "none",
    minHeight: "42px",
    padding: "0 14px",
    borderRadius: "12px",
    background: theme.primary,
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 700,
  },
  secondaryAction: {
    textDecoration: "none",
    minHeight: "42px",
    padding: "0 14px",
    borderRadius: "12px",
    background: "#334155",
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 700,
  },
  emptyState: {
    border: `1px dashed ${theme.border}`,
    borderRadius: "14px",
    padding: "22px 18px",
    background: "#fff",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "14px",
    color: theme.text,
    fontWeight: 700,
  },
  emptyText: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: theme.muted,
    lineHeight: 1.6,
  },
};

export default JoinQuiz;