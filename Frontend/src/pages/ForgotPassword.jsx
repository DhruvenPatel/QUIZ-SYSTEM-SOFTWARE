import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Clock3,
  KeyRound,
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const theme = {
  primary: "#1d4ed8",
  primaryHover: "#1e40af",
  primarySoft: "rgba(29, 78, 216, 0.08)",
  success: "#15803d",
  successSoft: "rgba(21, 128, 61, 0.08)",
  warning: "#d97706",
  warningSoft: "rgba(217, 119, 6, 0.08)",
  bg: "#f6f8fb",
  surface: "#ffffff",
  surfaceSoft: "#f8fafc",
  text: "#111827",
  muted: "#667085",
  border: "#e5e7eb",
  shadowSm: "0 4px 14px rgba(17, 24, 39, 0.04)",
  shadowMd: "0 12px 32px rgba(17, 24, 39, 0.08)",
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenGenerated, setTokenGenerated] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    setTokenGenerated("");

    try {
      const { data } = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      const resetToken = data?.resetToken || "";

      setTokenGenerated(resetToken);
      toast.success("Reset token generated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate reset token");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = async () => {
    if (!tokenGenerated) return;

    try {
      await navigator.clipboard.writeText(tokenGenerated);
      toast.success("Reset token copied");
    } catch {
      toast.error("Failed to copy token");
    }
  };

  const handleGoToReset = () => {
    if (!tokenGenerated) return;
    navigate(`/reset-password/${tokenGenerated}`);
  };

  const getInputWrapStyle = () => ({
    ...styles.inputWrap,
    ...(focusedField === "email" ? styles.inputWrapFocused : {}),
  });

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topBar}>
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={styles.backButton}
          >
            <ArrowLeft size={16} />
            <span>Back to login</span>
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
              <p style={styles.eyebrow}>Account recovery</p>
              <h2 style={styles.heroTitle}>
                Reset your password and get back into your workspace.
              </h2>
              <p style={styles.heroText}>
                Enter your registered email address to generate a secure reset
                token. You can then continue to the password reset screen and
                set a new password.
              </p>
            </div>

            <div style={styles.infoPanel}>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p style={styles.infoTitle}>Secure token flow</p>
                  <p style={styles.infoText}>
                    Reset access using a temporary token for account recovery.
                  </p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <Clock3 size={18} />
                </div>
                <div>
                  <p style={styles.infoTitle}>Time-based reset access</p>
                  <p style={styles.infoText}>
                    Reset tokens are designed to expire, improving account safety.
                  </p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <KeyRound size={18} />
                </div>
                <div>
                  <p style={styles.infoTitle}>Simple recovery path</p>
                  <p style={styles.infoText}>
                    Generate token, open reset page, and update your password.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section style={styles.rightSection}>
            <div style={styles.formWrap}>
              <div style={styles.formCard}>
                <div style={styles.formHeader}>
                  <p style={styles.formEyebrow}>Forgot Password</p>
                  <h3 style={styles.formTitle}>Recover your account</h3>
                  <p style={styles.formText}>
                    Enter your email to generate a password reset token.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email address</label>
                    <div style={getInputWrapStyle()}>
                      <Mail size={18} style={styles.inputIcon} />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField("email")}
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
                    <span>{loading ? "Generating..." : "Generate Reset Token"}</span>
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </form>

                {tokenGenerated ? (
                  <div style={styles.successCard}>
                    <p style={styles.successTitle}>Reset token generated</p>
                    <p style={styles.successText}>
                      Use this token on the reset password page.
                    </p>

                    <div style={styles.tokenBox}>{tokenGenerated}</div>

                    <div style={styles.actionRow}>
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        style={styles.secondaryButton}
                      >
                        Copy Token
                      </button>

                      <button
                        type="button"
                        onClick={handleGoToReset}
                        style={styles.primarySmallButton}
                      >
                        Continue to Reset
                      </button>
                    </div>
                  </div>
                ) : null}

                <div style={styles.footerBlock}>
                  <p style={styles.footerText}>
                    Remember your password?{" "}
                    <Link to="/login" style={styles.link}>
                      Back to login
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
    maxWidth: "440px",
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

  label: {
    display: "block",
    marginBottom: "8px",
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

  primarySmallButton: {
    flex: 1,
    minHeight: "42px",
    borderRadius: "12px",
    border: "none",
    background: theme.primary,
    color: "#fff",
    fontSize: "13px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  secondaryButton: {
    flex: 1,
    minHeight: "42px",
    borderRadius: "12px",
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    color: theme.text,
    fontSize: "13px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  successCard: {
    marginTop: "18px",
    padding: "16px",
    borderRadius: "14px",
    border: `1px solid ${theme.border}`,
    background: theme.successSoft,
  },

  successTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: theme.text,
  },

  successText: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: theme.muted,
    lineHeight: 1.6,
  },

  tokenBox: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "12px",
    background: theme.surface,
    border: `1px dashed ${theme.border}`,
    fontSize: "12px",
    lineHeight: 1.6,
    color: theme.text,
    wordBreak: "break-all",
  },

  actionRow: {
    marginTop: "12px",
    display: "flex",
    gap: "10px",
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

export default ForgotPassword;