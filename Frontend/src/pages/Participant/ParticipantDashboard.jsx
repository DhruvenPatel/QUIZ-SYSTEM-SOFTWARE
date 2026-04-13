import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Trophy,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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
  successSoft: "rgba(22, 163, 74, 0.1)",
  warning: "#d97706",
  warningSoft: "rgba(217, 119, 6, 0.1)",
  shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
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
  };

  return (
    <div style={styles.statCard}>
      <div
        style={{
          ...styles.statIconWrap,
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

const ParticipantDashboard = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useAuth();

  const user = userInfo?.user || {};

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <p style={styles.kicker}>Participant Workspace</p>
          <h1 style={styles.title}>
            Welcome back, {user?.name ? user.name.split(" ")[0] : "Participant"} 👋
          </h1>
          <p style={styles.subline}>
            Join quizzes, participate in live sessions, and keep track of your
            quiz journey from one place.
          </p>
        </div>

        <div style={styles.heroBadge}>
          <Sparkles size={16} />
          <span>Ready to join your next quiz</span>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          icon={<PlayCircle size={20} />}
          title="Quick Action"
          value="Join Quiz"
          subline="Enter a quiz code and start instantly"
          tone="primary"
        />
        <StatCard
          icon={<Trophy size={20} />}
          title="Role"
          value="Participant"
          subline="Your current access in platform"
          tone="success"
        />
        <StatCard
          icon={<ShieldCheck size={20} />}
          title="Status"
          value="Active"
          subline="Your account is ready to use"
          tone="warning"
        />
      </div>

      <div style={styles.gridTwo}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Your Profile</h2>
              <p style={styles.cardSubline}>
                Basic account information linked to your participant profile.
              </p>
            </div>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>
                <User size={18} />
              </div>
              <div>
                <p style={styles.infoLabel}>Full Name</p>
                <p style={styles.infoValue}>{user?.name || "-"}</p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>
                <Mail size={18} />
              </div>
              <div>
                <p style={styles.infoLabel}>Email Address</p>
                <p style={styles.infoValue}>{user?.email || "-"}</p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <p style={styles.infoLabel}>Role</p>
                <p style={styles.infoValue}>
                  {user?.role === "participant" ? "Participant" : user?.role || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Actions</h2>
              <p style={styles.cardSubline}>
                Start with the most important things you’ll do as a participant.
              </p>
            </div>
          </div>

          <div style={styles.actionStack}>
            <Link to="/join-quiz" style={styles.primaryAction}>
              <div>
                <p style={styles.actionTitle}>Join Quiz</p>
                <p style={styles.actionSubline}>
                  Enter a quiz using the provided quiz code and begin instantly.
                </p>
              </div>
              <ArrowRight size={18} />
            </Link>

            <button type="button" onClick={handleLogout} style={styles.secondaryAction}>
              <div>
                <p style={styles.actionTitleDark}>Logout</p>
                <p style={styles.actionSublineDark}>
                  Sign out from your account securely.
                </p>
              </div>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { display: "grid", gap: "20px" },
  hero: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  kicker: { margin: 0, color: theme.primary, fontSize: "13px", fontWeight: 700 },
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
    maxWidth: "760px",
  },
  heroBadge: {
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
  statIconWrap: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  statTitle: { margin: 0, fontSize: "13px", color: theme.muted, fontWeight: 600 },
  statValue: {
    margin: "6px 0 6px",
    fontSize: "24px",
    lineHeight: 1.1,
    color: theme.text,
    fontWeight: 800,
  },
  statSubline: { margin: 0, fontSize: "12px", color: theme.muted, lineHeight: 1.5 },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
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
  cardTitle: { margin: 0, fontSize: "20px", color: theme.text, fontWeight: 800 },
  cardSubline: { margin: "6px 0 0", fontSize: "14px", color: theme.muted, lineHeight: 1.6 },
  infoGrid: { display: "grid", gap: "14px" },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    background: "#fff",
  },
  infoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: theme.primarySoft,
    color: theme.primary,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  infoLabel: { margin: 0, fontSize: "12px", color: theme.muted, fontWeight: 600 },
  infoValue: {
    margin: "4px 0 0",
    fontSize: "14px",
    color: theme.text,
    fontWeight: 700,
    lineHeight: 1.5,
  },
  actionStack: { display: "grid", gap: "14px" },
  primaryAction: {
    minHeight: "88px",
    borderRadius: "18px",
    padding: "18px",
    background: theme.primary,
    color: "#fff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    boxShadow: "0 14px 32px rgba(37, 99, 235, 0.22)",
  },
  secondaryAction: {
    minHeight: "88px",
    borderRadius: "18px",
    padding: "18px",
    background: "#fff",
    color: theme.text,
    border: `1px solid ${theme.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    cursor: "pointer",
    textAlign: "left",
  },
  actionTitle: { margin: 0, fontSize: "16px", fontWeight: 800, color: "#fff" },
  actionSubline: {
    margin: "6px 0 0",
    fontSize: "13px",
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.86)",
    maxWidth: "360px",
  },
  actionTitleDark: { margin: 0, fontSize: "16px", fontWeight: 800, color: theme.text },
  actionSublineDark: {
    margin: "6px 0 0",
    fontSize: "13px",
    lineHeight: 1.6,
    color: theme.muted,
    maxWidth: "360px",
  },
};

export default ParticipantDashboard;