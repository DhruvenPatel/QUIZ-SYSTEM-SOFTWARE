import { useEffect, useMemo, useState } from "react";
import { Users, Search, Mail, CalendarDays, Eye } from "lucide-react";
import api from "../../api/axios";

const theme = {
  bg: "#f4f7fb",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  primary: "#2563eb",
  primarySoft: "rgba(37, 99, 235, 0.08)",
  shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const StatCard = ({ icon, title, value, subline }) => {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIconWrap}>{icon}</div>
      <div>
        <p style={styles.statTitle}>{title}</p>
        <h3 style={styles.statValue}>{value}</h3>
        <p style={styles.statSubline}>{subline}</p>
      </div>
    </div>
  );
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Members = () => {
  const [search, setSearch] = useState("");
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState({
    totalParticipants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/users/participants");

      setParticipants(data?.data || []);
      setStats(
        data?.stats || {
          totalParticipants: 0,
        }
      );
    } catch (err) {
      console.error("Failed to fetch participants:", err);
      setError(
        err?.response?.data?.message || "Failed to load members data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const filteredParticipants = useMemo(() => {
    const q = search.toLowerCase();

    return participants.filter((item) => {
      return (
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.role?.toLowerCase().includes(q)
      );
    });
  }, [participants, search]);

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <p style={styles.kicker}>Super Admin / User Management</p>
          <h1 style={styles.title}>Members</h1>
          <p style={styles.subline}>
            View all registered participants on the platform and manage member
            visibility from one place.
          </p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          icon={<Users size={20} />}
          title="Total Members"
          value={stats.totalParticipants}
          subline="All registered participant accounts on platform"
        />
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>All Members</h2>
            <p style={styles.cardSubline}>
              Search and review all participant accounts available on the
              platform.
            </p>
          </div>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchWrap}>
            <Search size={18} color={theme.muted} />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {loading ? (
          <div style={styles.stateBox}>Loading members...</div>
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Member</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Joined At</th>
                </tr>
              </thead>

              <tbody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((item) => (
                    <tr key={item._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.userCell}>
                          <div style={styles.avatar}>
                            {item.name?.charAt(0)?.toUpperCase() || "M"}
                          </div>
                          <div>
                            <p style={styles.userName}>{item.name || "-"}</p>
                            <p style={styles.userMeta}>{item._id}</p>
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.inlineRow}>
                          <Mail size={14} />
                          <span>{item.email || "-"}</span>
                        </div>
                      </td>

                      <td style={styles.td}>
                        {item.role === "participant" ? "Participant" : item.role}
                      </td>

                      <td style={styles.td}>
                        <div style={styles.inlineRow}>
                          <CalendarDays size={14} />
                          <span>{formatDate(item.joinedAt)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={styles.emptyState}>
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
    maxWidth: "780px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
    background: theme.primarySoft,
    color: theme.primary,
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
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

  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },

  searchWrap: {
    flex: 1,
    minWidth: "280px",
    height: "46px",
    borderRadius: "12px",
    border: `1px solid ${theme.border}`,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 14px",
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    color: theme.text,
    background: "transparent",
  },

  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: "820px",
  },

  th: {
    textAlign: "left",
    fontSize: "12px",
    color: theme.muted,
    fontWeight: 700,
    padding: "14px 16px",
    borderBottom: `1px solid ${theme.border}`,
    whiteSpace: "nowrap",
  },

  tr: {
    background: "#fff",
  },

  td: {
    padding: "16px",
    borderBottom: `1px solid ${theme.border}`,
    fontSize: "14px",
    color: theme.text,
    verticalAlign: "middle",
  },

  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: theme.primarySoft,
    color: theme.primary,
    display: "grid",
    placeItems: "center",
    fontSize: "15px",
    fontWeight: 800,
    flexShrink: 0,
  },

  userName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: theme.text,
  },

  userMeta: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: theme.muted,
    maxWidth: "240px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  inlineRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: theme.muted,
    fontSize: "13px",
  },

  iconButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: `1px solid ${theme.border}`,
    background: "#fff",
    color: theme.text,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },

  emptyState: {
    padding: "28px 16px",
    textAlign: "center",
    color: theme.muted,
    fontSize: "14px",
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
    background: "rgba(220, 38, 38, 0.08)",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: 600,
  },
};

export default Members;