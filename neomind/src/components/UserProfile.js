import React, { useState, useEffect, useRef } from "react";
import { getUserById } from "../services/userService";
import { getAllJobs } from "../services/jobService";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const UserProfile = ({ userId: propUserId }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info and jobs
  useEffect(() => {
    const fetchData = async (uid) => {
      try {
        const user = await getUserById(uid);
        setUserInfo(user || {}); // Ensure it's at least an empty object

        const jobs = await getAllJobs();
        const filteredJobs = jobs.filter((job) => job?.appliedBy === uid);
        setAppliedJobs(filteredJobs || []);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (propUserId) {
      fetchData(propUserId);
    } else {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user?.uid) fetchData(user.uid);
        else setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [propUserId]);

  // CV upload handlers
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      setCvPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCv = () => {
    if (cvPreview) URL.revokeObjectURL(cvPreview);
    setCvFile(null);
    setCvPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Input handlers
  const handleInputChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (skill) => {
    if (!skill) return;
    setUserInfo((prev) => {
      if (!prev?.skills?.includes(skill)) {
        return { ...prev, skills: [...(prev.skills || []), skill] };
      }
      return prev;
    });
  };

  const handleSkillRemove = (skill) => {
    setUserInfo((prev) => ({
      ...prev,
      skills: prev?.skills?.filter((s) => s !== skill) || [],
    }));
  };

  const handleJobRemove = (index) => {
    setAppliedJobs((prev) => prev?.filter((_, i) => i !== index) || []);
  };

  if (loading) return <div>Loading profile...</div>;
  if (!userInfo) return <div>User not found.</div>;

  const displayInitials = (userInfo?.name || "JD")
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 20,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 32,
          paddingBottom: 20,
          borderBottom: "2px solid #f0f0f0",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            backgroundColor: "#1abc9c",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            color: "#ffffff",
            fontWeight: "bold",
          }}
        >
          {displayInitials || "JD"}
        </div>
        <h1 style={{ margin: 0, color: "#2c3e50", fontSize: 28 }}>
          {userInfo?.name || "Unknown Name"}
        </h1>
        <p style={{ margin: "8px 0 0 0", color: "#7f8c8d", fontSize: 16 }}>
          {userInfo?.title || "Unknown Title"}
        </p>
      </div>

      {/* CV Upload */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ color: "#2c3e50", marginBottom: 16 }}>📄 Resume/CV</h3>
        <div
          style={{
            border: "2px dashed #bdc3c7",
            borderRadius: 8,
            padding: 24,
            textAlign: "center",
            backgroundColor: "#f8f9fa",
          }}
        >
          {cvFile ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ color: "#27ae60", fontSize: 48 }}>✅</span>
                <p style={{ margin: "8px 0", color: "#2c3e50", fontWeight: 600 }}>
                  {cvFile?.name}
                </p>
                <p style={{ margin: "4px 0", color: "#7f8c8d", fontSize: 14 }}>
                  {(cvFile?.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => cvPreview && window.open(cvPreview, "_blank")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#3498db",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  👁️ View
                </button>
                <button
                  onClick={handleRemoveCv}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#e74c3c",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ color: "#bdc3c7", fontSize: 48 }}>📁</span>
                <p style={{ margin: "8px 0", color: "#7f8c8d" }}>
                  Upload your resume or CV
                </p>
                <p style={{ margin: "4px 0", color: "#95a5a6", fontSize: 12 }}>
                  PDF, DOC, DOCX files accepted
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#1abc9c",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                📤 Upload CV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Info */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ color: "#2c3e50", marginBottom: 16 }}>👤 Personal Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {["name", "email", "phone", "location"].map((field) => (
            <div key={field}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#2c3e50",
                  fontWeight: 600,
                }}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                value={userInfo?.[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #ecf0f1",
                  borderRadius: 6,
                  fontSize: 16,
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <label
            style={{ display: "block", marginBottom: 8, color: "#2c3e50", fontWeight: 600 }}
          >
            Professional Title
          </label>
          <input
            type="text"
            value={userInfo?.title || ""}
            onChange={(e) => handleInputChange("title", e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #ecf0f1",
              borderRadius: 6,
              fontSize: 16,
            }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label
            style={{ display: "block", marginBottom: 8, color: "#2c3e50", fontWeight: 600 }}
          >
            Bio
          </label>
          <textarea
            value={userInfo?.bio || ""}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #ecf0f1",
              borderRadius: 6,
              fontSize: 16,
              resize: "vertical",
            }}
          />
        </div>
      </div>

      {/* Skills */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ color: "#2c3e50", marginBottom: 16 }}>🛠️ Skills</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {userInfo?.skills?.map((skill, idx) => (
            <span
              key={idx}
              style={{
                backgroundColor: "#e3f2fd",
                color: "#1976d2",
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {skill}
              <button
                onClick={() => handleSkillRemove(skill)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#1976d2",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Add a skill..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSkillAdd(e.target.value.trim());
                e.target.value = "";
              }
            }}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "2px solid #ecf0f1",
              borderRadius: 6,
              fontSize: 14,
            }}
          />
          <button
            onClick={(e) => {
              const input = e.target.previousElementSibling;
              handleSkillAdd(input.value.trim());
              input.value = "";
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1abc9c",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Applied Jobs */}
      <div>
        <h3 style={{ color: "#2c3e50", marginBottom: 16 }}>
          📋 Applied Jobs ({appliedJobs?.length || 0})
        </h3>
        {appliedJobs?.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#7f8c8d",
              backgroundColor: "#f8f9fa",
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>📝</span>
            <p style={{ margin: 0, fontSize: 16 }}>No jobs applied yet</p>
            <p style={{ marginTop: 8, fontSize: 14 }}>Start swiping to find your dream job!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {appliedJobs.map((job, idx) => (
              <div
                key={idx}
                style={{
                  padding: 16,
                  border: "1px solid #ecf0f1",
                  borderRadius: 8,
                  backgroundColor: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 4px 0", color: "#2c3e50" }}>
                    {job?.position || "Unknown Position"}
                  </h4>
                  <p style={{ margin: "0 0 4px 0", color: "#7f8c8d", fontSize: 14 }}>
                    {job?.company?.name || "Unknown Company"} • {job?.company?.location || "Unknown Location"}
                  </p>
                  <p style={{ margin: 0, color: "#95a5a6", fontSize: 12 }}>
                    Applied on {job?.appliedDate || "N/A"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "capitalize",
                      backgroundColor:
                        job?.status === "accepted"
                          ? "#d4edda"
                          : job?.status === "pending"
                          ? "#fff3cd"
                          : "#f8d7da",
                      color:
                        job?.status === "accepted"
                          ? "#155724"
                          : job?.status === "pending"
                          ? "#856404"
                          : "#721c24",
                    }}
                  >
                    {job?.status || "pending"}
                  </span>
                  {job?.applyLink && (
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "#3498db",
                        color: "#ffffff",
                        padding: "4px 8px",
                        borderRadius: 12,
                        textDecoration: "none",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Apply
                    </a>
                  )}
                  <button
                    onClick={() => handleJobRemove(idx)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e74c3c",
                      cursor: "pointer",
                      fontSize: 16,
                      padding: 4,
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
