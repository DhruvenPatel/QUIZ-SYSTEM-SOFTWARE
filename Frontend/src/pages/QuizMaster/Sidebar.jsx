import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Trophy,
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  CircleHelp,
  LogOut,
  ChevronRight,
  Sparkles,
  Users,
  ShieldCheck,
  BarChart3,
  FileQuestion,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const theme = {
  primary: "#2563eb",
  sidebarBg: "#0f172a",
  sidebarSurface: "rgba(255,255,255,0.04)",
  sidebarBorder: "rgba(255,255,255,0.08)",
  sidebarText: "#e2e8f0",
  sidebarMuted: "#94a3b8",
  sidebarActive: "#ffffff",
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo, logout } = useAuth();

  const user = userInfo?.user || {};
  const role = (user?.role || "").toLowerCase();

  const roleConfig = {
    super_admin: {
      badge: "Super Admin Workspace",
      fallbackName: "Super Admin",
      navGroups: [
        {
          label: "Workspace",
          items: [
            {
              label: "Dashboard",
              to: "/super-admin-dashboard",
              icon: <LayoutDashboard size={18} />,
            },
          ],
        },
        {
          label: "Platform Overview",
          items: [
            {
              label: "Quiz Masters",
              to: "/quiz-masters",
              icon: <ShieldCheck size={18} />,
            },
            {
              label: "Members",
              to: "/members",
              icon: <Users size={18} />,
            },
            {
              label: "Quizzes",
              to: "/all-quizzes",
              icon: <ListChecks size={18} />,
            },
            {
              label: "Reports",
              to: "/reports",
              icon: <BarChart3 size={18} />,
            },
          ],
        },
      ],
    },

    quiz_master: {
      badge: "Quiz Master Workspace",
      fallbackName: "Quiz Master",
      navGroups: [
        {
          label: "Workspace",
          items: [
            {
              label: "Dashboard",
              to: "/quiz-master-dashboard",
              icon: <LayoutDashboard size={18} />,
            },
          ],
        },
        {
          label: "Quiz Management",
          items: [
            {
              label: "Create Quiz",
              to: "/create-quiz",
              icon: <PlusCircle size={18} />,
            },
            {
              label: "View Quizzes",
              to: "/quizzes",
              icon: <ListChecks size={18} />,
            },
            {
              label: "Add Question",
              to: "/add-question",
              icon: <CircleHelp size={18} />,
            },
          ],
        },
      ],
    },

    participant: {
      badge: "Participant Workspace",
      fallbackName: "Participant",
      navGroups: [
        {
          label: "Workspace",
          items: [
            {
              label: "Dashboard",
              to: "/participant-dashboard",
              icon: <LayoutDashboard size={18} />,
            },
          ],
        },
        {
          label: "My Activity",
          items: [
            {
              label: "Join Quiz",
              to: "/join-quiz",
              icon: <FileQuestion size={18} />,
            },
            {
              label: "My Quizzes",
              to: "/participant-quizzes",
              icon: <ListChecks size={18} />,
            },
          ],
        },
      ],
    },
  };

  const currentRoleConfig = roleConfig[role] || {
    badge: "User Workspace",
    fallbackName: "User",
    navGroups: [
      {
        label: "Workspace",
        items: [
          {
            label: "Dashboard",
            to: "/dashboard",
            icon: <LayoutDashboard size={18} />,
          },
        ],
      },
    ],
  };

  const navGroups = currentRoleConfig.navGroups;

  const isActive = (path) => {
    if (path === "/quizzes") {
      return (
        location.pathname === "/quizzes" ||
        location.pathname.startsWith("/quizzes/") ||
        location.pathname.startsWith("/questions/edit/")
      );
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarTop}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <Trophy size={18} />
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={styles.brandKicker}>Quiz management platform</p>
            <h1 style={styles.brandTitle}>QuizSphere</h1>
          </div>
        </div>

        <div style={styles.workspaceBadge}>
          <Sparkles size={14} />
          <span>{currentRoleConfig.badge}</span>
        </div>
      </div>

      <div style={styles.navWrap}>
        {navGroups.map((group) => (
          <div key={group.label} style={styles.navGroup}>
            <p style={styles.navLabel}>{group.label}</p>

            <div style={styles.navList}>
              {group.items.map((item) => {
                const active = isActive(item.to);

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    style={active ? styles.navItemActive : styles.navLink}
                  >
                    <div style={styles.navLeft}>
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.sidebarFooter}>
        <div style={styles.accountCard}>
          <div style={styles.accountAvatar}>
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={styles.accountName}>
              {user?.name || currentRoleConfig.fallbackName}
            </p>
            <p style={styles.accountMeta}>
              {user?.email || user?.role || "No email"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.sidebarLogout}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "280px",
    height: "100vh",
    background: theme.sidebarBg,
    borderRight: `1px solid ${theme.sidebarBorder}`,
    padding: "20px 18px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    boxSizing: "border-box",
    overflowY: "auto",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.18)",
  },

  sidebarTop: {
    paddingBottom: "18px",
    marginBottom: "18px",
    borderBottom: `1px solid ${theme.sidebarBorder}`,
    display: "grid",
    gap: "14px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  brandIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#ffffff",
    color: theme.sidebarBg,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  brandKicker: {
    margin: 0,
    fontSize: "12px",
    lineHeight: 1.2,
    color: theme.sidebarMuted,
  },

  brandTitle: {
    margin: "4px 0 0",
    fontSize: "18px",
    lineHeight: 1.1,
    fontWeight: 700,
    color: theme.sidebarText,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  workspaceBadge: {
    minHeight: "36px",
    padding: "0 12px",
    borderRadius: "12px",
    background: theme.sidebarSurface,
    border: `1px solid ${theme.sidebarBorder}`,
    color: theme.sidebarText,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 600,
    width: "fit-content",
  },

  navWrap: {
    display: "grid",
    gap: "18px",
  },

  navGroup: {
    display: "grid",
    gap: "10px",
  },

  navLabel: {
    margin: 0,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: theme.sidebarMuted,
    fontWeight: 700,
    padding: "0 8px",
  },

  navList: {
    display: "grid",
    gap: "8px",
  },

  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  navItemActive: {
    minHeight: "46px",
    padding: "0 14px",
    borderRadius: "14px",
    background: theme.sidebarActive,
    color: theme.sidebarBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
  },

  navLink: {
    minHeight: "46px",
    padding: "0 14px",
    borderRadius: "14px",
    background: "transparent",
    color: theme.sidebarText,
    border: `1px solid transparent`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
  },

  sidebarFooter: {
    marginTop: "auto",
    paddingTop: "18px",
    borderTop: `1px solid ${theme.sidebarBorder}`,
    display: "grid",
    gap: "14px",
  },

  accountCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "14px",
    background: theme.sidebarSurface,
    border: `1px solid ${theme.sidebarBorder}`,
  },

  accountAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#ffffff",
    color: theme.sidebarBg,
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    fontSize: "15px",
    flexShrink: 0,
  },

  accountName: {
    margin: 0,
    color: theme.sidebarText,
    fontSize: "14px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  accountMeta: {
    margin: "4px 0 0",
    color: theme.sidebarMuted,
    fontSize: "12px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  sidebarLogout: {
    minHeight: "44px",
    borderRadius: "12px",
    border: `1px solid ${theme.sidebarBorder}`,
    background: "transparent",
    color: theme.sidebarText,
    fontSize: "14px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
  },
};

export default Sidebar;
