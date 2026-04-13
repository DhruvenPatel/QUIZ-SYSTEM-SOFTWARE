import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Moon,
  Phone,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Sun,
  Trophy,
  Users,
} from "lucide-react";

const styles = `
:root {
  --primary: #1f4fd6;
  --primary-hover: #1740b0;
  --primary-soft: rgba(31, 79, 214, 0.08);
  --secondary: #0f766e;
  --secondary-soft: rgba(15, 118, 110, 0.08);
  --success: #15803d;
  --warning: #d97706;
  --danger: #dc2626;
  --bg: #f5f7fb;
  --bg-soft: #eef2f7;
  --surface: #ffffff;
  --surface-soft: #f8fafc;
  --panel: rgba(255, 255, 255, 0.92);
  --text: #18212f;
  --muted: #5f6b7a;
  --border: #dde5ef;
  --shadow-sm: 0 8px 24px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 16px 36px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 24px 48px rgba(15, 23, 42, 0.1);
}

:root[data-theme="dark"] {
  --primary: #6ea8ff;
  --primary-hover: #8ab8ff;
  --primary-soft: rgba(110, 168, 255, 0.12);
  --secondary: #5eead4;
  --secondary-soft: rgba(94, 234, 212, 0.12);
  --success: #4ade80;
  --warning: #f59e0b;
  --danger: #f87171;
  --bg: #0f1724;
  --bg-soft: #162131;
  --surface: #111c2d;
  --surface-soft: #182537;
  --panel: rgba(17, 28, 45, 0.92);
  --text: #eef4ff;
  --muted: #9aa9bd;
  --border: rgba(255, 255, 255, 0.08);
  --shadow-sm: 0 10px 30px rgba(0, 0, 0, 0.24);
  --shadow-md: 0 18px 40px rgba(0, 0, 0, 0.28);
  --shadow-lg: 0 24px 56px rgba(0, 0, 0, 0.32);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--bg);
  color: var(--text);
}
button, input, textarea { font: inherit; }
button { cursor: pointer; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }

.quiz-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(31, 79, 214, 0.08), transparent 28%),
    radial-gradient(circle at bottom right, rgba(15, 118, 110, 0.06), transparent 26%),
    var(--bg);
}

.quiz-container {
  width: min(1160px, calc(100% - 32px));
  margin: 0 auto;
}

.quiz-header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--bg) 84%, transparent);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  min-height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--primary), #3b82f6);
  color: white;
  box-shadow: 0 10px 24px rgba(31, 79, 214, 0.18);
}

.brand-subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

.brand-title {
  margin: 2px 0 0;
  font-size: 20px;
  line-height: 1.1;
}

.nav-links,
.header-actions,
.hero-buttons,
.hero-points,
.footer-links,
.cta-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-links button,
.footer-links button {
  border: 0;
  background: transparent;
  color: var(--muted);
  padding: 10px 12px;
  border-radius: 10px;
  transition: 0.2s ease;
}

.nav-links button:hover,
.footer-links button:hover {
  background: var(--primary-soft);
  color: var(--text);
}

.btn {
  height: 44px;
  border-radius: 12px;
  padding: 0 18px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn:hover { transform: translateY(-1px); }

.btn-primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 12px 28px rgba(31, 79, 214, 0.18);
}
.btn-primary:hover { background: var(--primary-hover); }

.btn-secondary {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border);
}
.btn-secondary:hover,
.btn-outline:hover,
.theme-toggle:hover {
  background: var(--surface-soft);
}

.btn-outline,
.theme-toggle {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

.theme-toggle {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
}

.section-anchor { scroll-margin-top: 90px; }

.hero-section {
  padding: 72px 0 44px;
}

.hero-grid,
.dashboard-grid,
.two-col,
.about-grid {
  display: grid;
  grid-template-columns: 1.06fr 0.94fr;
  gap: 28px;
  align-items: center;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 18px;
}

.pill.neutral {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
}

.hero-title {
  margin: 0;
  font-size: clamp(36px, 5vw, 58px);
  line-height: 1.04;
  letter-spacing: -0.03em;
}

.hero-text,
.section-text,
.feature-card p,
.step-card p,
.contact-list > div,
.info-item,
.stat-label {
  color: var(--muted);
  line-height: 1.7;
}

.hero-buttons,
.cta-buttons {
  flex-wrap: wrap;
  margin-top: 26px;
}

.hero-points {
  flex-wrap: wrap;
  margin-top: 24px;
  color: var(--muted);
}

.hero-points > div,
.contact-list > div,
.info-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.dashboard-card,
.panel,
.feature-card,
.info-card,
.step-card,
.stat-card,
.cta-card {
  border: 1px solid var(--border);
  background: var(--panel);
  box-shadow: var(--shadow-md);
}

.dashboard-card,
.info-card,
.cta-card { border-radius: 24px; }
.panel,
.feature-card,
.step-card,
.stat-card { border-radius: 18px; }

.dashboard-card,
.info-card,
.cta-card { padding: 24px; }
.panel,
.step-card,
.stat-card { padding: 20px; }

.dashboard-top,
.timer-header-row,
.leaderboard-item,
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dashboard-top { align-items: flex-start; margin-bottom: 20px; }
.dashboard-top h3,
.section-title,
.feature-card h4,
.info-card h4,
.question-text,
.quiz-footer p { margin: 0; }

.section-label {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
}

.live-badge,
.timer-status {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.live-badge,
.timer-status-running {
  background: rgba(21, 128, 61, 0.12);
  color: var(--success);
}

.timer-status-timesup {
  background: rgba(220, 38, 38, 0.12);
  color: var(--danger);
}

.dashboard-grid {
  grid-template-columns: 1.1fr 0.9fr;
  gap: 18px;
}

.question-text {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.45;
  margin-bottom: 18px;
}

.option-list,
.side-panels,
.leaderboard-list,
.info-list,
.form-grid,
.contact-list {
  display: grid;
  gap: 12px;
}

.option-item,
.leaderboard-item,
.form-grid input,
.form-grid textarea {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  transition: 0.2s ease;
}

.option-item:hover,
.leaderboard-item:hover {
  border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
  background: var(--primary-soft);
}

.timer-panel {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, var(--primary-soft), rgba(255,255,255,0));
}

.timer-warning {
  box-shadow: 0 0 0 1px rgba(217, 119, 6, 0.14), var(--shadow-md);
}

.timer-finished {
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.14), var(--shadow-md);
}

.timer-ring-wrap {
  display: flex;
  justify-content: center;
  margin: 14px 0 16px;
}

.timer-ring {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  padding: 10px;
  box-shadow: var(--shadow-sm);
}

.timer-ring-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
}

.timer {
  margin: 0;
  font-size: 32px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.timer-danger {
  color: var(--danger);
  animation: pulseText 0.9s ease-in-out infinite;
}

.timer-subtext,
.timer-meta {
  color: var(--muted);
  font-size: 12px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--border) 70%, transparent);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 1s linear;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
}

.progress-fill-warning {
  background: linear-gradient(90deg, var(--warning), var(--danger));
}

.timer-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.stats-section,
.content-section { padding: 36px 0 72px; }

.stats-grid,
.features-grid,
.steps-grid {
  display: grid;
  gap: 18px;
}

.stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.features-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 28px; }
.steps-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); margin-top: 28px; }

.stat-card { text-align: center; }
.stat-value {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 800;
}

.section-title {
  margin-bottom: 12px;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.section-title.small { font-size: clamp(24px, 3vw, 34px); }

.feature-card {
  overflow: hidden;
  transition: 0.22s ease;
}
.feature-card:hover { transform: translateY(-4px); }

.feature-image {
  height: 190px;
  overflow: hidden;
}
.feature-image img,
.about-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feature-icon,
.step-number {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--primary);
  color: white;
  box-shadow: 0 8px 18px rgba(31, 79, 214, 0.18);
}

.feature-icon { margin: 16px 20px 0; }
.feature-card h4 { margin: 16px 20px 8px; font-size: 20px; }
.feature-card p { margin: 0 20px 20px; }

.alt-bg {
  background: linear-gradient(180deg, rgba(127, 145, 173, 0.05), rgba(127, 145, 173, 0.02));
}

.info-card { padding: 20px; }
.about-image {
  height: 260px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 18px;
}
.info-card h4 { margin-bottom: 14px; font-size: 22px; }

.step-number { margin-bottom: 16px; font-weight: 800; }
.step-card p { margin: 0; }

.cta-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.form-grid input,
.form-grid textarea {
  width: 100%;
  color: var(--text);
  outline: none;
}

.form-grid input:focus,
.form-grid textarea:focus {
  border-color: color-mix(in srgb, var(--primary) 40%, var(--border));
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 10%, transparent);
}

.full-width { width: 100%; }

.quiz-footer {
  padding: 24px 0 36px;
  border-top: 1px solid var(--border);
}
.quiz-footer p { color: var(--muted); }
.footer-inner { flex-wrap: wrap; }

@keyframes pulseText {
  0%,100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.04); opacity: 0.92; }
}

@media (max-width: 1080px) {
  .hero-grid,
  .dashboard-grid,
  .two-col,
  .about-grid,
  .cta-card {
    grid-template-columns: 1fr;
  }

  .features-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .steps-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .nav-links { display: none; }
}

@media (max-width: 768px) {
  .header-inner {
    min-height: auto;
    padding: 14px 0;
    flex-wrap: wrap;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .hero-section { padding-top: 42px; }
  .hero-title { font-size: 34px; }
  .dashboard-card,
  .info-card,
  .cta-card,
  .panel,
  .stat-card,
  .step-card { padding: 18px; }

  .features-grid,
  .steps-grid,
  .stats-grid,
  .two-col,
  .about-grid { grid-template-columns: 1fr; }

  .timer-ring {
    width: 128px;
    height: 128px;
  }

  .timer { font-size: 28px; }
}
`;

const features = [
  {
    icon: Trophy,
    title: "Quiz setup made simple",
    text: "Create rounds, manage questions, and keep the full competition flow in one place.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Users,
    title: "Role-based access",
    text: "Separate access for admin, quiz master, and participants so the experience stays clean and controlled.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Clock3,
    title: "Timed question flow",
    text: "Run question-wise timers for a real competition feel without manual tracking.",
    image:
      "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: BarChart3,
    title: "Scores and rankings",
    text: "See live performance, track submissions, and publish results quickly after the quiz.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: ShieldCheck,
    title: "Reliable access control",
    text: "Protected routes and role permissions help keep the platform secure during live events.",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Sparkles,
    title: "Clean and practical UI",
    text: "A lighter, more product-like design that feels usable for real students, staff, and organizers.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
  },
];

const steps = [
  "Sign in as admin, quiz master, or participant",
  "Create the quiz and configure the round rules",
  "Participants join with the shared quiz code",
  "Host starts the quiz and controls the flow",
  "System evaluates answers and shows results",
];

const stats = [
  { value: "3", label: "User roles" },
  { value: "100%", label: "Web based" },
  { value: "Live", label: "Leaderboard support" },
  { value: "Secure", label: "Access control" },
];

const whyChoose = [
  "Clear role-based workflow",
  "Timed quiz experience",
  "Live leaderboard support",
  "Simple quiz join flow",
  "Cleaner design and better readability",
];

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay,
      ease: "easeOut",
    },
  }),
};

const TOTAL_TIME = 30;

export default function QuizLandingPageMerged() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("quiz-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    localStorage.setItem("quiz-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setHasFinished(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHasFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const progress = useMemo(() => (timeLeft / TOTAL_TIME) * 100, [timeLeft]);
  const isWarning = timeLeft <= 5 && timeLeft > 0;
  const timerStatus = hasFinished ? "Time's up" : "Running";

  const timerRingStyle = {
    background: `conic-gradient(${isWarning ? "var(--warning), var(--danger)" : "var(--primary), var(--secondary)"} ${progress}%, color-mix(in srgb, var(--border) 58%, transparent) ${progress}% 100%)`,
  };

  return (
    <>
      <style>{styles}</style>

      <div className="quiz-page">
        <header className="quiz-header">
          <div className="quiz-container header-inner">
            <div className="brand" onClick={() => scrollToSection("home")}>
              <div className="brand-icon">
                <Trophy size={20} />
              </div>
              <div>
                <p className="brand-subtitle">Quiz competition platform</p>
                <h1 className="brand-title">QuizSphere</h1>
              </div>
            </div>

            <nav className="nav-links">
              <button type="button" onClick={() => scrollToSection("features")}>Features</button>
              <button type="button" onClick={() => scrollToSection("about")}>About</button>
              <button type="button" onClick={() => scrollToSection("how-it-works")}>How it works</button>
              <button type="button" onClick={() => scrollToSection("contact")}>Contact</button>
            </nav>

            <div className="header-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate("/login")}>Login</button>
              <button type="button" className="btn btn-primary" onClick={() => navigate("/register")}>Start Quiz</button>
              <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
          </div>
        </header>

        <section id="home" className="hero-section section-anchor">
          <div className="quiz-container hero-grid">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="pill">Built for real quiz events</span>

              <h2 className="hero-title">Run quiz competitions with a cleaner and more reliable workflow.</h2>

              <p className="hero-text">
                QuizSphere helps schools, colleges, coaching centers, and event teams manage quizzes from registration to results without the clutter.
              </p>

              <div className="hero-buttons">
                <button type="button" className="btn btn-primary" onClick={() => navigate("/login")}>
                  Get started <ArrowRight size={18} />
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => scrollToSection("features")}>
                  <PlayCircle size={18} /> View features
                </button>
              </div>

              <div className="hero-points">
                <div><CheckCircle2 size={16} /> Better readability</div>
                <div><CheckCircle2 size={16} /> Timed quiz flow</div>
                <div><CheckCircle2 size={16} /> Live rankings</div>
              </div>
            </motion.div>

            <motion.div
              className="hero-visual-wrap"
              initial={{ opacity: 0, x: 35, y: 16 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
              <div className="dashboard-card">
                <div className="dashboard-top">
                  <div>
                    <p className="section-label">Live Quiz Dashboard</p>
                    <h3>General Knowledge Championship</h3>
                  </div>
                  <span className="live-badge">Live</span>
                </div>

                <div className="dashboard-grid">
                  <div className="panel">
                    <p className="section-label">Current Question</p>
                    <p className="question-text">Which planet is known as the Red Planet?</p>

                    <div className="option-list">
                      {["Mercury", "Venus", "Mars", "Jupiter"].map((opt) => (
                        <div key={opt} className="option-item">{opt}</div>
                      ))}
                    </div>
                  </div>

                  <div className="side-panels">
                    <div className={`panel timer-panel ${isWarning ? "timer-warning" : ""} ${hasFinished ? "timer-finished" : ""}`}>
                      <div className="timer-header-row">
                        <p className="section-label">Timer</p>
                        <span className={`timer-status timer-status-${timerStatus.toLowerCase().replace(/[^a-z]/g, "")}`}>
                          {timerStatus}
                        </span>
                      </div>

                      <div className="timer-ring-wrap">
                        <div className="timer-ring" style={timerRingStyle}>
                          <div className="timer-ring-inner">
                            <p className={`timer ${isWarning ? "timer-danger" : ""}`}>{formatTime(timeLeft)}</p>
                            <span className="timer-subtext">
                              {hasFinished ? "Question closed" : isWarning ? "Hurry up" : "Answer in time"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="progress-bar">
                        <div className={`progress-fill ${isWarning ? "progress-fill-warning" : ""}`} style={{ width: `${progress}%` }} />
                      </div>

                      <div className="timer-meta">
                        <span>{timeLeft}s left</span>
                        <span>{TOTAL_TIME}s total</span>
                      </div>
                    </div>

                    <div className="panel">
                      <p className="section-label">Top Leaderboard</p>
                      <div className="leaderboard-list">
                        {[["Raju", "18 pts"], ["Babu", "16 pts"], ["Shyam", "15 pts"]].map(([name, score], idx) => (
                          <div key={name} className="leaderboard-item">
                            <span>#{idx + 1} {name}</span>
                            <strong>{score}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="stats-section">
          <div className="quiz-container stats-grid">
            {stats.map((item, index) => (
              <motion.div
                key={item.label}
                className="stat-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={fadeUp}
                custom={index * 0.08}
              >
                <p className="stat-value">{item.value}</p>
                <p className="stat-label">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="features" className="content-section section-anchor">
          <div className="quiz-container">
            <span className="pill neutral">Features</span>
            <h3 className="section-title">Everything needed to run a complete quiz platform.</h3>
            <p className="section-text">A more grounded and product-like theme with better spacing, calmer colors, and cleaner hierarchy.</p>

            <div className="features-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    className="feature-card"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeUp}
                    custom={index * 0.08}
                    whileHover={{ y: -4 }}
                  >
                    <div className="feature-image">
                      <img src={feature.image} alt={feature.title} />
                    </div>
                    <div className="feature-icon">
                      <Icon size={20} />
                    </div>
                    <h4>{feature.title}</h4>
                    <p>{feature.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about" className="content-section alt-bg section-anchor">
          <div className="quiz-container two-col about-grid">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} custom={0}>
              <span className="pill neutral">About platform</span>
              <h3 className="section-title">Built for academic events, competition rounds, and structured quiz experiences.</h3>
              <p className="section-text">This version avoids the over-styled AI look and leans into a more believable product design system.</p>
              <p className="section-text">It works well for schools, colleges, coaching institutes, and team competitions where clarity matters more than flashy visuals.</p>
            </motion.div>

            <motion.div className="info-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} custom={0.15}>
              <div className="about-image">
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80"
                  alt="Quiz team collaboration"
                />
              </div>

              <h4>Why this version feels better</h4>
              <div className="info-list">
                {whyChoose.map((item) => (
                  <div key={item} className="info-item">
                    <CheckCircle2 size={18} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" className="content-section section-anchor">
          <div className="quiz-container">
            <span className="pill neutral">How it works</span>
            <h3 className="section-title">From registration to results in a few simple steps.</h3>

            <div className="steps-grid">
              {steps.map((step, idx) => (
                <motion.div
                  key={step}
                  className="step-card"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                  custom={idx * 0.08}
                >
                  <div className="step-number">{idx + 1}</div>
                  <p>{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="quiz-container">
            <motion.div className="cta-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} custom={0}>
              <div>
                <h3 className="section-title small">Ready to launch your next quiz competition?</h3>
                <p className="section-text">Start managing quizzes, participants, scores, and results from one reliable platform.</p>
              </div>

              <div className="cta-buttons">
                <button type="button" className="btn btn-primary" onClick={() => navigate("/register")}>Register now</button>
                <button type="button" className="btn btn-outline" onClick={() => navigate("/login")}>Login</button>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="contact" className="content-section alt-bg section-anchor">
          <div className="quiz-container two-col">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} custom={0}>
              <span className="pill neutral">Contact</span>
              <h3 className="section-title">Let’s bring your quiz platform online.</h3>
              <p className="section-text">Reach out for demos, setup help, or platform customization for your institution.</p>

              <div className="contact-list">
                <div><Mail size={18} /> support@quizsphere.com</div>
                <div><Phone size={18} /> +91 98765 43210</div>
                <div><MapPin size={18} /> Ahmedabad, Gujarat, India</div>
              </div>
            </motion.div>

            <motion.div className="info-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} custom={0.15}>
              <div className="form-grid">
                <input type="text" placeholder="Your name" />
                <input type="email" placeholder="Email address" />
                <input type="text" placeholder="Subject" />
                <textarea placeholder="Your message" rows="6" />
                <button type="button" className="btn btn-primary full-width" onClick={() => navigate("/login")}>Send message</button>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="quiz-footer">
          <div className="quiz-container footer-inner">
            <p>© 2026 QuizSphere. All rights reserved.</p>
            <div className="footer-links">
              <button type="button" onClick={() => scrollToSection("home")}>Home</button>
              <button type="button" onClick={() => scrollToSection("features")}>Features</button>
              <button type="button" onClick={() => scrollToSection("about")}>About</button>
              <button type="button" onClick={() => scrollToSection("how-it-works")}>How it works</button>
              <button type="button" onClick={() => scrollToSection("contact")}>Contact</button>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
