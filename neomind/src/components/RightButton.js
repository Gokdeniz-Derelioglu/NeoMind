import React from "react";

const RightButton = ({ triggerSwipe }) => {
  return (
    <button
      onClick={() => triggerSwipe("right")}
      style={{
        flexShrink: 0,
        width: 80,
        height: 80,
        borderRadius: "50%",
        border: "4px solid #51cf66",
        backgroundColor: "#ffffff",
        color: "#51cf66",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 24,
        transition: "all 0.3s ease",
        alignSelf: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 24px rgba(81, 207, 102, 0.3)",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(81, 207, 102, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(81, 207, 102, 0.3)";
      }}
    >
      ♥
    </button>
  );
};

export default RightButton;

