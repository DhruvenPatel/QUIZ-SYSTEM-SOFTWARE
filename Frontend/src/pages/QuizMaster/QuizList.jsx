import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  CircleHelp,
  ClipboardList,
  BadgeCheck,
  Clock3,
  LayoutGrid,
  Table2,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const theme = {
  primary: "#1f4fd6",
  primarySoft: "rgba(31, 79, 214, 0.08)",
  success: "#15803d",
  warning: "#b45309",
  danger: "#dc2626",
  surface: "#ffffff",
  surfaceSoft: "#f8fafc",
  text: "#18212f",
  muted: "#5f6b7a",
  border: "#dde5ef",
  shadowSm: "0 8px 24px rgba(15, 23, 42, 0.08)",
};

const STATUS_OPTIONS = ["draft", "published", "live", "completed"];

const getStatusStyles = (status) => {
  const s = (status || "").toLowerCase();

  if (s === "live") {
    return {
      label: "Live",
      color: theme.success,
      bg: "rgba(21, 128, 61, 0.08)",
      border: "1px solid rgba(21, 128, 61, 0.14)",
    };
  }

  if (s === "published") {
    return {
      label: "Published",
      color: theme.primary,
      bg: theme.primarySoft,
      border: "1px solid rgba(31, 79, 214, 0.14)",
    };
  }

  if (s === "completed") {
    return {
      label: "Completed",
      color: "#64748b",
      bg: "rgba(100, 116, 139, 0.08)",
      border: "1px solid rgba(100, 116, 139, 0.14)",
    };
  }

  return {
    label: "Draft",
    color: theme.warning,
    bg: "rgba(180, 83, 9, 0.08)",
    border: "1px solid rgba(180, 83, 9, 0.14)",
  };
};

const formatStatusLabel = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const menuRef = useRef(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/quizzes");
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    const handleScroll = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [openMenuId]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/quizzes/${id}`, { status });

      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz._id === id
            ? {
                ...quiz,
                status,
              }
            : quiz
        )
      );

      toast.success(`Status changed to ${formatStatusLabel(status)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleMenuToggle = (event, quizId) => {
    if (openMenuId === quizId) {
      setOpenMenuId(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const dropdownWidth = 190;
    const dropdownOffset = 6;

    let left = rect.right - dropdownWidth;
    if (left < 12) left = 12;

    const top = rect.bottom + dropdownOffset;

    setMenuPosition({ top, left });
    setOpenMenuId(quizId);
  };

  const stats = useMemo(() => {
    const publishedLive = quizzes.filter((q) =>
      ["published", "live"].includes((q.status || "").toLowerCase())
    ).length;

    const drafts = quizzes.filter(
      (q) => (q.status || "").toLowerCase() === "draft"
    ).length;

    return {
      total: quizzes.length,
      publishedLive,
      drafts,
    };
  }, [quizzes]);

  const renderFloatingMenu = (quiz) => {
    if (!quiz || openMenuId !== quiz._id) return null;

    return (
      <div
        ref={menuRef}
        style={{
          ...styles.dropdownFixed,
          top: menuPosition.top,
          left: menuPosition.left,
        }}
      >
        <Link
          to={`/quizzes/${quiz._id}`}
          style={styles.dropdownItemLink}
          onClick={() => setOpenMenuId(null)}
        >
          View
        </Link>

        <div style={styles.divider} />

        <p style={styles.dropdownLabel}>Change Status</p>

        {STATUS_OPTIONS.map((statusOption) => (
          <button
            key={statusOption}
            type="button"
            style={{
              ...styles.dropdownItemButton,
              ...((quiz.status || "").toLowerCase() === statusOption
                ? styles.dropdownItemActive
                : {}),
            }}
            onClick={() => {
              updateStatus(quiz._id, statusOption);
              setOpenMenuId(null);
            }}
          >
            {formatStatusLabel(statusOption)}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Quiz Directory</p>
          <h1 style={styles.title}>Quizzes</h1>
          <p style={styles.subtitle}>
            View, manage, and continue working on all quizzes from one place.
          </p>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.viewToggle}>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              style={{
                ...styles.toggleBtn,
                ...(viewMode === "table" ? styles.toggleBtnActive : {}),
              }}
            >
              <Table2 size={15} />
              <span>Table</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("card")}
              style={{
                ...styles.toggleBtn,
                ...(viewMode === "card" ? styles.toggleBtnActive : {}),
              }}
            >
              <LayoutGrid size={15} />
              <span>Cards</span>
            </button>
          </div>

          <Link to="/create-quiz" style={styles.primaryBtn}>
            <PlusCircle size={16} />
            <span>Create Quiz</span>
          </Link>

          <Link to="/add-question" style={styles.secondaryBtn}>
            <CircleHelp size={16} />
            <span>Add Question</span>
          </Link>
        </div>
      </header>

      <section style={styles.metrics}>
        <div style={styles.metricCard}>
          <ClipboardList size={16} />
          <div>
            <p style={styles.metricLabel}>Total Quizzes</p>
            <h3 style={styles.metricValue}>{stats.total}</h3>
          </div>
        </div>

        <div style={styles.metricCard}>
          <BadgeCheck size={16} />
          <div>
            <p style={styles.metricLabel}>Published / Live</p>
            <h3 style={styles.metricValue}>{stats.publishedLive}</h3>
          </div>
        </div>

        <div style={styles.metricCard}>
          <Clock3 size={16} />
          <div>
            <p style={styles.metricLabel}>Drafts</p>
            <h3 style={styles.metricValue}>{stats.drafts}</h3>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHead}>
          <h2 style={styles.sectionTitle}>All quizzes</h2>
          <p style={styles.sectionText}>
            Switch between a dense table view and a visual card view.
          </p>
        </div>

        {loading && (
          <div style={styles.stateBox}>
            <p style={styles.stateTitle}>Loading quizzes...</p>
            <p style={styles.stateText}>Fetching the latest records.</p>
          </div>
        )}

        {!loading && error && (
          <div style={styles.stateBox}>
            <p style={{ ...styles.stateTitle, color: theme.danger }}>
              Something went wrong
            </p>
            <p style={styles.stateText}>{error}</p>
          </div>
        )}

        {!loading && !error && quizzes.length === 0 && (
          <div style={styles.stateBox}>
            <p style={styles.stateTitle}>No quizzes found</p>
            <p style={styles.stateText}>
              Create your first quiz to get started.
            </p>
          </div>
        )}

        {!loading && !error && quizzes.length > 0 && viewMode === "table" && (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Description</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => {
                  const status = getStatusStyles(quiz.status);

                  return (
                    <tr key={quiz._id}>
                      <td style={styles.tdStrong}>
                        {quiz.title || "Untitled Quiz"}
                      </td>
                      <td style={styles.td}>{quiz.quizCode || "-"}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            color: status.color,
                            background: status.bg,
                            border: status.border,
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td style={styles.tdMuted}>
                        {quiz.description || "No description available."}
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={styles.tableActionCell}>
                          <button
                            type="button"
                            style={styles.menuBtn}
                            onClick={(event) =>
                              handleMenuToggle(event, quiz._id)
                            }
                          >
                            ⋯
                          </button>
                        </div>
                        {renderFloatingMenu(quiz)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && quizzes.length > 0 && viewMode === "card" && (
          <div style={styles.cardGrid}>
            {quizzes.map((quiz) => {
              const status = getStatusStyles(quiz.status);

              return (
                <div key={quiz._id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        color: status.color,
                        background: status.bg,
                        border: status.border,
                      }}
                    >
                      {status.label}
                    </span>

                    <button
                      type="button"
                      style={styles.menuBtn}
                      onClick={(event) => handleMenuToggle(event, quiz._id)}
                    >
                      ⋯
                    </button>

                    {renderFloatingMenu(quiz)}
                  </div>

                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>
                      {quiz.title || "Untitled Quiz"}
                    </h3>
                    <p style={styles.cardDesc}>
                      {quiz.description || "No description available."}
                    </p>

                    <div style={styles.metaBox}>
                      <div style={styles.metaRow}>
                        <span style={styles.metaKey}>Quiz Code</span>
                        <span style={styles.metaVal}>{quiz.quizCode || "-"}</span>
                      </div>
                      <div style={styles.metaRow}>
                        <span style={styles.metaKey}>Status</span>
                        <span style={styles.metaVal}>{status.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    padding: 20,
    background: theme.surface,
    borderRadius: 16,
    border: `1px solid ${theme.border}`,
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
    fontSize: 14,
    lineHeight: 1.6,
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  viewToggle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: 4,
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    background: theme.surface,
  },

  toggleBtn: {
    height: 34,
    padding: "0 10px",
    border: "none",
    borderRadius: 8,
    background: "transparent",
    color: theme.muted,
    fontSize: 13,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },

  toggleBtnActive: {
    background: theme.primarySoft,
    color: theme.primary,
  },

  primaryBtn: {
    height: 36,
    padding: "0 12px",
    borderRadius: 10,
    background: theme.primary,
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 600,
  },

  secondaryBtn: {
    height: 36,
    padding: "0 12px",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    color: theme.text,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 600,
  },

  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
    marginTop: 18,
  },

  metricCard: {
    padding: 16,
    border: `1px solid ${theme.border}`,
    borderRadius: 14,
    background: theme.surface,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  metricLabel: {
    margin: 0,
    fontSize: 12,
    color: theme.muted,
    fontWeight: 600,
  },

  metricValue: {
    margin: "4px 0 0",
    fontSize: 20,
    color: theme.text,
    fontWeight: 700,
  },

  section: {
    marginTop: 18,
    padding: 18,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
  },

  sectionHead: {
    marginBottom: 14,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: theme.text,
  },

  sectionText: {
    margin: "6px 0 0",
    fontSize: 13,
    color: theme.muted,
  },

  stateBox: {
    padding: 16,
    borderRadius: 12,
    background: theme.surfaceSoft,
    border: `1px solid ${theme.border}`,
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
  },

  tableWrap: {
    overflowX: "auto",
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    position: "relative",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: theme.surface,
  },

  th: {
    textAlign: "left",
    padding: "12px 14px",
    fontSize: 12,
    fontWeight: 700,
    color: theme.muted,
    background: theme.surfaceSoft,
    borderBottom: `1px solid ${theme.border}`,
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px",
    fontSize: 13,
    color: theme.text,
    borderBottom: `1px solid ${theme.border}`,
    verticalAlign: "top",
  },

  tdStrong: {
    padding: "14px",
    fontSize: 13,
    color: theme.text,
    fontWeight: 700,
    borderBottom: `1px solid ${theme.border}`,
    verticalAlign: "top",
  },

  tdMuted: {
    padding: "14px",
    fontSize: 13,
    color: theme.muted,
    borderBottom: `1px solid ${theme.border}`,
    verticalAlign: "top",
    maxWidth: 320,
  },

  tableActionCell: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 14,
  },

  card: {
    padding: 16,
    border: `1px solid ${theme.border}`,
    borderRadius: 14,
    background: theme.surface,
    display: "grid",
    gap: 14,
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },

  cardBody: {
    display: "grid",
    gap: 10,
  },

  cardTitle: {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.3,
    color: theme.text,
    fontWeight: 700,
  },

  cardDesc: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.6,
    color: theme.muted,
  },

  metaBox: {
    padding: 12,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    background: theme.surfaceSoft,
    display: "grid",
    gap: 8,
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },

  metaKey: {
    fontSize: 12,
    color: theme.muted,
    fontWeight: 600,
  },

  metaVal: {
    fontSize: 12,
    color: theme.text,
    fontWeight: 700,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
    padding: "0 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.02em",
  },

  menuBtn: {
    width: 30,
    height: 30,
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    color: theme.text,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 18,
    lineHeight: 1,
    display: "grid",
    placeItems: "center",
    padding: 0,
    flexShrink: 0,
  },

  dropdownFixed: {
    position: "fixed",
    minWidth: 190,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    boxShadow: theme.shadowSm,
    padding: 6,
    zIndex: 9999,
  },

  dropdownItemLink: {
    width: "100%",
    textAlign: "left",
    padding: "8px 10px",
    borderRadius: 8,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    color: theme.text,
    textDecoration: "none",
    display: "block",
    boxSizing: "border-box",
  },

  dropdownItemButton: {
    width: "100%",
    textAlign: "left",
    padding: "8px 10px",
    borderRadius: 8,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    color: theme.text,
  },

  dropdownItemActive: {
    background: theme.primarySoft,
    color: theme.primary,
    fontWeight: 600,
  },

  dropdownLabel: {
    fontSize: 11,
    color: theme.muted,
    padding: "6px 10px",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    fontWeight: 700,
  },

  dropdownFixed: {
  position: "fixed",
  minWidth: 190,
  background: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: 10,
  boxShadow: theme.shadowSm,
  padding: 6,
  zIndex: 9999,
  textAlign: "left",
},

  divider: {
    height: 1,
    background: theme.border,
    margin: "6px 0",
  },
};

export default QuizList;