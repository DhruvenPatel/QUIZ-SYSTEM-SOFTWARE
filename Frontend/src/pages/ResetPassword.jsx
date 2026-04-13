import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const theme = {
  primary: "#1d4ed8",
  bg: "#f6f8fb",
  surface: "#ffffff",
  text: "#111827",
  muted: "#667085",
  border: "#e5e7eb",
  success: "#15803d",
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!password || !confirmPassword) {
      toast.error("All fields are required");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await api.post(`/auth/reset-password/${token}`, { password });

      toast.success("Password reset successful 🎉");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Reset Password</h2>
          <p style={styles.subtitle}>
            Enter your new password to regain access.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.inputWrap}>
              <Lock size={18} style={styles.icon} />
              <input
                type={show ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                style={styles.eyeBtn}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrap}>
              <Lock size={18} style={styles.icon} />
              <input
                type={show ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* CTA */}
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.disabled : {}),
            }}
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <Link to="/login" style={styles.back}>
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#f6f8fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },

  header: {
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: "6px",
    fontSize: "14px",
    color: "#667085",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  inputGroup: {},

  label: {
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "6px",
    display: "block",
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "0 12px",
    height: "46px",
    gap: "8px",
  },

  icon: {
    color: "#667085",
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
  },

  eyeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#667085",
  },

  button: {
    height: "46px",
    borderRadius: "10px",
    border: "none",
    background: "#1d4ed8",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "6px",
  },

  disabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  footer: {
    marginTop: "20px",
    textAlign: "center",
  },

  back: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#1d4ed8",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default ResetPassword;