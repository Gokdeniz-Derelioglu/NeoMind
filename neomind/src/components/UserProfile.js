import React, { useState, useRef } from "react";

const UserProfile = ({ appliedJobs = [], onJobRemove }) => {
  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    title: "Frontend Developer",
    experience: "3-5 years",
    skills: ["React", "JavaScript", "TypeScript", "Node.js", "CSS", "HTML"],
    bio: "Passionate frontend developer with experience in building modern web applications. Love creating user-friendly interfaces and solving complex problems."
  });

  const [cvFile, setCvFile] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCvFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setCvPreview(previewUrl);
    }
  };

  const handleRemoveCv = () => {
    setCvFile(null);
    if (cvPreview) {
      URL.revokeObjectURL(cvPreview);
      setCvPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillAdd = (skill) => {
    if (skill && !userInfo.skills.includes(skill)) {
      setUserInfo(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setUserInfo(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <div style={{
      maxWidth: 800,
      margin: "0 auto",
      padding: "20px",
      backgroundColor: "#ffffff",
      borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
    }}>
      {/* Header */}
      <div style={{
        textAlign: "center",
        marginBottom: 32,
        paddingBottom: 20,
        borderBottom: "2px solid #f0f0f0"
      }}>
        <div style={{
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
          fontWeight: "bold"
        }}>
          {userInfo.name.split(' ').map(n => n[0]).join('')}
        </div>
        <h1 style={{ margin: 0, color: "#2c3e50", fontSize: 28 }}>{userInfo.name}</h1>
        <p style={{ margin: "8px 0 0 0", color: "#7f8c8d", fontSize: 16 }}>{userInfo.title}</p>
      </div>

      {/* CV Upload Section */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ color: "#2c3e50", marginBottom: 16 }}>📄 Resume/CV</h3>
        <div style={{
          border: "2px dashed #bdc3c7",
          borderRadius: 8,
          padding: 24,
          textAlign: "center",
          backgroundColor: "#f8f9fa"
        }}>
          {cvFile ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ color: "#27ae60", fontSize: 48 }}>✅</span>
                <p style={{ margin: "8px 0", color: "#2c3e50", fontWeight: 600 }}>
                  {cvFile.name}
                </p>
                <p style={{ margin: "4px 0", color: "#7f8c8d", fontSize: 14 }}>
                  {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => window.open(cvPreview, '_blank')}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#3498db",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600
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
                    fontWeight: 600
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
                  transition: "background-color 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#16a085"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1abc9c"}
              >
                📤 Upload CV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ color: "#2c3e50", marginBottom: 16 }}>👤 Personal Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#2c3e50", fontWeight: 600 }}>
              Full Name
            </label>
            <input
              type="text"
              value={userInfo.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ecf0f1",
                borderRadius: 6,
                fontSize: 16,
                boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#2c3e50", fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={userInfo.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ecf0f1",
                borderRadius: 6,
                fontSize: 16,
                boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#2c3e50", fontWeight: 600 }}>
              Phone
            </label>
            <input
              type="tel"
              value={userInfo.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ecf0f1",
                borderRadius: 6,
                fontSize: 16,
                boxSizing: "border-box"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, color: "#2c3e50", fontWeight: 600 }}>
              Location
            </label>
            <input
              type="text"
              value={userInfo.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ecf0f1",
                borderRadius: 6,
                fontSize: 16,
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#2c3e50", fontWeight: 600 }}>
            Professional Title
          </label>
          <input
            type="text"
            value={userInfo.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #ecf0f1",
              borderRadius: 6,
              fontSize: 16,
              boxSizing: "border-box"
            }}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#2c3e50", fontWeight: 600 }}>
            Bio
          </label>
          <textarea
            value={userInfo.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #ecf0f1",
              borderRadius: 6,
              fontSize: 16,
              boxSizing: "border-box",
              resize: "vertical"
            }}
          />
        </div>
      </div>

      {/* Skills Section */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ color: "#2c3e50", marginBottom: 16 }}>🛠️ Skills</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {userInfo.skills.map((skill, index) => (
            <span
              key={index}
              style={{
                backgroundColor: "#e3f2fd",
                color: "#1976d2",
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 8
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
                  padding: 0,
                  marginLeft: 4
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
              if (e.key === 'Enter') {
                handleSkillAdd(e.target.value.trim());
                e.target.value = '';
              }
            }}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "2px solid #ecf0f1",
              borderRadius: 6,
              fontSize: 14
            }}
          />
          <button
            onClick={(e) => {
              const input = e.target.previousElementSibling;
              handleSkillAdd(input.value.trim());
              input.value = '';
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1abc9c",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Applied Jobs Section */}
      <div>
        <h3 style={{ color: "#2c3e50", marginBottom: 16 }}>
          📋 Applied Jobs ({appliedJobs.length})
        </h3>
        {appliedJobs.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#7f8c8d",
            backgroundColor: "#f8f9fa",
            borderRadius: 8
          }}>
            <span style={{ fontSize: 48, marginBottom: 16, display: "block" }}>📝</span>
            <p style={{ margin: 0, fontSize: 16 }}>No jobs applied yet</p>
            <p style={{ margin: "8px 0 0 0", fontSize: 14 }}>Start swiping to find your dream job!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {appliedJobs.map((job, index) => (
              <div
                key={index}
                style={{
                  padding: 16,
                  border: "1px solid #ecf0f1",
                  borderRadius: 8,
                  backgroundColor: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 4px 0", color: "#2c3e50" }}>{job.position}</h4>
                  <p style={{ margin: "0 0 4px 0", color: "#7f8c8d", fontSize: 14 }}>
                    {job.company.name} • {job.company.location}
                  </p>
                  <p style={{ margin: 0, color: "#95a5a6", fontSize: 12 }}>
                    Applied on {job.appliedDate}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{
                    padding: "4px 8px",
                    backgroundColor: job.status === "pending" ? "#fff3cd" : 
                                   job.status === "accepted" ? "#d4edda" : "#f8d7da",
                    color: job.status === "pending" ? "#856404" : 
                          job.status === "accepted" ? "#155724" : "#721c24",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "capitalize"
                  }}>
                    {job.status}
                  </span>
                  {job.applyLink && (
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
                        transition: "background-color 0.3s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2980b9"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3498db"}
                    >
                      Apply
                    </a>
                  )}
                  <button
                    onClick={() => onJobRemove && onJobRemove(index)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e74c3c",
                      cursor: "pointer",
                      fontSize: 16,
                      padding: "4px"
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
