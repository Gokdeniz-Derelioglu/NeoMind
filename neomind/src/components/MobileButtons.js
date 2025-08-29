import React from "react";

const MobileButtons = ({ triggerSwipe }) => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      gap: 24,
      marginBottom: 24,
      marginTop: 16
    }}>
      <button
        onClick={() => triggerSwipe("left")}
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          border: "4px solid #ff6b6b",
          backgroundColor: "#ffffff",
          color: "#ff6b6b",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 20,
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(255, 107, 107, 0.3)",
          userSelect: "none",
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = "scale(0.95)";
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        ✕
      </button>
      <button
        onClick={() => triggerSwipe("right")}
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          border: "4px solid #51cf66",
          backgroundColor: "#ffffff",
          color: "#51cf66",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 20,
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(81, 207, 102, 0.3)",
          userSelect: "none",
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = "scale(0.95)";
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        ♥
      </button>
    </div>
  );
};

export default MobileButtons;
