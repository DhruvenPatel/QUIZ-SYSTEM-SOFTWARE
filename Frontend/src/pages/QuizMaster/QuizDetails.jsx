import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  PlusCircle,
  Trash2,
  Pencil,
  ArrowLeft,
  CalendarClock,
  BadgeCheck,
  Hash,
  ListChecks,
  User,
  FileText,
  Clock3,
  X,
  TimerReset,
  CheckCircle2,
  ListTodo,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const theme = {
  primary: "#2563eb",
  primarySoft: "rgba(37, 99, 235, 0.08)",
  success: "#15803d",
  warning: "#b45309",
  danger: "#dc2626",
  surface: "#ffffff",
  surfaceSoft: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  shadowSm: "0 4px 14px rgba(15, 23, 42, 0.05)",
  shadowLg: "0 18px 40px rgba(15, 23, 42, 0.14)",
};

const DEFAULT_OPTIONS = ["", "", "", ""];
const OPTION_LABELS = ["A", "B", "C", "D"];

const getStatusStyles = (status) => {
  const normalized = (status || "").toLowerCase();

  if (normalized === "live") {
    return {
      color: theme.success,
      background: "rgba(21, 128, 61, 0.10)",
      border: "1px solid rgba(21, 128, 61, 0.18)",
      label: "Live",
    };
  }

  if (normalized === "published") {
    return {
      color: theme.primary,
      background: theme.primarySoft,
      border: "1px solid rgba(37, 99, 235, 0.16)",
      label: "Published",
    };
  }

  if (normalized === "completed") {
    return {
      color: theme.muted,
      background: "rgba(100, 116, 139, 0.10)",
      border: "1px solid rgba(100, 116, 139, 0.16)",
      label: "Completed",
    };
  }

  return {
    color: theme.warning,
    background: "rgba(180, 83, 9, 0.10)",
    border: "1px solid rgba(180, 83, 9, 0.16)",
    label: "Draft",
  };
};

const formatDateTime = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
};

const formatQuestionType = (type) => {
  if (!type) return "Unknown";
  return type.replace("_", " ");
};

const getInitialQuestionForm = (order = 1) => ({
  questionText: "",
  questionType: "mcq",
  options: [...DEFAULT_OPTIONS],
  correctAnswer: "A",
  marks: 1,
  negativeMarks: 0,
  timeLimit: 30,
  order,
});

const QuizDetails = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerError, setDrawerError] = useState("");
  const [drawerSuccess, setDrawerSuccess] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState(getInitialQuestionForm(1));

  const fetchQuizDetails = async () => {
    try {
      const { data } = await api.get(`/quizzes/${quizId}`);
      setQuiz(data.quiz);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch quiz details");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get(`/questions/quiz/${quizId}`);
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch questions");
    } finally {
      setQuestionLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizDetails();
    fetchQuestions();
  }, [quizId]);

  const handleDeleteQuiz = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/quizzes/${quizId}`);
      toast.success("Quiz deleted successfully");
      navigate("/quizzes");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete quiz");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/questions/${questionId}`);
      setQuestions((prev) => prev.filter((item) => item._id !== questionId));
      toast.success("Question deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete question");
    }
  };

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [questions]);

  const statusStyles = getStatusStyles(quiz?.status);

  const openDrawer = () => {
    setDrawerError("");
    setDrawerSuccess("");
    setQuestionForm(getInitialQuestionForm(questions.length + 1));
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (addingQuestion) return;
    setIsDrawerOpen(false);
    setDrawerError("");
    setDrawerSuccess("");
  };

  const handleDrawerChange = (e) => {
    const { name, value } = e.target;

    setQuestionForm((prev) => ({
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

  const handleDrawerOptionChange = (index, value) => {
    const updatedOptions = [...questionForm.options];
    updatedOptions[index] = value;

    setQuestionForm((prev) => ({
      ...prev,
      options: updatedOptions,
    }));
  };

  const handleDrawerQuestionTypeChange = (e) => {
    const value = e.target.value;

    if (value === "true_false") {
      setQuestionForm((prev) => ({
        ...prev,
        questionType: value,
        options: ["True", "False"],
        correctAnswer: "True",
      }));
    } else if (value === "short_answer") {
      setQuestionForm((prev) => ({
        ...prev,
        questionType: value,
        options: [],
        correctAnswer: "",
      }));
    } else {
      setQuestionForm((prev) => ({
        ...prev,
        questionType: value,
        options: [...DEFAULT_OPTIONS],
        correctAnswer: "A",
      }));
    }
  };

  const validateDrawerForm = () => {
    if (!questionForm.questionText.trim()) {
      throw new Error("Please enter the question text.");
    }

    if (questionForm.questionType === "mcq") {
      const trimmedOptions = questionForm.options.map((item) => item.trim());

      if (trimmedOptions.length !== 4 || trimmedOptions.some((item) => !item)) {
        throw new Error("Please fill all 4 MCQ options.");
      }

      if (!OPTION_LABELS.includes(questionForm.correctAnswer)) {
        throw new Error("Please select a valid correct answer for MCQ.");
      }
    }

    if (questionForm.questionType === "true_false") {
      if (!["True", "False"].includes(questionForm.correctAnswer)) {
        throw new Error("Please select True or False as the correct answer.");
      }
    }

    if (questionForm.questionType === "short_answer") {
      if (!questionForm.correctAnswer.trim()) {
        throw new Error("Please enter the correct answer for short answer type.");
      }
    }

    if (
      questionForm.marks < 0 ||
      questionForm.negativeMarks < 0 ||
      questionForm.timeLimit < 0
    ) {
      throw new Error("Marks, negative marks, and time limit cannot be negative.");
    }

    if (questionForm.order < 1) {
      throw new Error("Question order must be at least 1.");
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setDrawerError("");
    setDrawerSuccess("");
    setAddingQuestion(true);

    try {
      validateDrawerForm();

      const payload = {
        quizId,
        questionText: questionForm.questionText,
        questionType: questionForm.questionType,
        options:
          questionForm.questionType === "short_answer"
            ? []
            : questionForm.options.map((item) => item.trim()),
        correctAnswer: questionForm.correctAnswer,
        marks: questionForm.marks,
        negativeMarks: questionForm.negativeMarks,
        timeLimit: questionForm.timeLimit,
        order: questionForm.order,
      };

      const { data } = await api.post("/questions", payload);

      const message = data.message || "Question added successfully";
      setDrawerSuccess(message);
      toast.success(message);

      await fetchQuestions();

      setQuestionForm(getInitialQuestionForm(questions.length + 2));

      setTimeout(() => {
        setIsDrawerOpen(false);
        setDrawerSuccess("");
      }, 500);
    } catch (err) {
      const message =
        err.message ||
        err.response?.data?.message ||
        "Failed to add question";
      setDrawerError(message);
      toast.error(message);
    } finally {
      setAddingQuestion(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.stateCard}>
        <p style={styles.stateTitle}>Loading quiz details...</p>
        <p style={styles.stateText}>
          Please wait while we fetch the quiz information.
        </p>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div style={styles.stateCard}>
        <p style={{ ...styles.stateTitle, color: theme.danger }}>
          Unable to load quiz
        </p>
        <p style={styles.stateText}>{error}</p>
        <div style={{ marginTop: 12 }}>
          <Link to="/quizzes" style={styles.secondaryAction}>
            <ArrowLeft size={16} />
            <span>Back to Quizzes</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <header style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.heroTopRow}>
            <p style={styles.eyebrow}>Quiz Details</p>
            <span
              style={{
                ...styles.statusBadge,
                color: statusStyles.color,
                background: statusStyles.background,
                border: statusStyles.border,
              }}
            >
              {statusStyles.label}
            </span>
          </div>

          <h1 style={styles.title}>{quiz?.title || "Untitled Quiz"}</h1>

          <p style={styles.subtitle}>
            {quiz?.description || "No description available for this quiz."}
          </p>

          <div style={styles.inlineMeta}>
            <div style={styles.inlineMetaItem}>
              <Hash size={14} />
              <span>{quiz?.quizCode || "-"}</span>
            </div>

            <div style={styles.inlineMetaItem}>
              <CalendarClock size={14} />
              <span>Start: {formatDateTime(quiz?.startTime)}</span>
            </div>

            <div style={styles.inlineMetaItem}>
              <Clock3 size={14} />
              <span>End: {formatDateTime(quiz?.endTime)}</span>
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <button type="button" style={styles.primaryAction} onClick={openDrawer}>
            <PlusCircle size={16} />
            <span>Add Question</span>
          </button>

          <Link to={`/quizzes/edit/${quizId}`} style={styles.secondaryAction}>
            <Pencil size={16} />
            <span>Edit Quiz</span>
          </Link>

          <Link to="/quizzes" style={styles.secondaryAction}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>

          <button
            type="button"
            onClick={handleDeleteQuiz}
            style={styles.dangerAction}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </header>

      <section style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricIconWrap}>
            <ListChecks size={16} />
          </div>
          <p style={styles.metricLabel}>Total Questions</p>
          <h3 style={styles.metricValue}>{questions.length}</h3>
          <p style={styles.metricText}>Questions currently linked to this quiz</p>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIconWrap}>
            <BadgeCheck size={16} />
          </div>
          <p style={styles.metricLabel}>Workflow Status</p>
          <h3 style={styles.metricValueSmall}>{statusStyles.label}</h3>
          <p style={styles.metricText}>Current quiz lifecycle stage</p>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIconWrap}>
            <Hash size={16} />
          </div>
          <p style={styles.metricLabel}>Quiz Code</p>
          <h3 style={styles.metricValueSmall}>{quiz?.quizCode || "-"}</h3>
          <p style={styles.metricText}>Primary identifier used in the system</p>
        </div>
      </section>

      <section style={styles.detailsGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Overview</h2>
            <p style={styles.panelText}>
              High-level information about this quiz and its configuration.
            </p>
          </div>

          <div style={styles.overviewList}>
            <div style={styles.overviewRow}>
              <div style={styles.overviewLabelWrap}>
                <FileText size={14} />
                <span style={styles.overviewLabel}>Description</span>
              </div>
              <span style={styles.overviewValue}>
                {quiz?.description || "No description available."}
              </span>
            </div>

            <div style={styles.overviewRow}>
              <div style={styles.overviewLabelWrap}>
                <CalendarClock size={14} />
                <span style={styles.overviewLabel}>Start Time</span>
              </div>
              <span style={styles.overviewValue}>
                {formatDateTime(quiz?.startTime)}
              </span>
            </div>

            <div style={styles.overviewRow}>
              <div style={styles.overviewLabelWrap}>
                <Clock3 size={14} />
                <span style={styles.overviewLabel}>End Time</span>
              </div>
              <span style={styles.overviewValue}>
                {formatDateTime(quiz?.endTime)}
              </span>
            </div>

            <div style={styles.overviewRow}>
              <div style={styles.overviewLabelWrap}>
                <User size={14} />
                <span style={styles.overviewLabel}>Created By</span>
              </div>
              <span style={styles.overviewValue}>
                {quiz?.createdBy?.name || "N/A"}
              </span>
            </div>

            {"createdAt" in (quiz || {}) && (
              <div style={styles.overviewRow}>
                <div style={styles.overviewLabelWrap}>
                  <CalendarClock size={14} />
                  <span style={styles.overviewLabel}>Created At</span>
                </div>
                <span style={styles.overviewValue}>
                  {formatDateTime(quiz?.createdAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Question Summary</h2>
            <p style={styles.panelText}>
              Quick view of what’s inside this quiz.
            </p>
          </div>

          <div style={styles.summaryStats}>
            <div style={styles.summaryStatCard}>
              <p style={styles.summaryStatLabel}>MCQ</p>
              <p style={styles.summaryStatValue}>
                {questions.filter((q) => q.questionType === "mcq").length}
              </p>
            </div>

            <div style={styles.summaryStatCard}>
              <p style={styles.summaryStatLabel}>True / False</p>
              <p style={styles.summaryStatValue}>
                {questions.filter((q) => q.questionType === "true_false").length}
              </p>
            </div>

            <div style={styles.summaryStatCard}>
              <p style={styles.summaryStatLabel}>Short Answer</p>
              <p style={styles.summaryStatValue}>
                {questions.filter((q) => q.questionType === "short_answer").length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.questionSection}>
        <div style={styles.questionSectionHeader}>
          <div>
            <h2 style={styles.questionHeading}>Questions</h2>
            <p style={styles.questionSubtext}>
              Review, edit, and manage all questions in this quiz.
            </p>
          </div>
        </div>

        {questionLoading ? (
          <div style={styles.stateCard}>
            <p style={styles.stateTitle}>Loading questions...</p>
            <p style={styles.stateText}>
              Fetching all questions for this quiz.
            </p>
          </div>
        ) : sortedQuestions.length === 0 ? (
          <div style={styles.stateCard}>
            <p style={styles.stateTitle}>No questions added yet</p>
            <p style={styles.stateText}>
              Start building this quiz by adding your first question.
            </p>
            <div style={{ marginTop: 12 }}>
              <button type="button" style={styles.primaryAction} onClick={openDrawer}>
                <PlusCircle size={16} />
                <span>Add Question</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.questionList}>
            {sortedQuestions.map((question, index) => (
              <div key={question._id} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <div style={styles.questionHeaderLeft}>
                    <div style={styles.questionNumber}>Q{index + 1}</div>
                    <div>
                      <h3 style={styles.questionTitle}>
                        {question.questionText}
                      </h3>
                      <p style={styles.questionTypeText}>
                        {formatQuestionType(question.questionType)}
                      </p>
                    </div>
                  </div>

                  <span style={styles.questionBadge}>
                    {formatQuestionType(question.questionType)}
                  </span>
                </div>

                {question.questionType !== "short_answer" && (
                  <div style={styles.options}>
                    {question.options.map((option, idx) => (
                      <div key={idx} style={styles.option}>
                        {question.questionType === "mcq"
                          ? `Option ${["A", "B", "C", "D"][idx] || idx + 1}: ${option}`
                          : option}
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.metaGrid}>
                  <div style={styles.metaCard}>
                    <p style={styles.metaLabel}>Correct Answer</p>
                    <p style={styles.metaValue}>
                      {question.correctAnswer || "-"}
                    </p>
                  </div>

                  <div style={styles.metaCard}>
                    <p style={styles.metaLabel}>Marks</p>
                    <p style={styles.metaValue}>{question.marks}</p>
                  </div>

                  <div style={styles.metaCard}>
                    <p style={styles.metaLabel}>Negative Marks</p>
                    <p style={styles.metaValue}>{question.negativeMarks}</p>
                  </div>

                  <div style={styles.metaCard}>
                    <p style={styles.metaLabel}>Time Limit</p>
                    <p style={styles.metaValue}>{question.timeLimit}s</p>
                  </div>

                  <div style={styles.metaCard}>
                    <p style={styles.metaLabel}>Order</p>
                    <p style={styles.metaValue}>{question.order}</p>
                  </div>
                </div>

                <div style={styles.questionActions}>
                  <Link
                    to={`/questions/edit/${question._id}`}
                    style={styles.cardSecondaryButton}
                  >
                    <Pencil size={15} />
                    <span>Edit Question</span>
                  </Link>

                  <button
                    type="button"
                    style={styles.cardDangerButton}
                    onClick={() => handleDeleteQuestion(question._id)}
                  >
                    <Trash2 size={15} />
                    <span>Delete Question</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isDrawerOpen && (
        <div style={styles.drawerOverlay} onClick={closeDrawer}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerEyebrow}>Add Question</p>
                <h3 style={styles.drawerTitle}>Create question</h3>
                <p style={styles.drawerText}>
                  This question will be added directly to{" "}
                  <strong>{quiz?.title || "this quiz"}</strong>.
                </p>
              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={closeDrawer}
              >
                <X size={16} />
              </button>
            </div>

            {drawerError && (
              <div style={styles.errorBanner}>
                <p style={styles.bannerTitle}>Something went wrong</p>
                <p style={styles.bannerText}>{drawerError}</p>
              </div>
            )}

            {drawerSuccess && (
              <div style={styles.successBanner}>
                <p style={styles.bannerTitle}>Question added successfully</p>
                <p style={styles.bannerText}>{drawerSuccess}</p>
              </div>
            )}

            <form onSubmit={handleAddQuestion} style={styles.drawerForm}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Question Text</label>
                <textarea
                  name="questionText"
                  placeholder="Enter question text"
                  value={questionForm.questionText}
                  onChange={handleDrawerChange}
                  style={styles.textarea}
                  required
                />
              </div>

              <div style={styles.twoCol}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Question Type</label>
                  <select
                    name="questionType"
                    value={questionForm.questionType}
                    onChange={handleDrawerQuestionTypeChange}
                    style={styles.inputPlain}
                  >
                    <option value="mcq">MCQ</option>
                    <option value="true_false">True / False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Correct Answer</label>

                  {questionForm.questionType === "mcq" ? (
                    <select
                      name="correctAnswer"
                      value={questionForm.correctAnswer}
                      onChange={handleDrawerChange}
                      style={styles.inputPlain}
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  ) : questionForm.questionType === "true_false" ? (
                    <select
                      name="correctAnswer"
                      value={questionForm.correctAnswer}
                      onChange={handleDrawerChange}
                      style={styles.inputPlain}
                    >
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  ) : (
                    <div style={styles.inputWrap}>
                      <CheckCircle2 size={15} style={styles.inputIcon} />
                      <input
                        type="text"
                        name="correctAnswer"
                        placeholder="Enter correct answer"
                        value={questionForm.correctAnswer}
                        onChange={handleDrawerChange}
                        style={styles.input}
                        required
                      />
                    </div>
                  )}

                  <p style={styles.helperText}>
                    {questionForm.questionType === "mcq"
                      ? "Select the correct option label."
                      : questionForm.questionType === "true_false"
                      ? "Select True or False."
                      : "Enter the expected answer text."}
                  </p>
                </div>
              </div>

              {questionForm.questionType !== "short_answer" && (
                <div style={styles.optionSection}>
                  <div style={styles.optionHeader}>
                    <p style={styles.optionTitle}>Answer Options</p>
                    <p style={styles.optionText}>
                      Add the choices shown to participants.
                    </p>
                  </div>

                  <div style={styles.twoCol}>
                    {questionForm.options.map((option, index) => {
                      const optionLabel = OPTION_LABELS[index] || `${index + 1}`;

                      return (
                        <div key={index} style={styles.fieldGroup}>
                          <label style={styles.label}>Option {optionLabel}</label>
                          <div style={styles.inputWrap}>
                            <ListTodo size={15} style={styles.inputIcon} />
                            <input
                              type="text"
                              placeholder={`Option ${optionLabel}`}
                              value={option}
                              onChange={(e) =>
                                handleDrawerOptionChange(index, e.target.value)
                              }
                              style={styles.input}
                              disabled={questionForm.questionType === "true_false"}
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
                    <Hash size={15} style={styles.inputIcon} />
                    <input
                      type="number"
                      name="marks"
                      placeholder="Marks"
                      value={questionForm.marks}
                      onChange={handleDrawerChange}
                      style={styles.input}
                      min="0"
                    />
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Negative Marks</label>
                  <div style={styles.inputWrap}>
                    <Hash size={15} style={styles.inputIcon} />
                    <input
                      type="number"
                      name="negativeMarks"
                      placeholder="Negative marks"
                      value={questionForm.negativeMarks}
                      onChange={handleDrawerChange}
                      style={styles.input}
                      min="0"
                    />
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Time Limit</label>
                  <div style={styles.inputWrap}>
                    <TimerReset size={15} style={styles.inputIcon} />
                    <input
                      type="number"
                      name="timeLimit"
                      placeholder="Time limit in seconds"
                      value={questionForm.timeLimit}
                      onChange={handleDrawerChange}
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
                    <Hash size={15} style={styles.inputIcon} />
                    <input
                      type="number"
                      name="order"
                      placeholder="Question order"
                      value={questionForm.order}
                      onChange={handleDrawerChange}
                      style={styles.input}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div style={styles.drawerFooter}>
                <button
                  type="button"
                  style={styles.ghostButton}
                  onClick={closeDrawer}
                  disabled={addingQuestion}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.primaryDrawerButton}
                  disabled={addingQuestion}
                >
                  {addingQuestion ? "Adding..." : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  hero: {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 18,
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    boxShadow: theme.shadowSm,
  },

  heroLeft: {
    minWidth: 0,
    flex: "1 1 620px",
  },

  heroTopRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  eyebrow: {
    margin: 0,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: theme.primary,
    fontWeight: 700,
  },

  title: {
    margin: "8px 0 0",
    fontSize: 26,
    lineHeight: 1.15,
    color: theme.text,
    fontWeight: 700,
  },

  subtitle: {
    margin: "8px 0 0",
    color: theme.muted,
    fontSize: 13,
    lineHeight: 1.65,
    maxWidth: 720,
  },

  inlineMeta: {
    marginTop: 12,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  inlineMetaItem: {
    minHeight: 30,
    padding: "0 10px",
    borderRadius: 999,
    background: theme.surfaceSoft,
    border: `1px solid ${theme.border}`,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: theme.muted,
    fontWeight: 600,
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  primaryAction: {
    minHeight: 34,
    padding: "0 12px",
    borderRadius: 10,
    background: theme.primary,
    color: "#fff",
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "none",
    cursor: "pointer",
  },

  secondaryAction: {
    minHeight: 34,
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
  },

  dangerAction: {
    minHeight: 34,
    padding: "0 12px",
    borderRadius: 10,
    border: "none",
    background: theme.danger,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },

  metricsGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
  },

  metricCard: {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    padding: 16,
    boxShadow: theme.shadowSm,
  },

  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: theme.primarySoft,
    color: theme.primary,
    marginBottom: 12,
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
    margin: "8px 0 0",
    fontSize: 24,
    lineHeight: 1,
    color: theme.text,
    fontWeight: 700,
  },

  metricValueSmall: {
    margin: "8px 0 0",
    fontSize: 18,
    lineHeight: 1.2,
    color: theme.text,
    fontWeight: 700,
    wordBreak: "break-word",
  },

  metricText: {
    margin: "6px 0 0",
    fontSize: 12,
    lineHeight: 1.5,
    color: theme.muted,
  },

  detailsGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 16,
    alignItems: "start",
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
    fontSize: 18,
    lineHeight: 1.2,
    color: theme.text,
    fontWeight: 700,
  },

  panelText: {
    margin: "6px 0 0",
    fontSize: 12,
    lineHeight: 1.6,
    color: theme.muted,
  },

  overviewList: {
    display: "grid",
    gap: 12,
  },

  overviewRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingBottom: 12,
    borderBottom: `1px solid ${theme.border}`,
  },

  overviewLabelWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    color: theme.muted,
    minWidth: 120,
  },

  overviewLabel: {
    fontSize: 12,
    fontWeight: 600,
  },

  overviewValue: {
    fontSize: 12,
    color: theme.text,
    fontWeight: 600,
    textAlign: "right",
    lineHeight: 1.6,
    wordBreak: "break-word",
    maxWidth: "70%",
  },

  summaryStats: {
    display: "grid",
    gap: 10,
  },

  summaryStatCard: {
    padding: 12,
    borderRadius: 12,
    background: theme.surfaceSoft,
    border: `1px solid ${theme.border}`,
  },

  summaryStatLabel: {
    margin: 0,
    fontSize: 11,
    color: theme.muted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
  },

  summaryStatValue: {
    margin: "6px 0 0",
    fontSize: 20,
    color: theme.text,
    fontWeight: 700,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    minHeight: 26,
    padding: "0 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },

  questionSection: {
    marginTop: 16,
  },

  questionSectionHeader: {
    marginBottom: 14,
  },

  questionHeading: {
    margin: 0,
    fontSize: 18,
    color: theme.text,
    fontWeight: 700,
  },

  questionSubtext: {
    margin: "6px 0 0",
    fontSize: 12,
    color: theme.muted,
    lineHeight: 1.6,
  },

  stateCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadowSm,
  },

  stateTitle: {
    margin: 0,
    color: theme.text,
    fontSize: 13,
    fontWeight: 700,
  },

  stateText: {
    margin: "6px 0 0",
    color: theme.muted,
    fontSize: 12,
    lineHeight: 1.6,
  },

  questionList: {
    display: "grid",
    gap: 14,
  },

  questionCard: {
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    padding: 16,
    background: theme.surface,
    boxShadow: theme.shadowSm,
    display: "grid",
    gap: 14,
  },

  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },

  questionHeaderLeft: {
    display: "flex",
    gap: 12,
    minWidth: 0,
    flex: 1,
  },

  questionNumber: {
    minWidth: 32,
    height: 32,
    borderRadius: 10,
    background: theme.primarySoft,
    color: theme.primary,
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },

  questionTitle: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.45,
    color: theme.text,
    fontWeight: 700,
  },

  questionTypeText: {
    margin: "4px 0 0",
    fontSize: 12,
    color: theme.muted,
    textTransform: "capitalize",
  },

  questionBadge: {
    background: theme.primarySoft,
    color: theme.primary,
    border: "1px solid rgba(37, 99, 235, 0.14)",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    textTransform: "capitalize",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  options: {
    display: "grid",
    gap: 8,
  },

  option: {
    padding: "10px 12px",
    borderRadius: 10,
    background: theme.surfaceSoft,
    border: `1px solid ${theme.border}`,
    color: theme.text,
    fontSize: 12,
    fontWeight: 600,
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 10,
  },

  metaCard: {
    padding: 12,
    borderRadius: 12,
    background: theme.surfaceSoft,
    border: `1px solid ${theme.border}`,
  },

  metaLabel: {
    margin: 0,
    fontSize: 11,
    color: theme.muted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
  },

  metaValue: {
    margin: "6px 0 0",
    fontSize: 12,
    color: theme.text,
    fontWeight: 700,
    wordBreak: "break-word",
  },

  questionActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  cardSecondaryButton: {
    minHeight: 34,
    padding: "0 12px",
    borderRadius: 10,
    background: theme.surface,
    color: theme.text,
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: `1px solid ${theme.border}`,
  },

  cardDangerButton: {
    minHeight: 34,
    padding: "0 12px",
    borderRadius: 10,
    border: "none",
    background: theme.danger,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    cursor: "pointer",
  },

  drawerOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.4)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "flex-end",
  },

  drawer: {
    width: "min(560px, 100%)",
    height: "100vh",
    background: theme.surface,
    borderLeft: `1px solid ${theme.border}`,
    boxShadow: theme.shadowLg,
    padding: 20,
    overflowY: "auto",
  },

  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },

  drawerEyebrow: {
    margin: 0,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: theme.primary,
    fontWeight: 700,
  },

  drawerTitle: {
    margin: "6px 0 0",
    fontSize: 22,
    lineHeight: 1.2,
    color: theme.text,
    fontWeight: 700,
  },

  drawerText: {
    margin: "8px 0 0",
    color: theme.muted,
    fontSize: 12,
    lineHeight: 1.6,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    color: theme.text,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  drawerForm: {
    display: "grid",
    gap: 14,
  },

  fieldGroup: {
    display: "grid",
    gap: 6,
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
    outline: "none",
    color: theme.text,
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

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },

  threeCol: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
  },

  twoColSingle: {
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

  drawerFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },

  ghostButton: {
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

  primaryDrawerButton: {
    minHeight: 34,
    padding: "0 14px",
    border: "none",
    borderRadius: 10,
    background: theme.primary,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
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
};

export default QuizDetails;