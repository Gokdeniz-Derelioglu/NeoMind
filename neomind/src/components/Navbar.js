// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";

const navButtonStyle = {
  marginLeft: 12,
  padding: "6px 14px",
  borderRadius: 6,
  backgroundColor: "transparent",
  border: "none",
  color: "#ecf0f1",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 500,
  transition: "background-color 0.3s ease",
};

export default function Navbar({ user, onLogout }) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: 56,
        backgroundColor: "#2c3e50",
        color: "#ecf0f1",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box",
        userSelect: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        zIndex: 9999,
        padding: "0 24px",
        margin: 0,
        overflowX: "hidden",
      }}
    >
      <Link
        to="/"
        style={{
          color: "#ecf0f1",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 18,
          userSelect: "none",
        }}
      >
        NeoMind
      </Link>

      <div style={{ display: "flex", alignItems: "center" }}>
        {user && (
          <Link
            to="/profile"
            style={{
              ...navButtonStyle,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            Profile
          </Link>
        )}

        {user ? (
          <button
            onClick={onLogout}
            style={navButtonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#34495e")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            style={{ ...navButtonStyle, textDecoration: "none" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#34495e")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
