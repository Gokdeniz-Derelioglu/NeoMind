import React from "react";
import Navbar from "./Navbar";

const NoMoreJobs = () => {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Navbar />
      <div style={{
        textAlign: "center",
        padding: "40px 20px",
        maxWidth: 500
      }}>
        <div style={{
          fontSize: 80,
          marginBottom: 24,
          opacity: 0.7
        }}>
          🎉
        </div>
        <h2 style={{ 
          marginTop: 0, 
          fontWeight: 700, 
          fontSize: 28,
          color: "#2c3e50",
          marginBottom: 16
        }}>
          You've reviewed all available jobs!
        </h2>
        <p style={{
          fontSize: 18,
          color: "#6c757d",
          lineHeight: 1.6,
          marginBottom: 32
        }}>
          Great job exploring all the opportunities! New positions are added regularly, so check back soon for fresh openings.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "14px 28px",
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 25,
            border: "none",
            backgroundColor: "#1abc9c",
            color: "#ffffff",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 16px rgba(26, 188, 156, 0.3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(26, 188, 156, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(26, 188, 156, 0.3)";
          }}
        >
          🔄 Refresh & Start Over
        </button>
      </div>
    </div>
  );
};

export default NoMoreJobs;
