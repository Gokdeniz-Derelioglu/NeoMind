import React from "react";
import { animated } from "@react-spring/web";

const JobCard = ({ job, bind, props, isMobile }) => {
  return (
    <animated.div
      {...bind()}
      className="job-card"
      style={{
        x: props.x,
        rotateZ: props.rot,
        scale: props.scale,
        touchAction: "none",
        padding: 0,
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        borderRadius: 20,
        backgroundColor: "#ffffff",
        color: "#2c3e50",
        cursor: "grab",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        userSelect: "none",
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        border: "4px solid transparent",
        transition: "border 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      {/* Company Header */}
      <div style={{
        backgroundColor: "#f8f9fa",
        padding: "20px 24px",
        borderBottom: "1px solid #e9ecef"
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 32, marginRight: 16 }}>{job.company.logo}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#2c3e50" }}>
              {job.company.name}
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#6c757d" }}>
              {job.company.industry} • {job.company.size}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 14 }}>
          <span style={{ color: "#6c757d" }}>📍 {job.company.location}</span>
          <span style={{ color: "#6c757d" }}>⭐ {job.company.rating}</span>
          <span style={{ color: "#6c757d" }}>📅 {job.company.founded}</span>
        </div>
      </div>

      {/* Job Details */}
      <div style={{ padding: "24px" }}>
        <h2 style={{ 
          margin: "0 0 16px 0", 
          fontWeight: 700, 
          fontSize: 24,
          color: "#2c3e50"
        }}>
          {job.position}
        </h2>
        
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <span style={{ 
              backgroundColor: "#e3f2fd", 
              color: "#1976d2", 
              padding: "6px 12px", 
              borderRadius: 20, 
              fontSize: 12, 
              fontWeight: 600 
            }}>
              💰 {job.salary}
            </span>
            <span style={{ 
              backgroundColor: "#f3e5f5", 
              color: "#7b1fa2", 
              padding: "6px 12px", 
              borderRadius: 20, 
              fontSize: 12, 
              fontWeight: 600 
            }}>
              ⏰ {job.type}
            </span>
            <span style={{ 
              backgroundColor: "#e8f5e8", 
              color: "#388e3c", 
              padding: "6px 12px", 
              borderRadius: 20, 
              fontSize: 12, 
              fontWeight: 600 
            }}>
              📚 {job.experience}
            </span>
          </div>
        </div>

        <p style={{ 
          fontSize: 16, 
          lineHeight: 1.6, 
          color: "#495057",
          marginBottom: 20 
        }}>
          {job.description}
        </p>

        {/* Skills */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 600, color: "#2c3e50" }}>
            Required Skills:
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {job.skills.map((skill, idx) => (
              <span key={idx} style={{
                backgroundColor: "#f8f9fa",
                color: "#495057",
                padding: "6px 12px",
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 500,
                border: "1px solid #e9ecef"
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 600, color: "#2c3e50" }}>
            Benefits:
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {job.benefits.slice(0, 4).map((benefit, idx) => (
              <span key={idx} style={{
                backgroundColor: "#fff3e0",
                color: "#f57c00",
                padding: "4px 10px",
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 500
              }}>
                ✨ {benefit}
              </span>
            ))}
          </div>
        </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid #e9ecef"
              }}>
                <div style={{
                  fontSize: 12,
                  color: "#6c757d",
                  fontStyle: "italic"
                }}>
                  Posted {job.posted}
                </div>
                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "#1abc9c",
                    color: "#ffffff",
                    padding: "8px 16px",
                    borderRadius: 20,
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#16a085";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#1abc9c";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Apply Now →
                </a>
              </div>
      </div>
    </animated.div>
  );
};

export default JobCard;
