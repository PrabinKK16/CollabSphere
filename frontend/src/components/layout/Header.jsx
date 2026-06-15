import { useDispatch, useSelector } from "react-redux";
import { Moon, Sun, Bell } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toggleTheme } from "../../store/slices/uiSlice";

const Header = ({ title, subtitle, actions }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((s) => s.ui);
  const { unreadCount } = useSelector((s) => s.notification);
  const { currentWorkspace } = useSelector((s) => s.workspace);
  const isDark = theme === "dark";

  return (
    <header
      style={{
        height: "64px",
        flexShrink: 0,
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        borderBottom: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div>
        {title && (
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: isDark ? "#fff" : "#0f172a",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {actions && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginRight: "4px",
            }}
          >
            {actions}
          </div>
        )}

        <button
          onClick={() => dispatch(toggleTheme())}
          style={{
            padding: "8px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <Link
          to={
            currentWorkspace
              ? `/workspaces/${currentWorkspace._id}/notifications`
              : "/notifications"
          }
          style={{
            position: "relative",
            padding: "8px",
            borderRadius: "12px",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "16px",
                height: "16px",
                backgroundColor: "#ef4444",
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
