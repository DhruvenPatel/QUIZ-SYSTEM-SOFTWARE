import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ListChecks,
  ClipboardList,
  TimerReset,
  Hash,
  CheckCircle2,
  ListTodo,
  ArrowRight,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const theme = {
  primary: "#2563eb",
  primarySoft: "rgba(37, 99, 235, 0.08)",
  secondary: "#0f766e",
  secondarySoft: "rgba(15, 118, 110, 0.08)",
  surface: "#ffffff",
  surfaceSoft: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  shadowSm: "0 4px 14px rgba(15, 23, 42, 0.05)",
};

const DEFAULT_OPTIONS = ["", "", "", ""];
const OPTION_LABELS = ["A", "B", "C", "D"];

const AddQuestion = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [formData, setFormData] = useState({
    quizId: "",
    questionText: "",
    questionType: "mcq",
    options: DEFAULT_OPTIONS,
    correctAnswer: "A",
    marks: 1,
    negativeMarks: 0,
    timeLimit: 30,
    order: 1,
  });

  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await api.get("/quizzes");
        setQuizzes(data.quizzes || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch quizzes");
      } finally {
        setQuizLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "marks" ||
        name === "negativeMarks" ||
        name === "timeLimit" ||
        name === "order"
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
        options: [...DEFAULT_OPTIONS],
        correctAnswer: "A",
      }));
    }
  };

  const validateForm = () => {
    if (!formData.quizId) {
      throw new Error("Please select a quiz.");
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      validateForm();

      const payload = {
        ...formData,
        options:
          formData.questionType === "short_answer"
            ? []
            : formData.options.map((item) => item.trim()),
      };

      const { data } = await api.post("/questions", payload);

      const message = data.message || "Question added successfully";
      setSuccess(message);
      toast.success(message);

      setFormData((prev) => ({
        ...prev,
        questionText: "",
        questionType: "mcq",
        options: [...DEFAULT_OPTIONS],
        correctAnswer: "A",
        marks: 1,
        negativeMarks: 0,
        timeLimit: 30,
        order: prev.order + 1,
      }));
    } catch (err) {
      const message =
        err.message || err.response?.data?.message || "Failed to add question";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <p style={styles.headerEyebrow}>Question Management</p>
          <h1 style={styles.headerTitle}>Add a new question</h1>
          <p style={styles.headerText}>
            Create well-structured questions with answer logic, marks, timing,
            and quiz mapping in one place.
          </p>
        </div>

        <div style={styles.headerActions}>
          <Link to="/quizzes" style={styles.secondaryButton}>
            <ListChecks size={16} />
            <span>View Quizzes</span>
          </Link>

          <Link to="/create-quiz" style={styles.textButton}>
            <span>Create Quiz</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <section style={styles.contentGrid}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <div style={styles.heroBadge}>
              <span>Question Builder</span>
            </div>

            <h2 style={styles.formTitle}>Question details</h2>
            <p style={styles.formText}>
              Add question content, define type, configure answers, and set
              scoring rules clearly for participants.
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
              <p style={styles.bannerTitle}>Question added successfully</p>
              <p style={styles.bannerText}>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Select Quiz</label>
              <div style={styles.inputWrap}>
                <ClipboardList size={16} style={styles.inputIcon} />
                <select
                  name="quizId"
                  value={formData.quizId}
                  onChange={handleChange}
                  style={styles.input}
                  disabled={quizLoading}
                  required
                >
                  <option value="">
                    {quizLoading ? "Loading quizzes..." : "Select a quiz"}
                  </option>
                  {quizzes.map((quiz) => (
                    <option key={quiz._id} value={quiz._id}>
                      {quiz.title} ({quiz.quizCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Question Text</label>
              <textarea
                name="questionText"
                placeholder="Enter question text"
                value={formData.questionText}
                onChange={handleChange}
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.twoCol}>
              <div style={styles.fieldGroup}>
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
              </div>

              <div style={styles.fieldGroup}>
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
                    <CheckCircle2 size={16} style={styles.inputIcon} />
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
                    ? ""
                    : formData.questionType === "true_false"
                    ? ""
                    : ""}
                </p>
              </div>
            </div>

            {formData.questionType !== "short_answer" && (
              <div style={styles.optionSection}>
                <div style={styles.optionHeader}>
                  <p style={styles.optionTitle}>Answer Options</p>
                  <p style={styles.optionText}>
                    Add the available answer choices for this question.
                  </p>
                </div>

                <div style={styles.twoCol}>
                  {formData.options.map((option, index) => {
                    const optionLabel = OPTION_LABELS[index] || `${index + 1}`;

                    return (
                      <div key={index} style={styles.fieldGroup}>
                        <label style={styles.label}>Option {optionLabel}</label>
                        <div style={styles.inputWrap}>
                          <ListTodo size={16} style={styles.inputIcon} />
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

            <div style={styles.threeCol}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Marks</label>
                <div style={styles.inputWrap}>
                  <Hash size={16} style={styles.inputIcon} />
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

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Negative Marks</label>
                <div style={styles.inputWrap}>
                  <Hash size={16} style={styles.inputIcon} />
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

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Time Limit</label>
                <div style={styles.inputWrap}>
                  <TimerReset size={16} style={styles.inputIcon} />
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

            <div style={styles.twoColSingle}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Question Order</label>
                <div style={styles.inputWrap}>
                  <Hash size={16} style={styles.inputIcon} />
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
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="button"
                style={styles.ghostButton}
                onClick={() => navigate("/quizzes")}
              >
                Back to Quizzes
              </button>

              <button
                type="submit"
                style={styles.primaryActionButton}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Question"}
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
    boxShadow: theme.shadowSm,
    flexWrap: "wrap",
  },

  headerContent: {
    minWidth: 0,
    flex: "1 1 520px",
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
    fontSize: 24,
    lineHeight: 1.2,
    color: theme.text,
    fontWeight: 700,
  },

  headerText: {
    margin: "6px 0 0",
    fontSize: 13,
    lineHeight: 1.6,
    color: theme.muted,
    maxWidth: 600,
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  secondaryButton: {
    minHeight: 36,
    padding: "0 12px",
    borderRadius: 10,
    background: theme.surface,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },

  textButton: {
    minHeight: 36,
    padding: "0 8px",
    color: theme.primary,
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
    alignItems: "start",
  },

  formCard: {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 18,
    padding: 20,
    boxShadow: theme.shadowSm,
    minWidth: 0,
  },

  formHeader: {
    marginBottom: 16,
  },

  heroBadge: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: theme.secondarySoft,
    color: theme.secondary,
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 12,
  },

  formTitle: {
    margin: 0,
    fontSize: 18,
    color: theme.text,
    fontWeight: 700,
  },

  formText: {
    margin: "6px 0 0",
    fontSize: 13,
    color: theme.muted,
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

  fieldGroup: {
    display: "grid",
    gap: 6,
    minWidth: 0,
  },

  label: {
    fontSize: 12,
    color: theme.text,
    fontWeight: 600,
  },

  helperText: {
    margin: 0,
    fontSize: 11,
    color: theme.muted,
    lineHeight: 1.5,
  },

  inputWrap: {
    position: "relative",
    minWidth: 0,
  },

  inputIcon: {
    position: "absolute",
    left: 12,
    top: 11,
    color: theme.muted,
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    height: 38,
    padding: "0 12px 0 36px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    fontSize: 12,
    background: theme.surfaceSoft,
    boxSizing: "border-box",
    minWidth: 0,
    outline: "none",
    color: theme.text,
  },

  inputPlain: {
    width: "100%",
    height: 38,
    padding: "0 12px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    fontSize: 12,
    background: theme.surfaceSoft,
    boxSizing: "border-box",
    minWidth: 0,
    outline: "none",
    color: theme.text,
  },

  textarea: {
    width: "100%",
    minHeight: 90,
    padding: 10,
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    fontSize: 12,
    background: theme.surfaceSoft,
    boxSizing: "border-box",
    resize: "vertical",
    minWidth: 0,
    outline: "none",
    lineHeight: 1.6,
    color: theme.text,
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },

  threeCol: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },

  twoColSingle: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },

  optionSection: {
    padding: 14,
    borderRadius: 12,
    background: theme.surfaceSoft,
    border: `1px solid ${theme.border}`,
    minWidth: 0,
  },

  optionHeader: {
    marginBottom: 12,
  },

  optionTitle: {
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    color: theme.text,
  },

  optionText: {
    margin: "4px 0 0",
    fontSize: 12,
    color: theme.muted,
    lineHeight: 1.5,
  },

  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 6,
    flexWrap: "wrap",
  },

  ghostButton: {
    height: 34,
    padding: "0 12px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    fontSize: 12,
    fontWeight: 600,
    background: "#fff",
    cursor: "pointer",
    color: theme.text,
  },

  primaryActionButton: {
    height: 34,
    padding: "0 12px",
    borderRadius: 10,
    border: "none",
    fontSize: 12,
    fontWeight: 600,
    background: theme.primary,
    color: "#fff",
    cursor: "pointer",
  },
};

export default AddQuestion;