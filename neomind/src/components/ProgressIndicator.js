import React from "react";

const ProgressIndicator = ({ currentIndex, totalJobs }) => {
  return (
    <div style={{
      position: "absolute",
      top: 80,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      padding: "10px 20px",
      borderRadius: 25,
      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
      fontSize: 16,
      color: "#2c3e50",
      fontWeight: 600,
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)"
    }}>
      📋 Job {currentIndex + 1} of {totalJobs}
    </div>
  );
};

export default ProgressIndicator;
