import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ListChecks,
  TimerReset,
  Hash,
  CheckCircle2,
  ListTodo,
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

const DEFAULT_OPTIONS = ["", "", "", ""];
const OPTION_LABELS = ["A", "B", "C", "D"];

const normalizeCorrectAnswer = (questionType, correctAnswer) => {
  if (questionType === "mcq") {
    return OPTION_LABELS.includes(correctAnswer) ? correctAnswer : "A";
  }

  if (questionType === "true_false") {
    return ["True", "False"].includes(correctAnswer) ? correctAnswer : "True";
  }

  return correctAnswer || "";
};

const EditQuestion = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    quizId: "",
    questionText: "",
    questionType: "mcq",
    options: [...DEFAULT_OPTIONS],
    correctAnswer: "A",
    marks: 1,
    negativeMarks: 0,
    timeLimit: 30,
    order: 1,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/questions/${questionId}`);
        const question = data.question;
        const questionType = question.questionType || "mcq";

        setFormData({
          quizId: question.quizId?._id || question.quizId || "",
          questionText: question.questionText || "",
          questionType,
          options:
            questionType === "short_answer"
              ? []
              : question.options?.length
              ? question.options
              : [...DEFAULT_OPTIONS],
          correctAnswer: normalizeCorrectAnswer(
            questionType,
            question.correctAnswer
          ),
          marks: question.marks ?? 1,
          negativeMarks: question.negativeMarks ?? 0,
          timeLimit: question.timeLimit ?? 30,
          order: question.order ?? 1,
        });
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch question";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: ["marks", "negativeMarks", "timeLimit", "order"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = value;

    setFormData((prev) => ({
      ...prev,
      options: updatedOptions,
    }));
  };

  const handleQuestionTypeChange = (e) => {
    const value = e.target.value;

    if (value === "true_false") {
      setFormData((prev) => ({
        ...prev,
        questionType: value,
        options: ["True", "False"],
        correctAnswer: "True",
      }));
    } else if (value === "short_answer") {
      setFormData((prev) => ({
        ...prev,
        questionType: value,
        options: [],
        correctAnswer: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        questionType: value,
        options:
          prev.options.length === 4 ? prev.options : [...DEFAULT_OPTIONS],
        correctAnswer: "A",
      }));
    }
  };

  const validateForm = () => {
    if (!formData.questionText.trim()) {
      throw new Error("Please enter the question text.");
    }

    if (formData.questionType === "mcq") {
      const trimmedOptions = formData.options.map((item) => item.trim());

      if (trimmedOptions.length !== 4 || trimmedOptions.some((item) => !item)) {
        throw new Error("Please fill all 4 MCQ options.");
      }

      if (!OPTION_LABELS.includes(formData.correctAnswer)) {
        throw new Error("Please select a valid correct answer for MCQ.");
      }
    }

    if (formData.questionType === "true_false") {
      if (!["True", "False"].includes(formData.correctAnswer)) {
        throw new Error("Please select True or False as the correct answer.");
      }
    }

    if (formData.questionType === "short_answer") {
      if (!formData.correctAnswer.trim()) {
        throw new Error("Please enter the correct answer for short answer type.");
      }
    }

    if (formData.marks < 0 || formData.negativeMarks < 0 || formData.timeLimit < 0) {
      throw new Error("Marks, negative marks, and time limit cannot be negative.");
    }

    if (formData.order < 1) {
      throw new Error("Question order must be at least 1.");
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      validateForm();

      const payload = {
        questionText: formData.questionText,
        questionType: formData.questionType,
        options:
          formData.questionType === "short_answer"
            ? []
            : formData.options.map((item) => item.trim()),
        correctAnswer: formData.correctAnswer,
        marks: formData.marks,
        negativeMarks: formData.negativeMarks,
        timeLimit: formData.timeLimit,
        order: formData.order,
      };

      const { data } = await api.put(`/questions/${questionId}`, payload);

      const message = data.message || "Question updated successfully";
      setSuccess(message);
      toast.success(message);

      setTimeout(() => {
        navigate(`/quizzes/${formData.quizId}`);
      }, 700);
    } catch (err) {
      const message =
        err.message ||
        err.response?.data?.message ||
        "Failed to update question";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.stateCard}>
        <p style={styles.stateTitle}>Loading question...</p>
        <p style={styles.stateText}>
          Please wait while the current question details are loaded.
        </p>
      </div>
    );
  }

  return (
    <>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Question Management</p>
          <h1 style={styles.title}>Edit question</h1>
          <p style={styles.subtitle}>
            Update question content, answer format, scoring, and order.
          </p>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.secondaryBtn}
            onClick={() => navigate(`/quizzes/${formData.quizId}`)}
          >
            <ArrowLeft size={15} />
            <span>Back to Quiz</span>
          </button>

          <Link to="/quizzes" style={styles.textBtn}>
            <ListChecks size={15} />
            <span>View Quizzes</span>
          </Link>
        </div>
      </header>

      <section style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Question details</h2>
            <p style={styles.cardText}>
              Review the fields below and save the updated question.
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
              <p style={styles.bannerTitle}>Question updated successfully</p>
              <p style={styles.bannerText}>{success}</p>
            </div>
          )}

          <form onSubmit={handleUpdateQuestion} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Question Text</label>
              <textarea
                name="questionText"
                placeholder="Enter question text"
                value={formData.questionText}
                onChange={handleChange}
                style={styles.textarea}
                required
              />
              <p style={styles.helperText}>
                Keep the wording clear and easy to understand.
              </p>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Question Type</label>
                <select
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleQuestionTypeChange}
                  style={styles.inputPlain}
                >
                  <option value="mcq">MCQ</option>
                  <option value="true_false">True / False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
                <p style={styles.helperText}>
                  Choose how participants will answer this question.
                </p>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Correct Answer</label>

                {formData.questionType === "mcq" ? (
                  <select
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleChange}
                    style={styles.inputPlain}
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                ) : formData.questionType === "true_false" ? (
                  <select
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleChange}
                    style={styles.inputPlain}
                  >
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                ) : (
                  <div style={styles.inputWrap}>
                    <CheckCircle2 size={15} style={styles.icon} />
                    <input
                      type="text"
                      name="correctAnswer"
                      placeholder="Enter correct answer"
                      value={formData.correctAnswer}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>
                )}

                <p style={styles.helperText}>
                  {formData.questionType === "mcq"
                    ? "Select the correct option label for this question."
                    : formData.questionType === "true_false"
                    ? "Select the correct boolean answer."
                    : "Enter the expected answer text."}
                </p>
              </div>
            </div>

            {formData.questionType !== "short_answer" && (
              <div style={styles.optionSection}>
                <div style={styles.optionHeader}>
                  <p style={styles.optionTitle}>Answer Options</p>
                  <p style={styles.optionText}>
                    Update the answer choices shown to participants.
                  </p>
                </div>

                <div style={styles.row}>
                  {formData.options.map((option, index) => {
                    const optionLabel = OPTION_LABELS[index] || `${index + 1}`;

                    return (
                      <div key={index} style={styles.field}>
                        <label style={styles.label}>Option {optionLabel}</label>
                        <div style={styles.inputWrap}>
                          <ListTodo size={15} style={styles.icon} />
                          <input
                            type="text"
                            placeholder={`Option ${optionLabel}`}
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value)
                            }
                            style={styles.input}
                            disabled={formData.questionType === "true_false"}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={styles.tripleRow}>
              <div style={styles.field}>
                <label style={styles.label}>Marks</label>
                <div style={styles.inputWrap}>
                  <Hash size={15} style={styles.icon} />
                  <input
                    type="number"
                    name="marks"
                    placeholder="Marks"
                    value={formData.marks}
                    onChange={handleChange}
                    style={styles.input}
                    min="0"
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Negative Marks</label>
                <div style={styles.inputWrap}>
                  <Hash size={15} style={styles.icon} />
                  <input
                    type="number"
                    name="negativeMarks"
                    placeholder="Negative marks"
                    value={formData.negativeMarks}
                    onChange={handleChange}
                    style={styles.input}
                    min="0"
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Time Limit</label>
                <div style={styles.inputWrap}>
                  <TimerReset size={15} style={styles.icon} />
                  <input
                    type="number"
                    name="timeLimit"
                    placeholder="Time limit in seconds"
                    value={formData.timeLimit}
                    onChange={handleChange}
                    style={styles.input}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div style={styles.singleFieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>Question Order</label>
                <div style={styles.inputWrap}>
                  <Hash size={15} style={styles.icon} />
                  <input
                    type="number"
                    name="order"
                    placeholder="Question order"
                    value={formData.order}
                    onChange={handleChange}
                    style={styles.input}
                    min="1"
                  />
                </div>
                <p style={styles.helperText}>
                  Controls where the question appears in the quiz.
                </p>
              </div>
            </div>

            <div style={styles.buttons}>
              <button
                type="button"
                style={styles.ghost}
                onClick={() => navigate(`/quizzes/${formData.quizId}`)}
              >
                Cancel
              </button>

              <button type="submit" style={styles.primary} disabled={saving}>
                {saving ? "Updating..." : "Update Question"}
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
    fontSize: 24,
    lineHeight: 1.15,
    fontWeight: 700,
    color: theme.text,
  },

  subtitle: {
    margin: "8px 0 0",
    color: theme.muted,
    fontSize: 13,
    lineHeight: 1.6,
    maxWidth: 620,
  },

  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  secondaryBtn: {
    minHeight: 34,
    padding: "0 12px",
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    background: theme.surface,
    color: theme.text,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },

  textBtn: {
    minHeight: 34,
    padding: "0 10px",
    borderRadius: 10,
    background: "transparent",
    color: theme.primary,
    fontSize: 12,
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
    padding: 20,
    boxShadow: theme.shadowSm,
  },

  cardHeader: {
    marginBottom: 16,
  },

  cardTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: theme.text,
  },

  cardText: {
    color: theme.muted,
    margin: "6px 0 0",
    fontSize: 12,
    lineHeight: 1.6,
  },

  errorBanner: {
    marginBottom: 14,
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(220, 38, 38, 0.05)",
    border: "1px solid rgba(220, 38, 38, 0.16)",
  },

  successBanner: {
    marginBottom: 14,
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(21, 128, 61, 0.05)",
    border: "1px solid rgba(21, 128, 61, 0.16)",
  },

  bannerTitle: {
    margin: 0,
    color: theme.text,
    fontSize: 12,
    fontWeight: 700,
  },

  bannerText: {
    margin: "4px 0 0",
    color: theme.muted,
    fontSize: 12,
    lineHeight: 1.5,
  },

  form: {
    display: "grid",
    gap: 14,
  },

  field: {
    display: "grid",
    gap: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.text,
  },

  helperText: {
    margin: 0,
    fontSize: 11,
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
    height: 38,
    padding: "0 12px 0 38px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.surfaceSoft,
    color: theme.text,
    fontSize: 12,
    boxSizing: "border-box",
    outline: "none",
  },

  inputPlain: {
    width: "100%",
    height: 38,
    padding: "0 12px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.surfaceSoft,
    color: theme.text,
    fontSize: 12,
    boxSizing: "border-box",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: 92,
    padding: 12,
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.surfaceSoft,
    color: theme.text,
    fontSize: 12,
    boxSizing: "border-box",
    resize: "vertical",
    outline: "none",
    lineHeight: 1.6,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },

  tripleRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
  },

  singleFieldRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },

  optionSection: {
    padding: 14,
    borderRadius: 14,
    background: theme.surfaceSoft,
    border: `1px solid ${theme.border}`,
  },

  optionHeader: {
    marginBottom: 12,
  },

  optionTitle: {
    margin: 0,
    fontSize: 13,
    color: theme.text,
    fontWeight: 700,
  },

  optionText: {
    margin: "4px 0 0",
    fontSize: 11,
    color: theme.muted,
    lineHeight: 1.5,
  },

  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 2,
    flexWrap: "wrap",
  },

  ghost: {
    minHeight: 34,
    padding: "0 14px",
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    background: theme.surface,
    color: theme.text,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },

  primary: {
    minHeight: 34,
    padding: "0 14px",
    border: "none",
    borderRadius: 10,
    background: theme.primary,
    color: "#fff",
    fontSize: 12,
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
    fontSize: 13,
    fontWeight: 700,
    color: theme.text,
  },

  stateText: {
    margin: "6px 0 0",
    fontSize: 12,
    color: theme.muted,
    lineHeight: 1.6,
  },
};

export default EditQuestion;