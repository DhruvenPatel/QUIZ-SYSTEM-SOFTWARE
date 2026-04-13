import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock3,
  FileQuestion,
  CheckCircle2,
  CircleDot,
  PenSquare,
  Target,
  AlertTriangle,
  ShieldAlert,
  Ban,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

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
  danger: "#dc2626",
  dangerSoft: "rgba(220, 38, 38, 0.10)",
  shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const MAX_VIOLATIONS = 2;
const MCQ_OPTION_KEYS = ["A", "B", "C", "D"];

const PlayQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState("");

  const hasHandledTimeoutRef = useRef(false);
  const isEndingQuizRef = useRef(false);

  const currentQuestion = questions[currentIndex];

  const progressPercent = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  const endQuizImmediately = async (
    reason = "Quiz ended due to policy violation."
  ) => {
    if (isEndingQuizRef.current) return;
    isEndingQuizRef.current = true;

    try {
      await api.post(`/results/force-end/${quizId}`, { reason });
      toast.error(reason);
      navigate(`/result/${quizId}`, {
        replace: true,
        state: { forcedEnd: true, reason },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || reason);
      navigate(`/participant-dashboard`, { replace: true });
    }
  };

  const registerViolation = async (reason) => {
    setViolationReason(reason);

    setViolationCount((prev) => {
      const next = prev + 1;

      if (next > MAX_VIOLATIONS) {
        endQuizImmediately(
          "Quiz ended because you left the quiz screen multiple times."
        );
      } else {
        setShowViolationModal(true);
        toast.error(`Warning ${next}/${MAX_VIOLATIONS}: ${reason}`);
      }

      return next;
    });
  };

  useEffect(() => {
    const fetchQuizQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const resultCheck = await api.get(`/results/my/${quizId}`).catch((err) => {
          if (err?.response?.status === 404) return null;
          throw err;
        });

        if (resultCheck?.data?.result) {
          toast.error("You cannot rejoin this quiz.");
          navigate(`/result/${quizId}`, { replace: true });
          return;
        }

        const quizRes = await api.get(`/quizzes/${quizId}`);
        const questionRes = await api.get(`/questions/participant/${quizId}`);

        const fetchedQuestions = questionRes?.data?.questions || [];

        setQuizInfo(quizRes?.data?.quiz || null);
        setQuestions(fetchedQuestions);

        if (fetchedQuestions.length > 0) {
          setTimeLeft(fetchedQuestions[0]?.timeLimit || 30);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizQuestions();
  }, [quizId, navigate]);

  useEffect(() => {
    if (!currentQuestion) return;

    setSelectedAnswer("");
    setTimeLeft(currentQuestion?.timeLimit || 30);
    hasHandledTimeoutRef.current = false;
  }, [currentIndex, currentQuestion]);

  useEffect(() => {
    if (!currentQuestion || loading || submitting) return;

    if (timeLeft <= 0 && !hasHandledTimeoutRef.current) {
      hasHandledTimeoutRef.current = true;
      handleAutoNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, currentQuestion, loading, submitting]);

  useEffect(() => {
    if (loading) return;

    const beforeUnloadHandler = (e) => {
      e.preventDefault();
      e.returnValue =
        "Your quiz is in progress. Leaving this page may end your quiz.";
      return e.returnValue;
    };

    const visibilityHandler = () => {
      if (document.hidden) {
        registerViolation("You switched tabs or minimized the window.");
      }
    };

    const blurHandler = () => {
      registerViolation("You moved away from the quiz window.");
    };

    const contextMenuHandler = (e) => e.preventDefault();
    const copyHandler = (e) => e.preventDefault();
    const cutHandler = (e) => e.preventDefault();
    const pasteHandler = (e) => e.preventDefault();
    const dragHandler = (e) => e.preventDefault();
    const selectHandler = (e) => e.preventDefault();

    const keydownHandler = (e) => {
      const key = e.key.toLowerCase();

      const blocked =
        (e.ctrlKey || e.metaKey) &&
        ["c", "x", "v", "a", "p", "s", "u"].includes(key);

      const blockedFn = key === "f12";
      const blockedDevTools =
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
        (e.metaKey && e.altKey && ["i", "j", "c"].includes(key));

      if (blocked || blockedFn || blockedDevTools) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", beforeUnloadHandler);
    document.addEventListener("visibilitychange", visibilityHandler);
    window.addEventListener("blur", blurHandler);
    document.addEventListener("contextmenu", contextMenuHandler);
    document.addEventListener("copy", copyHandler);
    document.addEventListener("cut", cutHandler);
    document.addEventListener("paste", pasteHandler);
    document.addEventListener("dragstart", dragHandler);
    document.addEventListener("selectstart", selectHandler);
    document.addEventListener("keydown", keydownHandler);

    const originalUserSelect = document.body.style.userSelect;
    const originalWebkitUserSelect = document.body.style.webkitUserSelect;
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      document.removeEventListener("visibilitychange", visibilityHandler);
      window.removeEventListener("blur", blurHandler);
      document.removeEventListener("contextmenu", contextMenuHandler);
      document.removeEventListener("copy", copyHandler);
      document.removeEventListener("cut", cutHandler);
      document.removeEventListener("paste", pasteHandler);
      document.removeEventListener("dragstart", dragHandler);
      document.removeEventListener("selectstart", selectHandler);
      document.removeEventListener("keydown", keydownHandler);

      document.body.style.userSelect = originalUserSelect;
      document.body.style.webkitUserSelect = originalWebkitUserSelect;
    };
  }, [loading]);

  const goToNextQuestionOrFinish = () => {
    setSelectedAnswer("");

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigate(`/result/${quizId}`);
    }
  };

  const submitCurrentAnswer = async () => {
    if (!selectedAnswer || !currentQuestion?._id) return;

    await api.post("/submissions", {
      quizId,
      questionId: currentQuestion._id,
      selectedAnswer,
    });
  };

  const handleManualSubmit = async () => {
    if (!selectedAnswer) {
      toast.error("Please select or enter an answer");
      return;
    }

    try {
      setSubmitting(true);
      await submitCurrentAnswer();
      toast.success("Answer submitted");
      goToNextQuestionOrFinish();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoNext = async () => {
    try {
      setSubmitting(true);

      if (selectedAnswer) {
        try {
          await submitCurrentAnswer();
        } catch (err) {
          const msg = err?.response?.data?.message || "";
          if (!msg.toLowerCase().includes("already submitted")) {
            throw err;
          }
        }
      }

      goToNextQuestionOrFinish();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to process timed question"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getTimerTone = () => {
    if (timeLeft <= 5) return "danger";
    if (timeLeft <= 10) return "warning";
    return "primary";
  };

  const timerTone = getTimerTone();

  if (loading) {
    return <div style={styles.center}>Loading quiz...</div>;
  }

  if (error) {
    return <div style={styles.centerError}>{error}</div>;
  }

  if (!questions.length) {
    return <div style={styles.center}>No questions found for this quiz.</div>;
  }

  return (
    <div style={styles.page}>
      {showViolationModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalIcon}>
              <ShieldAlert size={22} />
            </div>
            <h3 style={styles.modalTitle}>Quiz Security Warning</h3>
            <p style={styles.modalText}>{violationReason}</p>
            <p style={styles.modalSubText}>
              Warning {violationCount} of {MAX_VIOLATIONS}. One more violation may
              end the quiz.
            </p>
            <button
              type="button"
              style={styles.modalButton}
              onClick={() => setShowViolationModal(false)}
            >
              Continue Quiz
            </button>
          </div>
        </div>
      )}

      <div style={styles.topWarningBar}>
        <Ban size={16} />
        <span>
          Do not switch tabs, refresh, copy content, or leave this page during
          the quiz.
        </span>
      </div>

      <div style={styles.hero}>
        <div>
          <p style={styles.kicker}>Participant / Live Quiz</p>
          <h1 style={styles.title}>{quizInfo?.title || "Quiz Session"}</h1>
          <p style={styles.subline}>
            Stay focused, answer carefully, and keep an eye on the timer.
          </p>
        </div>

        <div
          style={{
            ...styles.timerCard,
            ...(timerTone === "danger"
              ? styles.timerDanger
              : timerTone === "warning"
              ? styles.timerWarning
              : styles.timerPrimary),
          }}
        >
          <Clock3 size={18} />
          <div>
            <p style={styles.timerLabel}>Time Left</p>
            <h3 style={styles.timerValue}>{timeLeft}s</h3>
          </div>
        </div>
      </div>

      <div style={styles.progressCard}>
        <div style={styles.progressHeader}>
          <div style={styles.progressLeft}>
            <FileQuestion size={18} />
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <span style={styles.progressRight}>{progressPercent}% completed</span>
        </div>

        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.questionHeader}>
          <div style={styles.questionBadge}>
            {currentQuestion?.questionType === "short_answer" ? (
              <PenSquare size={16} />
            ) : (
              <CircleDot size={16} />
            )}
            <span>
              {currentQuestion?.questionType === "short_answer"
                ? "Short Answer"
                : "Multiple Choice"}
            </span>
          </div>

          <div style={styles.violationBadge}>
            <ShieldAlert size={15} />
            <span>
              Violations: {violationCount}/{MAX_VIOLATIONS}
            </span>
          </div>
        </div>

        <h2 style={styles.questionText}>{currentQuestion?.questionText}</h2>

        {currentQuestion?.questionType === "short_answer" ? (
          <div style={styles.answerBox}>
            <input
              type="text"
              placeholder="Enter your answer"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              style={styles.input}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        ) : (
          <div style={styles.options}>
            {(currentQuestion?.options || []).map((option, index) => {
              const optionValue =
                currentQuestion?.questionType === "mcq"
                  ? MCQ_OPTION_KEYS[index] || option
                  : option;

              const displayLabel =
                currentQuestion?.questionType === "mcq"
                  ? `${MCQ_OPTION_KEYS[index] || ""}. ${option}`
                  : option;

              const isSelected = selectedAnswer === optionValue;

              return (
                <label
                  key={`${option}-${index}`}
                  style={{
                    ...styles.option,
                    ...(isSelected ? styles.optionSelected : {}),
                  }}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={optionValue}
                    checked={isSelected}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    style={styles.radio}
                  />
                  <span style={styles.optionText}>{displayLabel}</span>
                </label>
              );
            })}
          </div>
        )}

        <div style={styles.footer}>
          <div style={styles.metaGroup}>
            <div style={styles.metaCard}>
              <Target size={16} />
              <span>Marks: {currentQuestion?.marks ?? 0}</span>
            </div>

            <div style={styles.metaCard}>
              <AlertTriangle size={16} />
              <span>Negative: {currentQuestion?.negativeMarks ?? 0}</span>
            </div>
          </div>

          <button
            onClick={handleManualSubmit}
            style={styles.button}
            disabled={submitting}
          >
            <CheckCircle2 size={16} />
            <span>
              {submitting
                ? "Submitting..."
                : currentIndex === questions.length - 1
                ? "Finish Quiz"
                : "Next Question"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: theme.bg,
    padding: "24px",
    display: "grid",
    gap: "20px",
    maxWidth: "1100px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  topWarningBar: {
    minHeight: "42px",
    padding: "0 14px",
    borderRadius: "12px",
    background: theme.warningSoft,
    color: theme.warning,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 700,
    border: `1px solid rgba(217, 119, 6, 0.18)`,
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    maxWidth: "720px",
  },
  timerCard: {
    minWidth: "150px",
    borderRadius: "18px",
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadow,
  },
  timerPrimary: {
    background: theme.primarySoft,
    color: theme.primary,
  },
  timerWarning: {
    background: theme.warningSoft,
    color: theme.warning,
  },
  timerDanger: {
    background: theme.dangerSoft,
    color: theme.danger,
  },
  timerLabel: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 700,
    opacity: 0.9,
  },
  timerValue: {
    margin: "4px 0 0",
    fontSize: "22px",
    fontWeight: 800,
    lineHeight: 1,
  },
  progressCard: {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "18px",
    padding: "18px",
    boxShadow: theme.shadow,
    display: "grid",
    gap: "12px",
  },
  progressHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  progressLeft: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: theme.text,
    fontSize: "14px",
    fontWeight: 700,
  },
  progressRight: {
    color: theme.muted,
    fontSize: "13px",
    fontWeight: 600,
  },
  progressTrack: {
    width: "100%",
    height: "10px",
    background: "#e9eef6",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: theme.primary,
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },
  card: {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "22px",
    padding: "24px",
    boxShadow: theme.shadow,
    display: "grid",
    gap: "20px",
  },
  questionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  questionBadge: {
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: "999px",
    background: theme.primarySoft,
    color: theme.primary,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 700,
  },
  violationBadge: {
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: "999px",
    background: theme.dangerSoft,
    color: theme.danger,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 700,
  },
  questionText: {
    margin: 0,
    fontSize: "24px",
    lineHeight: 1.5,
    color: theme.text,
    fontWeight: 800,
  },
  answerBox: {
    display: "grid",
  },
  input: {
    width: "100%",
    minHeight: "52px",
    padding: "0 16px",
    borderRadius: "14px",
    border: `1px solid ${theme.border}`,
    outline: "none",
    fontSize: "15px",
    color: theme.text,
    boxSizing: "border-box",
    background: "#fff",
  },
  options: {
    display: "grid",
    gap: "12px",
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    border: `1px solid ${theme.border}`,
    borderRadius: "14px",
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  optionSelected: {
    border: `1px solid ${theme.primary}`,
    background: theme.primarySoft,
  },
  radio: {
    margin: 0,
    flexShrink: 0,
  },
  optionText: {
    fontSize: "15px",
    color: theme.text,
    lineHeight: 1.6,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    paddingTop: "4px",
  },
  metaGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  metaCard: {
    minHeight: "38px",
    padding: "0 12px",
    borderRadius: "999px",
    border: `1px solid ${theme.border}`,
    background: "#fff",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: theme.muted,
    fontSize: "13px",
    fontWeight: 700,
  },
  button: {
    minHeight: "46px",
    padding: "0 18px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    background: theme.primary,
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.58)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  modalCard: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
    display: "grid",
    gap: "14px",
    textAlign: "center",
  },
  modalIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "16px",
    margin: "0 auto",
    background: theme.dangerSoft,
    color: theme.danger,
    display: "grid",
    placeItems: "center",
  },
  modalTitle: {
    margin: 0,
    fontSize: "22px",
    color: theme.text,
    fontWeight: 800,
  },
  modalText: {
    margin: 0,
    fontSize: "14px",
    color: theme.text,
    lineHeight: 1.7,
  },
  modalSubText: {
    margin: 0,
    fontSize: "13px",
    color: theme.muted,
    lineHeight: 1.6,
  },
  modalButton: {
    minHeight: "46px",
    border: "none",
    borderRadius: "12px",
    background: theme.primary,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "14px",
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
    color: theme.danger,
  },
};

export default PlayQuiz;