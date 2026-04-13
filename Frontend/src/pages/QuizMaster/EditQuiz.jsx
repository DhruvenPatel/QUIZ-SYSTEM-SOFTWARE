import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ListChecks,
  FileText,
  CalendarClock,
  ArrowLeft,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const theme = {
  primary: "#2563eb",
  primarySoft: "rgba(37, 99, 235, 0.08)",
  success: "#15803d",
  danger: "#dc2626",
  surface: "#ffffff",
  surfaceSoft: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  shadowSm: "0 4px 14px rgba(15, 23, 42, 0.05)",
};

const EditQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quizCode: "",
    status: "draft",
    startTime: "",
    endTime: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/quizzes/${quizId}`);
        const quiz = data.quiz;

        setFormData({
          title: quiz.title || "",
          description: quiz.description || "",
          quizCode: quiz.quizCode || "",
          status: quiz.status || "draft",
          startTime: quiz.startTime ? formatDateTimeLocal(quiz.startTime) : "",
          endTime: quiz.endTime ? formatDateTimeLocal(quiz.endTime) : "",
        });
      } catch (err) {
        const message = err.response?.data?.message || "Failed to fetch quiz";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString);
    const pad = (num) => String(num).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        ...formData,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
      };

      const { data } = await api.put(`/quizzes/${quizId}`, payload);
      const message = data.message || "Quiz updated successfully";

      setSuccess(message);
      toast.success(message);

      setTimeout(() => {
        navigate(`/quizzes/${quizId}`);
      }, 700);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update quiz";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.stateCard}>
        <p style={styles.stateTitle}>Loading quiz...</p>
        <p style={styles.stateText}>
          Please wait while the quiz details are being loaded.
        </p>
      </div>
    );
  }

  return (
    <>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Quiz Management</p>
          <h1 style={styles.title}>Edit quiz</h1>
          <p style={styles.subtitle}>
            Update the quiz title, code, schedule, and current workflow status.
          </p>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.secondaryBtn}
            onClick={() => navigate(`/quizzes/${quizId}`)}
          >
            <ArrowLeft size={16} />
            <span>Back to Quiz</span>
          </button>

          <Link to="/quizzes" style={styles.textBtn}>
            <ListChecks size={16} />
            <span>View Quizzes</span>
          </Link>
        </div>
      </header>

      <section style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Quiz information</h2>
            <p style={styles.cardText}>
              Review and update the fields below to keep the quiz setup accurate.
            </p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <p style={styles.bannerTitle}>Something went wrong</p>
              <p style={styles.bannerText}>{error}</p>
            </div>
          )}

          {success && (
            <div style={styles.successBanner}>
              <p style={styles.bannerTitle}>Quiz updated successfully</p>
              <p style={styles.bannerText}>{success}</p>
            </div>
          )}

          <form onSubmit={handleUpdateQuiz} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Quiz Title</label>
              <div style={styles.inputWrap}>
                <FileText size={16} style={styles.icon} />
                <input
                  type="text"
                  name="title"
                  placeholder="Enter quiz title"
                  value={formData.title}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <p style={styles.helperText}>
                Use a short, clear title that makes the quiz easy to identify.
              </p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                placeholder="Add a short description"
                value={formData.description}
                onChange={handleChange}
                style={styles.textarea}
              />
              <p style={styles.helperText}>
                Optional. Add context about the quiz topic or purpose.
              </p>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Quiz Code</label>
                <input
                  type="text"
                  name="quizCode"
                  placeholder="Enter unique code"
                  value={formData.quizCode}
                  onChange={handleChange}
                  style={styles.inputPlain}
                  required
                />
                <p style={styles.helperText}>
                  This code helps identify the quiz quickly in lists and flows.
                </p>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={styles.inputPlain}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                </select>
                <p style={styles.helperText}>
                  Choose the current workflow state for this quiz.
                </p>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Start Time</label>
                <div style={styles.inputWrap}>
                  <CalendarClock size={16} style={styles.icon} />
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <p style={styles.helperText}>
                  Optional. Set when the quiz should begin.
                </p>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>End Time</label>
                <div style={styles.inputWrap}>
                  <CalendarClock size={16} style={styles.icon} />
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <p style={styles.helperText}>
                  Optional. Set when the quiz should stop.
                </p>
              </div>
            </div>

            <div style={styles.buttons}>
              <button
                type="button"
                style={styles.ghost}
                onClick={() => navigate(`/quizzes/${quizId}`)}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.primary}
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Quiz"}
              </button>
            </div>
          </form>
        </div>
      </section>
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
    flexWrap: "wrap",
    boxShadow: theme.shadowSm,
  },

  eyebrow: {
    margin: 0,
    fontSize: 11,
    color: theme.primary,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  title: {
    margin: "6px 0 0",
    fontSize: 26,
    lineHeight: 1.15,
    fontWeight: 700,
    color: theme.text,
  },

  subtitle: {
    margin: "8px 0 0",
    color: theme.muted,
    fontSize: 13,
    lineHeight: 1.65,
    maxWidth: 640,
  },

  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  secondaryBtn: {
    minHeight: 36,
    padding: "0 12px",
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    background: theme.surface,
    color: theme.text,
    fontSize: 13,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },

  textBtn: {
    minHeight: 36,
    padding: "0 10px",
    borderRadius: 10,
    background: "transparent",
    color: theme.primary,
    fontSize: 13,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
  },

  container: {
    marginTop: 16,
  },

  card: {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 18,
    padding: 22,
    boxShadow: theme.shadowSm,
  },

  cardHeader: {
    marginBottom: 18,
  },

  cardTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: theme.text,
  },

  cardText: {
    color: theme.muted,
    margin: "6px 0 0",
    fontSize: 13,
    lineHeight: 1.6,
  },

  errorBanner: {
    marginBottom: 16,
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(220, 38, 38, 0.05)",
    border: "1px solid rgba(220, 38, 38, 0.16)",
  },

  successBanner: {
    marginBottom: 16,
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(21, 128, 61, 0.05)",
    border: "1px solid rgba(21, 128, 61, 0.16)",
  },

  bannerTitle: {
    margin: 0,
    color: theme.text,
    fontSize: 13,
    fontWeight: 700,
  },

  bannerText: {
    margin: "4px 0 0",
    color: theme.muted,
    fontSize: 12,
    lineHeight: 1.6,
  },

  form: {
    display: "grid",
    gap: 16,
  },

  field: {
    display: "grid",
    gap: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.text,
  },

  helperText: {
    margin: 0,
    fontSize: 12,
    color: theme.muted,
    lineHeight: 1.5,
  },

  inputWrap: {
    position: "relative",
  },

  icon: {
    position: "absolute",
    left: 12,
    top: 12,
    color: theme.muted,
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    height: 40,
    padding: "0 12px 0 38px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.surfaceSoft,
    color: theme.text,
    fontSize: 13,
    boxSizing: "border-box",
    outline: "none",
  },

  inputPlain: {
    width: "100%",
    height: 40,
    padding: "0 12px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.surfaceSoft,
    color: theme.text,
    fontSize: 13,
    boxSizing: "border-box",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: 96,
    padding: 12,
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.surfaceSoft,
    color: theme.text,
    fontSize: 13,
    boxSizing: "border-box",
    resize: "vertical",
    outline: "none",
    lineHeight: 1.6,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },

  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },

  ghost: {
    minHeight: 36,
    padding: "0 14px",
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    background: theme.surface,
    color: theme.text,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  primary: {
    minHeight: 36,
    padding: "0 14px",
    border: "none",
    borderRadius: 10,
    background: theme.primary,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: theme.shadowSm,
  },

  stateCard: {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    padding: 18,
    boxShadow: theme.shadowSm,
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
};

export default EditQuiz;