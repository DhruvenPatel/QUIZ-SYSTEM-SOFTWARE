import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useAuth();

  const role = userInfo?.user?.role;

  const getDashboardRoute = () => {
    if (role === "super_admin") return "/super-admin-dashboard";
    if (role === "quiz_master") return "/quiz-master-dashboard";
    return "/participant-dashboard";
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        <Link to={getDashboardRoute()} style={styles.brand}>
          Quiz System
        </Link>
      </div>

      <div style={styles.right}>
        <Link to={getDashboardRoute()} style={styles.link}>
          Dashboard
        </Link>

        {(role === "super_admin" || role === "quiz_master") && (
          <>
            <Link to="/create-quiz" style={styles.link}>
              Create Quiz
            </Link>
            <Link to="/quizzes" style={styles.link}>
              View Quizzes
            </Link>
            <Link to="/add-question" style={styles.link}>
              Add Question
            </Link>
          </>
        )}

        {role === "participant" && (
          <Link to="/join-quiz" style={styles.link}>
            Join Quiz
          </Link>
        )}

        <span style={styles.roleTag}>{role}</span>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    width: "100%",
    background: "#111",
    color: "#fff",
    padding: "14px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    boxSizing: "border-box",
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  brand: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "20px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: "8px",
    background: "#222",
  },
  roleTag: {
    background: "#333",
    padding: "8px 10px",
    borderRadius: "8px",
    textTransform: "capitalize",
    fontSize: "14px",
  },
  logoutButton: {
    border: "none",
    background: "#c62828",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Navbar;