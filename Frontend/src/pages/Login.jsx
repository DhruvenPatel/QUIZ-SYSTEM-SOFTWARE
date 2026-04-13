import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Users,
  BarChart3,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const theme = {
  primary: "#1d4ed8",
  primaryHover: "#1e40af",
  primarySoft: "rgba(29, 78, 216, 0.08)",
  success: "#15803d",
  bg: "#f6f8fb",
  surface: "#ffffff",
  surfaceSoft: "#f8fafc",
  text: "#111827",
  muted: "#667085",
  border: "#e5e7eb",
  shadowSm: "0 4px 14px rgba(17, 24, 39, 0.04)",
  shadowMd: "0 12px 32px rgba(17, 24, 39, 0.08)",
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 920 : false
  );

  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyBackground = document.body.style.background;
    const originalBodyMinHeight = document.body.style.minHeight;
    const originalHtmlHeight = document.documentElement.style.height;
    const originalBodyHeight = document.body.style.height;
    const originalBodyOverflowX = document.body.style.overflowX;

    document.documentElement.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.background = theme.bg;
    document.body.style.minHeight = "100vh";
    document.body.style.height = "100%";
    document.body.style.overflowX = "hidden";

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 920);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.background = originalBodyBackground;
      document.body.style.minHeight = originalBodyMinHeight;
      document.body.style.height = originalBodyHeight;
      document.body.style.overflowX = originalBodyOverflowX;
      document.documentElement.style.height = originalHtmlHeight;

      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", formData);

      login(data);
      toast.success("Login successful");

      const role = data?.user?.role;

      if (role === "super_admin") {
        navigate("/super-admin-dashboard");
      } else if (role === "quiz_master") {
        navigate("/quiz-master-dashboard");
      } else {
        navigate("/participant-dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const getInputWrapStyle = (fieldName) => ({
    ...styles.inputWrap,
    ...(focusedField === fieldName ? styles.inputWrapFocused : {}),
  });

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topBar}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={styles.backButton}
          >
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </button>
        </div>

        <div
          style={{
            ...styles.container,
            gridTemplateColumns: isMobile ? "1fr" : "1.02fr 0.98fr",
          }}
        >
          <section
            style={{
              ...styles.leftSection,
              borderRight: isMobile ? "none" : `1px solid ${theme.border}`,
              borderBottom: isMobile ? `1px solid ${theme.border}` : "none",
            }}
          >
            <div style={styles.brand}>
              <div style={styles.brandIcon}>
                <Trophy size={18} />
              </div>
              <div>
                <p style={styles.brandKicker}>Quiz management platform</p>
                <h1 style={styles.brandTitle}>QuizSphere</h1>
              </div>
            </div>

            <div style={styles.heroBlock}>
              <p style={styles.eyebrow}>Welcome back</p>
              <h2 style={styles.formTitle}>
                Sign in to continue managing quizzes, participants, and results.
              </h2>
              <p style={styles.heroText}>
                Access your workspace to create quizzes, manage question flow,
                review performance, and operate live quiz sessions with a clear
                and structured interface.
              </p>
            </div>

            <div style={styles.infoPanel}>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <Users size={18} />
                </div>
                <div>
                  <p style={styles.infoTitle}>Role-based workflows</p>
                  <p style={styles.infoText}>
                    Separate access for admins, quiz masters, and participants.
                  </p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <BarChart3 size={18} />
                </div>
                <div>
                  <p style={styles.infoTitle}>Operational visibility</p>
                  <p style={styles.infoText}>
                    Track quiz progress, scores, and session activity in one
                    flow.
                  </p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p style={styles.infoTitle}>Secure access handling</p>
                  <p style={styles.infoText}>
                    Protected routes and session-aware login experience.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section style={styles.rightSection}>
            <div style={styles.formWrap}>
              <div style={styles.formCard}>
                <div style={styles.formHeader}>
                  <p style={styles.formEyebrow}>Login</p>
                  <h3 style={styles.formTitle}>Login to your account</h3>
                  <p style={styles.formText}>
                    Enter your credentials to access your dashboard.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email address</label>
                    <div style={getInputWrapStyle("email")}>
                      <Mail size={18} style={styles.inputIcon} />
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField("")}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <div style={styles.labelRow}>
                      <label style={styles.labelNoMargin}>Password</label>
                      <Link to="/forgot-password" style={styles.secondaryLink}>
                        Forgot password?
                      </Link>
                    </div>

                    <div style={getInputWrapStyle("password")}>
                      <Lock size={18} style={styles.inputIcon} />
                      <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField("")}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      ...styles.primaryButton,
                      ...(loading ? styles.buttonDisabled : {}),
                    }}
                    disabled={loading}
                  >
                    <span>{loading ? "Logging in..." : "Login"}</span>
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </form>

                <div style={styles.footerBlock}>
                  <p style={styles.footerText}>
                    Don&apos;t have an account?{" "}
                    <Link to="/register" style={styles.link}>
                      Create account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: theme.bg,
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    boxSizing: "border-box",
  },

  shell: {
    width: "100%",
    maxWidth: "1160px",
  },

  topBar: {
    display: "flex",
    alignItems: "center",
    marginBottom: "14px",
  },

  backButton: {
    height: "40px",
    padding: "0 14px",
    borderRadius: "10px",
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    color: theme.text,
    fontSize: "14px",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    boxShadow: theme.shadowSm,
  },

  container: {
    width: "100%",
    display: "grid",
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: theme.shadowMd,
  },

  leftSection: {
    padding: "44px",
    background: "#fbfcfe",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "32px",
  },

  rightSection: {
    padding: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.surface,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  brandIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: theme.primary,
    color: "#fff",
    display: "grid",
    placeItems: "center",
    boxShadow: theme.shadowSm,
    flexShrink: 0,
  },

  brandKicker: {
    margin: 0,
    fontSize: "12px",
    lineHeight: 1.2,
    color: theme.muted,
  },

  brandTitle: {
    margin: "4px 0 0",
    fontSize: "18px",
    lineHeight: 1.1,
    fontWeight: 700,
    color: theme.text,
  },

  heroBlock: {
    display: "grid",
    gap: "14px",
  },

  eyebrow: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: theme.primary,
  },

  heroTitle: {
    margin: 0,
    fontSize: "40px",
    lineHeight: 1.08,
    letterSpacing: "-0.03em",
    color: theme.text,
    fontWeight: 800,
    maxWidth: "520px",
  },

  heroText: {
    margin: 0,
    fontSize: "15px",
    lineHeight: 1.8,
    color: theme.muted,
    maxWidth: "520px",
  },

  infoPanel: {
    display: "grid",
    gap: "12px",
  },

  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "16px",
    borderRadius: "14px",
    border: `1px solid ${theme.border}`,
    background: theme.surface,
  },

  infoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: theme.primarySoft,
    color: theme.primary,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  infoTitle: {
    margin: 0,
    color: theme.text,
    fontSize: "15px",
    fontWeight: 700,
  },

  infoText: {
    margin: "4px 0 0",
    color: theme.muted,
    fontSize: "14px",
    lineHeight: 1.65,
  },

  formWrap: {
    width: "100%",
    maxWidth: "420px",
  },

  formCard: {
    width: "100%",
    padding: "32px",
    borderRadius: "18px",
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadowSm,
    boxSizing: "border-box",
  },

  formHeader: {
    marginBottom: "24px",
  },

  formEyebrow: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: theme.primary,
  },

  formTitle: {
    margin: "8px 0 0",
    fontSize: "28px",
    lineHeight: 1.15,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: theme.text,
  },

  formText: {
    margin: "10px 0 0",
    fontSize: "14px",
    lineHeight: 1.7,
    color: theme.muted,
  },

  inputGroup: {
    marginBottom: "18px",
  },

  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
    gap: "12px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: theme.text,
  },

  labelNoMargin: {
    fontSize: "14px",
    fontWeight: 600,
    color: theme.text,
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    height: "50px",
    padding: "0 14px",
    borderRadius: "12px",
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },

  inputWrapFocused: {
    border: `1px solid ${theme.primary}`,
    boxShadow: "0 0 0 4px rgba(29, 78, 216, 0.08)",
  },

  inputIcon: {
    color: theme.muted,
    flexShrink: 0,
  },

  input: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "14px",
    color: theme.text,
    minWidth: 0,
  },

  secondaryLink: {
    color: theme.primary,
    fontSize: "13px",
    fontWeight: 600,
    textDecoration: "none",
  },

  primaryButton: {
    width: "100%",
    height: "46px",
    borderRadius: "12px",
    border: "none",
    background: theme.primary,
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    boxShadow: theme.shadowSm,
    marginTop: "6px",
  },

  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  footerBlock: {
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: `1px solid ${theme.border}`,
  },

  footerText: {
    margin: 0,
    textAlign: "center",
    fontSize: "14px",
    color: theme.muted,
    lineHeight: 1.6,
  },

  link: {
    color: theme.primary,
    fontWeight: 700,
    textDecoration: "none",
  },
};

export default Login;