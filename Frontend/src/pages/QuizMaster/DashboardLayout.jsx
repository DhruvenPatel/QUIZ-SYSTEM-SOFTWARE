import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const theme = {
  bg: "#f4f7fb",
};

const SIDEBAR_WIDTH = 280;

const DashboardLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 920 : false
  );

  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyBackground = document.body.style.background;
    const originalBodyMinHeight = document.body.style.minHeight;
    const originalBodyOverflowX = document.body.style.overflowX;

    document.body.style.margin = "0";
    document.body.style.background = theme.bg;
    document.body.style.minHeight = "100vh";
    document.body.style.overflowX = "hidden";

    const handleResize = () => setIsMobile(window.innerWidth <= 920);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.background = originalBodyBackground;
      document.body.style.minHeight = originalBodyMinHeight;
      document.body.style.overflowX = originalBodyOverflowX;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div style={styles.page}>
      {!isMobile && <Sidebar />}

      <main
        style={{
          ...styles.main,
          marginLeft: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
        }}
      >
        <div style={styles.mainInner}>{children}</div>
      </main>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: theme.bg,
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  main: {
    minHeight: "100vh",
    padding: "20px",
    boxSizing: "border-box",
  },

  mainInner: {
    maxWidth: "1440px",
    margin: "0 auto",
    display: "grid",
    gap: "20px",
    minWidth: 0,
  },
};

export default DashboardLayout;