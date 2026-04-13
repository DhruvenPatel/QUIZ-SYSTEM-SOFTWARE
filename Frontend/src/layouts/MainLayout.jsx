import Navbar from "../components/Navbar";

const MainLayout = ({ children }) => {
  return (
    <div style={styles.wrapper}>
      <Navbar />
      <main style={styles.main}>{children}</main>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#f4f4f4",
  },
  main: {
    padding: "24px",
  },
};

export default MainLayout;