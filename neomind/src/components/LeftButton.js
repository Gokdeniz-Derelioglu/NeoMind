import React from "react";

const LeftButton = ({ triggerSwipe }) => {
  return (
    <button
      onClick={() => triggerSwipe("left")}
      style={{
        flexShrink: 0,
        width: 80,
        height: 80,
        borderRadius: "50%",
        border: "4px solid #ff6b6b",
        backgroundColor: "#ffffff",
        color: "#ff6b6b",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 24,
        transition: "all 0.3s ease",
        alignSelf: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 24px rgba(255, 107, 107, 0.3)",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(255, 107, 107, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 107, 107, 0.3)";
      }}
    >
      ✕
    </button>
  );
};

export default LeftButton;

