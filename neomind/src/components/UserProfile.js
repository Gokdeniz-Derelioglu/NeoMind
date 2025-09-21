// src/components/UserProfile.js
import React, { useState, useEffect, useRef } from "react";
import { getUserById, updateUser } from "../services/userService";
import { addCV } from "../services/cvService"; // <- updated import
import { getAuth, onAuthStateChanged } from "firebase/auth";

const UserProfile = ({ userId: propUserId }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const fileInputRef = useRef(null);
  const skillInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);
  const [error, setError] = useState("");

  const [uid, setUid] = useState(propUserId || "");

  useEffect(() => {
    let unsub = null;

    const fetchData = async (uidToFetch) => {
      setLoading(true);
      setError("");
      try {
        const user = await getUserById(uidToFetch);
        const normalized = {
          id: user?.id ?? uidToFetch,
          name: user?.name ?? "",
          email: user?.email ?? "",
          phone: user?.phone ?? "",
          location: user?.location ?? "",
          title: user?.title ?? "",
          bio: user?.bio ?? "",
          skills: Array.isArray(user?.skills) ? user.skills : [],
          appliedJobs: Array.isArray(user?.appliedJobs) ? user.appliedJobs : [],
          cvText: user?.cvText ?? "",
          cvId: user?.cvId ?? "",
          ...user,
        };
        setUserInfo(normalized);
        setAppliedJobs(normalized.appliedJobs || []);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load profile");
        setUserInfo(null);
        setAppliedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    if (propUserId) {
      fetchData(propUserId);
      setUid(propUserId);
    } else {
      const auth = getAuth();
      unsub = onAuthStateChanged(auth, (u) => {
        if (u?.uid) {
          setUid(u.uid);
          fetchData(u.uid);
        } else {
          setLoading(false);
          setUserInfo(null);
        }
      });
    }

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [propUserId]);

  useEffect(() => {
    return () => {
      if (cvPreview) URL.revokeObjectURL(cvPreview);
    };
  }, [cvPreview]);

  const safe = (v) => (typeof v === "string" ? v : "");

  // Save basic profile fields
  const handleSaveProfile = async () => {
    if (!userInfo?.id) return;
    setSaving(true);
    setError("");
    try {
      const updates = {
        name: userInfo.name ?? "",
        email: userInfo.email ?? "",
        phone: userInfo.phone ?? "",
        location: userInfo.location ?? "",
        title: userInfo.title ?? "",
        bio: userInfo.bio ?? "",
      };
      await updateUser(userInfo.id, updates);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Skills
  const handleSkillAdd = async (skill) => {
    if (!skill || !userInfo?.id) return;
    skill = skill.trim();
    if (!skill) return;
    if ((userInfo.skills || []).includes(skill)) return;

    const newSkills = [...(userInfo.skills || []), skill];
    setUserInfo((prev) => ({ ...prev, skills: newSkills }));
    try {
      await updateUser(userInfo.id, { skills: newSkills });
    } catch (err) {
      console.error("Failed to add skill:", err);
      setError("Failed to add skill");
      setUserInfo((prev) => ({ ...prev, skills: prev.skills?.filter((s) => s !== skill) || [] }));
    }
  };

  const handleSkillRemove = async (skillToRemove) => {
    if (!userInfo?.id) return;
    const newSkills = (userInfo.skills || []).filter((s) => s !== skillToRemove);
    setUserInfo((prev) => ({ ...prev, skills: newSkills }));
    try {
      await updateUser(userInfo.id, { skills: newSkills });
    } catch (err) {
      console.error("Failed to remove skill:", err);
      setError("Failed to remove skill");
      setUserInfo((prev) => ({ ...prev, skills: [...(prev.skills || []), skillToRemove] }));
    }
  };

  // Job removal (local)
  const handleJobRemove = (index) => {
    const newJobs = (appliedJobs || []).filter((_, i) => i !== index);
    setAppliedJobs(newJobs);
    setUserInfo((prev) => ({ ...prev, appliedJobs: newJobs }));
    // optionally persist to backend: updateUser(userInfo.id, { appliedJobs: newJobs })
  };

  // CV parsing: upload file, post to parser, save parsed text via updateUser
  const handleFileUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file || !uid) return;

    if (cvPreview) URL.revokeObjectURL(cvPreview);
    setCvFile(file);
    const preview = URL.createObjectURL(file);
    setCvPreview(preview);

    setParseLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const parserUrl = process.env.REACT_APP_PARSER_URL || "http://localhost:8000/parse-cv";
      const res = await fetch(parserUrl, { method: "POST", body: formData });

      if (!res.ok) {
        let body = "";
        try { body = await res.text(); } catch (_) {}
        throw new Error(`Parser responded ${res.status} ${body}`);
      }

      const json = await res.json();
      const parsedText = json?.text ?? json?.parsedText ?? "";

      // Save CV in separate collection and link to user
      const cvData = {
        fileName: file.name,
        size: file.size,
        text: parsedText,
      };
      const savedCv = await addCV(cvData, uid);

      setUserInfo((prev) => ({ ...prev, cvText: parsedText, cvId: savedCv.id }));
    } catch (err) {
      console.error("Failed to parse CV:", err);
      setError("Failed to parse CV. Check parser or REACT_APP_PARSER_URL.");
    } finally {
      setParseLoading(false);
    }
  };

  const handleRemoveCv = async () => {
    if (cvPreview) URL.revokeObjectURL(cvPreview);
    setCvPreview(null);
    setCvFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (userInfo?.id) {
      try {
        await updateUser(userInfo.id, { cvText: "", cvId: "" });
        setUserInfo((prev) => ({ ...prev, cvText: "", cvId: "" }));
      } catch (err) {
        console.error("Failed to clear CV:", err);
        setError("Failed to clear CV text");
      }
    } else {
      setUserInfo((prev) => ({ ...prev, cvText: "", cvId: "" }));
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!userInfo) return <div>User not found.</div>;

  const initials = ((userInfo.name ?? "JD").trim() || "JD")
    .split(/\s+/).map(s => s[0]).join("").slice(0,3).toUpperCase();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20, backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 6px 30px rgba(0,0,0,0.08)", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32, paddingBottom: 20, borderBottom: "2px solid #f0f0f0" }}>
        <div style={{ width:100, height:100, borderRadius:"50%", backgroundColor:"#1abc9c", margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, color:"#fff", fontWeight:700 }}>
          {initials}
        </div>
        <h1 style={{ margin:0, color:"#2c3e50", fontSize:28 }}>{safe(userInfo.name) || "Unknown Name"}</h1>
        <p style={{ margin:"8px 0 0 0", color:"#7f8c8d", fontSize:16 }}>{safe(userInfo.title) || "Unknown Title"}</p>
      </div>

      {/* Action row */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginBottom:12 }}>
        <button onClick={() => {
          if (!userInfo?.id) return;
          setLoading(true);
          getUserById(userInfo.id).then(u => {
            setUserInfo({
              id: u?.id ?? userInfo.id,
              name: u?.name ?? "",
              email: u?.email ?? "",
              phone: u?.phone ?? "",
              location: u?.location ?? "",
              title: u?.title ?? "",
              bio: u?.bio ?? "",
              skills: Array.isArray(u?.skills) ? u.skills : [],
              appliedJobs: Array.isArray(u?.appliedJobs) ? u.appliedJobs : [],
              cvText: u?.cvText ?? ""
            });
            setAppliedJobs((u?.appliedJobs) || []);
          }).catch(err => {
            console.error("Failed reload profile:", err);
            setError("Failed to reload profile");
          }).finally(() => setLoading(false));
        }} style={{ background:"transparent", border:"1px solid #d0d6d9", color:"#2c3e50", padding:"8px 14px", borderRadius:8, cursor:"pointer" }}>
          Reset
        </button>

        <button onClick={handleSaveProfile} disabled={saving} style={{ backgroundColor:"#1abc9c", color:"#fff", border:"none", padding:"8px 16px", borderRadius:8, fontWeight:700, cursor:"pointer" }}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>

      {/* CV Upload */}
      <div style={{ marginBottom:32 }}>
        <h3 style={{ color:"#2c3e50", marginBottom:16 }}>📄 Resume / CV</h3>
        <div style={{ border:"2px dashed #bdc3c7", borderRadius:8, padding:24, textAlign:"center", backgroundColor:"#f8f9fa" }}>
          {cvFile ? (
            <>
              <div style={{ marginBottom:16 }}>
                <span style={{ color:"#27ae60", fontSize:48 }}>✅</span>
                <p style={{ margin:"8px 0", color:"#2c3e50", fontWeight:600 }}>{cvFile.name}</p>
                <p style={{ margin:"4px 0", color:"#7f8c8d", fontSize:14 }}>{(cvFile.size/1024/1024).toFixed(2)} MB</p>
              </div>
              <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
                <button onClick={() => cvPreview && window.open(cvPreview, "_blank")} style={{ padding:"8px 16px", backgroundColor:"#3498db", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontWeight:700 }}>👁️ View</button>
                <button onClick={handleRemoveCv} style={{ padding:"8px 16px", backgroundColor:"#e74c3c", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontWeight:700 }}>🗑️ Remove</button>
              </div>
              <div style={{ marginTop: 12 }}>
                <small style={{ color:"#7f8c8d" }}>{parseLoading ? "Parsing CV..." : userInfo?.cvText ? "Parsed CV text saved to profile." : "No parsed CV text saved."}</small>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom:16 }}>
                <span style={{ color:"#bdc3c7", fontSize:48 }}>📁</span>
                <p style={{ margin:"8px 0", color:"#7f8c8d" }}>Upload your resume or CV</p>
                <p style={{ margin:"4px 0", color:"#95a5a6", fontSize:12 }}>PDF, DOC, DOCX files accepted</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display:"none" }} />
              <button onClick={() => fileInputRef.current?.click()} style={{ padding:"12px 24px", backgroundColor:"#1abc9c", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700 }}>📤 Upload CV</button>

              {userInfo?.cvText && (
                <div style={{ marginTop:12, textAlign:"left", background:"#fff", padding:12, borderRadius:8, border:"1px solid #eee" }}>
                  <strong style={{ display:"block", marginBottom:6 }}>Saved / Parsed CV excerpt</strong>
                  <div style={{ maxHeight:160, overflow:"auto", color:"#444", fontSize:13, lineHeight:1.4 }}>
                    {userInfo.cvText.slice(0, 200)}{userInfo.cvText.length > 200 ? "…" : ""}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Personal Info */}
      <div style={{ marginBottom:32 }}>
        <h3 style={{ color:"#2c3e50", marginBottom:16 }}>👤 Personal Information</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {["name","email","phone","location"].map(field => (
            <div key={field}>
              <label style={{ display:"block", marginBottom:8, color:"#2c3e50", fontWeight:600 }}>{field.charAt(0).toUpperCase()+field.slice(1)}</label>
              <input
                type={field==="email" ? "email" : field==="phone" ? "tel" : "text"}
                value={userInfo?.[field] ?? ""}
                onChange={(e) => setUserInfo((p)=>({...p,[field]: e.target.value}))}
                style={{ width:"100%", padding:"12px", border:"2px solid #ecf0f1", borderRadius:6, fontSize:16 }}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop:16 }}>
          <label style={{ display:"block", marginBottom:8, color:"#2c3e50", fontWeight:600 }}>Professional Title</label>
          <input type="text" value={userInfo?.title ?? ""} onChange={(e)=>setUserInfo((p)=>({...p, title: e.target.value}))} style={{ width:"100%", padding:"12px", border:"2px solid #ecf0f1", borderRadius:6, fontSize:16 }} />
        </div>
        <div style={{ marginTop:16 }}>
          <label style={{ display:"block", marginBottom:8, color:"#2c3e50", fontWeight:600 }}>Bio</label>
          <textarea value={userInfo?.bio ?? ""} onChange={(e)=>setUserInfo((p)=>({...p, bio: e.target.value}))} rows={4} style={{ width:"100%", padding:"12px", border:"2px solid #ecf0f1", borderRadius:6, fontSize:16, resize:"vertical" }} />
        </div>
      </div>

      {/* Skills */}
      <div style={{ marginBottom:32 }}>
        <h3 style={{ color:"#2c3e50", marginBottom:16 }}>🛠️ Skills</h3>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
          {(userInfo?.skills || []).map((skill, idx) => (
            <span key={idx} style={{ backgroundColor:"#e3f2fd", color:"#1976d2", padding:"6px 12px", borderRadius:20, fontSize:14, fontWeight:500, display:"flex", alignItems:"center", gap:8 }}>
              {skill}
              <button onClick={()=>handleSkillRemove(skill)} style={{ background:"none", border:"none", color:"#1976d2", cursor:"pointer", fontSize:16 }}>×</button>
            </span>
          ))}
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <input ref={skillInputRef} type="text" placeholder="Add a skill..." onKeyDown={(e)=>{ if (e.key==="Enter"){ e.preventDefault(); const v = e.target.value.trim(); if (v) { handleSkillAdd(v); e.target.value = ""; } }}} style={{ flex:1, padding:"8px 12px", border:"2px solid #ecf0f1", borderRadius:6, fontSize:14 }} />
          <button onClick={()=>{ const input = skillInputRef.current; const v = input?.value?.trim(); if (v){ handleSkillAdd(v); input.value=""; }}} style={{ padding:"8px 16px", backgroundColor:"#1abc9c", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontWeight:600 }}>Add</button>
        </div>
      </div>

      {/* Applied Jobs */}
      <div>
        <h3 style={{ color:"#2c3e50", marginBottom:16 }}>📋 Applied Jobs ({(appliedJobs || []).length})</h3>
        {(appliedJobs || []).length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 20px", color:"#7f8c8d", backgroundColor:"#f8f9fa", borderRadius:8 }}>
            <span style={{ fontSize:48, marginBottom:16, display:"block" }}>📝</span>
            <p style={{ margin:0, fontSize:16 }}>No jobs applied yet</p>
            <p style={{ marginTop:8, fontSize:14 }}>Start swiping to find your dream job!</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {appliedJobs.map((job, idx) => (
              <div key={idx} style={{ padding:16, border:"1px solid #ecf0f1", borderRadius:8, backgroundColor:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <h4 style={{ margin:"0 0 4px 0", color:"#2c3e50" }}>{job?.position || "Unknown Position"}</h4>
                  <p style={{ margin:"0 0 4px 0", color:"#7f8c8d", fontSize:14 }}>{job?.company?.name || "Unknown Company"} • {job?.company?.location || "Unknown Location"}</p>
                  <p style={{ margin:0, color:"#95a5a6", fontSize:12 }}>Applied on {job?.appliedDate || "N/A"}</p>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ padding:"4px 8px", borderRadius:12, fontSize:12, fontWeight:600, textTransform:"capitalize", backgroundColor: job?.status === "accepted" ? "#d4edda" : job?.status === "pending" ? "#fff3cd" : "#f8d7da", color: job?.status === "accepted" ? "#155724" : job?.status === "pending" ? "#856404" : "#721c24" }}>{job?.status || "pending"}</span>
                  {job?.applyLink && <a href={job.applyLink} target="_blank" rel="noopener noreferrer" style={{ backgroundColor:"#3498db", color:"#fff", padding:"4px 8px", borderRadius:12, textDecoration:"none", fontSize:11, fontWeight:600 }}>Apply</a>}
                  <button onClick={()=>handleJobRemove(idx)} style={{ background:"none", border:"none", color:"#e74c3c", cursor:"pointer", fontSize:16, padding:4 }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div style={{ marginTop:12, color:"#ff6b6b" }}>{error}</div>}
    </div>
  );
};

export default UserProfile;
