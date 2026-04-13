import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Users,
  UserCog,
  ClipboardList,
  Activity,
  CalendarDays,
  TrendingUp,
  FileText,
} from "lucide-react";
import api from "../../api/axios";

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
  purple: "#7c3aed",
  purpleSoft: "rgba(124, 58, 237, 0.10)",
  danger: "#dc2626",
  dangerSoft: "rgba(220, 38, 38, 0.10)",
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

const normalizeStatus = (status) => (status || "draft").toLowerCase();

const statusToneMap = {
  live: {
    label: "Live",
    color: theme.success,
    bg: theme.successSoft,
  },
  published: {
    label: "Published",
    color: theme.primary,
    bg: theme.primarySoft,
  },
  completed: {
    label: "Completed",
    color: theme.purple,
    bg: theme.purpleSoft,
  },
  upcoming: {
    label: "Upcoming",
    color: theme.warning,
    bg: theme.warningSoft,
  },
  draft: {
    label: "Draft",
    color: theme.warning,
    bg: "rgba(148, 163, 184, 0.14)",
  },
};

const StatCard = ({ icon, title, value, subline, tone = "primary" }) => {
  const tones = {
    primary: {
      color: theme.primary,
      bg: theme.primarySoft,
    },
    success: {
      color: theme.success,
      bg: theme.successSoft,
    },
    warning: {
      color: theme.warning,
      bg: theme.warningSoft,
    },
    purple: {
      color: theme.purple,
      bg: theme.purpleSoft,
    },
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

const ProgressRow = ({ label, value, total, tone = "primary" }) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  const toneColor =
    tone === "success"
      ? theme.success
      : tone === "warning"
      ? theme.warning
      : tone === "purple"
      ? theme.purple
      : theme.primary;

  return (
    <div style={styles.progressRow}>
      <div style={styles.progressHeader}>
        <span style={styles.progressLabel}>{label}</span>
        <span style={styles.progressValue}>
          {value} <span style={styles.progressPercent}>({percent}%)</span>
        </span>
      </div>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${percent}%`,
            background: toneColor,
          }}
        />
      </div>
    </div>
  );
};

const Reports = () => {
  const [quizMasters, setQuizMasters] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [quizMastersRes, participantsRes, quizzesRes] = await Promise.all([
        api.get("/users/quiz-masters"),
        api.get("/users/participants"),
        api.get("/quizzes"),
      ]);

      setQuizMasters(quizMastersRes?.data?.data || []);
      setParticipants(participantsRes?.data?.data || []);
      setQuizzes(quizzesRes?.data?.quizzes || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError(err?.response?.data?.message || "Failed to load reports data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const report = useMemo(() => {
    const totalQuizMasters = quizMasters.length;
    const totalParticipants = participants.length;
    const totalQuizzes = quizzes.length;

    const statusCounts = {
      draft: 0,
      published: 0,
      live: 0,
      completed: 0,
      upcoming: 0,
    };

    quizzes.forEach((quiz) => {
      const status = normalizeStatus(quiz.status);
      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      } else {
        statusCounts.draft += 1;
      }
    });

    const creatorMap = {};

    quizzes.forEach((quiz) => {
      const creatorId = quiz?.createdBy?._id || "unknown";
      const creatorName = quiz?.createdBy?.name || "Unknown";
      const creatorEmail = quiz?.createdBy?.email || "-";

      if (!creatorMap[creatorId]) {
        creatorMap[creatorId] = {
          creatorId,
          name: creatorName,
          email: creatorEmail,
          totalQuizzes: 0,
          lastCreatedAt: quiz?.createdAt || null,
        };
      }

      creatorMap[creatorId].totalQuizzes += 1;

      if (
        quiz?.createdAt &&
        (!creatorMap[creatorId].lastCreatedAt ||
          new Date(quiz.createdAt) > new Date(creatorMap[creatorId].lastCreatedAt))
      ) {
        creatorMap[creatorId].lastCreatedAt = quiz.createdAt;
      }
    });

    const topQuizMasters = Object.values(creatorMap)
      .sort((a, b) => b.totalQuizzes - a.totalQuizzes)
      .slice(0, 5);

    const recentQuizzes = [...quizzes]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    return {
      totalQuizMasters,
      totalParticipants,
      totalQuizzes,
      statusCounts,
      topQuizMasters,
      recentQuizzes,
    };
  }, [quizMasters, participants, quizzes]);

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <p style={styles.kicker}>Super Admin / Analytics & Insights</p>
          <h1 style={styles.title}>Reports</h1>
          <p style={styles.subline}>
            Review platform-level activity across quiz masters, members, and
            quizzes with a single summary dashboard.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={styles.stateBox}>Loading reports...</div>
      ) : error ? (
        <div style={styles.errorBox}>{error}</div>
      ) : (
        <>
          <div style={styles.statsGrid}>
            <StatCard
              icon={<UserCog size={20} />}
              title="Quiz Masters"
              value={report.totalQuizMasters}
              subline="Total quiz master accounts"
              tone="primary"
            />
            <StatCard
              icon={<Users size={20} />}
              title="Members"
              value={report.totalParticipants}
              subline="Total participant accounts"
              tone="success"
            />
            <StatCard
              icon={<ClipboardList size={20} />}
              title="All Quizzes"
              value={report.totalQuizzes}
              subline="Total quizzes on platform"
              tone="warning"
            />
            <StatCard
              icon={<Activity size={20} />}
              title="Live Quizzes"
              value={report.statusCounts.live}
              subline="Currently active quizzes"
              tone="purple"
            />
          </div>

          <div style={styles.gridTwo}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Quiz Status Overview</h2>
                  <p style={styles.cardSubline}>
                    Distribution of quizzes across current lifecycle states.
                  </p>
                </div>
                <div style={styles.cardIconBadge}>
                  <BarChart3 size={18} />
                </div>
              </div>

              <div style={styles.progressList}>
                <ProgressRow
                  label="Draft"
                  value={report.statusCounts.draft}
                  total={report.totalQuizzes}
                  tone="warning"
                />
                <ProgressRow
                  label="Published"
                  value={report.statusCounts.published}
                  total={report.totalQuizzes}
                  tone="primary"
                />
                <ProgressRow
                  label="Live"
                  value={report.statusCounts.live}
                  total={report.totalQuizzes}
                  tone="success"
                />
                <ProgressRow
                  label="Completed"
                  value={report.statusCounts.completed}
                  total={report.totalQuizzes}
                  tone="purple"
                />
                <ProgressRow
                  label="Upcoming"
                  value={report.statusCounts.upcoming}
                  total={report.totalQuizzes}
                  tone="warning"
                />
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Platform Composition</h2>
                  <p style={styles.cardSubline}>
                    Quick breakdown of major entities in the system.
                  </p>
                </div>
                <div style={styles.cardIconBadge}>
                  <TrendingUp size={18} />
                </div>
              </div>

              <div style={styles.miniStatsGrid}>
                <div style={styles.miniStatBox}>
                  <p style={styles.miniStatLabel}>Quiz Masters</p>
                  <h3 style={styles.miniStatValue}>{report.totalQuizMasters}</h3>
                </div>
                <div style={styles.miniStatBox}>
                  <p style={styles.miniStatLabel}>Members</p>
                  <h3 style={styles.miniStatValue}>{report.totalParticipants}</h3>
                </div>
                <div style={styles.miniStatBox}>
                  <p style={styles.miniStatLabel}>Draft Quizzes</p>
                  <h3 style={styles.miniStatValue}>{report.statusCounts.draft}</h3>
                </div>
                <div style={styles.miniStatBox}>
                  <p style={styles.miniStatLabel}>Completed Quizzes</p>
                  <h3 style={styles.miniStatValue}>
                    {report.statusCounts.completed}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.gridTwo}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Top Quiz Masters</h2>
                  <p style={styles.cardSubline}>
                    Quiz masters ranked by total quizzes created.
                  </p>
                </div>
                <div style={styles.cardIconBadge}>
                  <UserCog size={18} />
                </div>
              </div>

              {report.topQuizMasters.length > 0 ? (
                <div style={styles.listWrap}>
                  {report.topQuizMasters.map((item, index) => (
                    <div key={item.creatorId} style={styles.listRow}>
                      <div style={styles.rankBadge}>{index + 1}</div>

                      <div style={styles.listContent}>
                        <p style={styles.listTitle}>{item.name}</p>
                        <p style={styles.listMeta}>{item.email}</p>
                      </div>

                      <div style={styles.listMetric}>
                        <span style={styles.metricValue}>{item.totalQuizzes}</span>
                        <span style={styles.metricLabel}>Quizzes</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyBox}>No quiz master data found.</div>
              )}
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Recent Quizzes</h2>
                  <p style={styles.cardSubline}>
                    Latest quizzes created across the platform.
                  </p>
                </div>
                <div style={styles.cardIconBadge}>
                  <FileText size={18} />
                </div>
              </div>

              {report.recentQuizzes.length > 0 ? (
                <div style={styles.listWrap}>
                  {report.recentQuizzes.map((quiz) => {
                    const status = statusToneMap[normalizeStatus(quiz.status)] || statusToneMap.draft;

                    return (
                      <div key={quiz._id} style={styles.listRow}>
                        <div style={styles.dotIcon}>
                          <ClipboardList size={16} />
                        </div>

                        <div style={styles.listContent}>
                          <p style={styles.listTitle}>
                            {quiz.title || "Untitled Quiz"}
                          </p>
                          <p style={styles.listMeta}>
                            {quiz.createdBy?.name || "-"} • {formatDate(quiz.createdAt)}
                          </p>
                        </div>

                        <span
                          style={{
                            ...styles.statusPill,
                            color: status.color,
                            background: status.bg,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={styles.emptyBox}>No recent quizzes found.</div>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Reporting Notes</h2>
                <p style={styles.cardSubline}>
                  This report currently reflects live data from users and quizzes.
                </p>
              </div>
              <div style={styles.cardIconBadge}>
                <CalendarDays size={18} />
              </div>
            </div>

            <div style={styles.notesGrid}>
              <div style={styles.noteBox}>
                <p style={styles.noteTitle}>Quiz Masters Source</p>
                <p style={styles.noteText}>
                  Pulled from the quiz master users endpoint.
                </p>
              </div>

              <div style={styles.noteBox}>
                <p style={styles.noteTitle}>Members Source</p>
                <p style={styles.noteText}>
                  Pulled from the participants endpoint.
                </p>
              </div>

              <div style={styles.noteBox}>
                <p style={styles.noteTitle}>Quiz Source</p>
                <p style={styles.noteText}>
                  Pulled from the quizzes endpoint and aggregated on the page.
                </p>
              </div>

              <div style={styles.noteBox}>
                <p style={styles.noteTitle}>Scope</p>
                <p style={styles.noteText}>
                  This version covers platform users and quizzes, not attempt-level analytics.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  page: {
    display: "grid",
    gap: "20px",
  },

  hero: {
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
    maxWidth: "840px",
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
    alignItems: "flex-start",
    boxShadow: theme.shadow,
  },

  statIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  statTitle: {
    margin: 0,
    fontSize: "13px",
    color: theme.muted,
    fontWeight: 600,
  },

  statValue: {
    margin: "6px 0 6px",
    fontSize: "28px",
    lineHeight: 1,
    color: theme.text,
    fontWeight: 800,
  },

  statSubline: {
    margin: 0,
    fontSize: "12px",
    color: theme.muted,
    lineHeight: 1.5,
  },

  gridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "20px",
  },

  card: {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "20px",
    padding: "20px",
    boxShadow: theme.shadow,
    display: "grid",
    gap: "18px",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    color: theme.text,
    fontWeight: 800,
  },

  cardSubline: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: theme.muted,
    lineHeight: 1.6,
  },

  cardIconBadge: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    background: theme.primarySoft,
    color: theme.primary,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  progressList: {
    display: "grid",
    gap: "14px",
  },

  progressRow: {
    display: "grid",
    gap: "8px",
  },

  progressHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  progressLabel: {
    color: theme.text,
    fontSize: "14px",
    fontWeight: 700,
  },

  progressValue: {
    color: theme.text,
    fontSize: "13px",
    fontWeight: 700,
  },

  progressPercent: {
    color: theme.muted,
    fontWeight: 600,
  },

  progressTrack: {
    width: "100%",
    height: "10px",
    borderRadius: "999px",
    background: "#e9eef6",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "999px",
  },

  miniStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },

  miniStatBox: {
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    padding: "16px",
    background: "#fff",
  },

  miniStatLabel: {
    margin: 0,
    color: theme.muted,
    fontSize: "13px",
    fontWeight: 600,
  },

  miniStatValue: {
    margin: "8px 0 0",
    color: theme.text,
    fontSize: "24px",
    fontWeight: 800,
  },

  listWrap: {
    display: "grid",
    gap: "12px",
  },

  listRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    background: "#fff",
  },

  rankBadge: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: theme.primarySoft,
    color: theme.primary,
    display: "grid",
    placeItems: "center",
    fontSize: "14px",
    fontWeight: 800,
    flexShrink: 0,
  },

  dotIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: theme.primarySoft,
    color: theme.primary,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  listContent: {
    minWidth: 0,
    flex: 1,
  },

  listTitle: {
    margin: 0,
    color: theme.text,
    fontSize: "14px",
    fontWeight: 700,
  },

  listMeta: {
    margin: "4px 0 0",
    color: theme.muted,
    fontSize: "12px",
    lineHeight: 1.5,
  },

  listMetric: {
    display: "grid",
    justifyItems: "end",
    flexShrink: 0,
  },

  metricValue: {
    color: theme.text,
    fontSize: "18px",
    fontWeight: 800,
    lineHeight: 1,
  },

  metricLabel: {
    marginTop: "4px",
    color: theme.muted,
    fontSize: "12px",
    fontWeight: 600,
  },

  statusPill: {
    minHeight: "30px",
    padding: "0 10px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: 700,
    flexShrink: 0,
  },

  notesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },

  noteBox: {
    padding: "16px",
    borderRadius: "16px",
    border: `1px solid ${theme.border}`,
    background: "#fff",
  },

  noteTitle: {
    margin: 0,
    color: theme.text,
    fontSize: "14px",
    fontWeight: 700,
  },

  noteText: {
    margin: "8px 0 0",
    color: theme.muted,
    fontSize: "13px",
    lineHeight: 1.6,
  },

  emptyBox: {
    padding: "28px 16px",
    textAlign: "center",
    color: theme.muted,
    fontSize: "14px",
    border: `1px dashed ${theme.border}`,
    borderRadius: "16px",
  },

  stateBox: {
    padding: "40px 20px",
    border: `1px dashed ${theme.border}`,
    borderRadius: "16px",
    textAlign: "center",
    color: theme.muted,
    fontSize: "14px",
    background: "#fff",
  },

  errorBox: {
    padding: "16px",
    borderRadius: "14px",
    background: theme.dangerSoft,
    color: theme.danger,
    fontSize: "14px",
    fontWeight: 600,
  },
};

export default Reports;