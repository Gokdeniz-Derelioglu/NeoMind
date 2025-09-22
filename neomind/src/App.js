// src/App.js
import React from "react";
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { useSpring, config } from "@react-spring/web";
import { useDrag } from "react-use-gesture";
import { useState, useEffect, useRef } from "react";
import "./App.css";
import { addJobApplication } from "./services/userService";

// --- Components ---
import Navbar from "./components/Navbar";
import JobCard from "./components/JobCard";
import LeftButton from "./components/LeftButton";
import RightButton from "./components/RightButton";
import MobileButtons from "./components/MobileButtons";
import ProgressIndicator from "./components/ProgressIndicator";
import NoMoreJobs from "./components/NoMoreJobs";
import { getAllJobs } from "./services/jobService";
import UserProfile from "./components/UserProfile";
import { JobProvider, useJobContext } from "./context/JobContext";

// --- Firebase ---
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

/* ---------- Route guard ---------- */
function Protected({ user, children }) {
  const location = useLocation();
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

/* ---------- Home ---------- */
function Home({ user, onLogout }) {
  const [jobOpenings, setJobOpenings] = useState([]);
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const swipeDir = useRef(null);
  const { addAppliedJob } = useJobContext();
  const { appliedJobs } = useJobContext();


  const [props, api] = useSpring(() => ({ x: 0, rot: 0, scale: 1, config: config.stiff }));

  // --- Fetch jobs only when user exists ---
  //TESET TESTTESTSETSESETSETSET PURNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  useEffect(() => {
    if (!user) return;

    const loadJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const jobs = await getAllJobs(user);
        // Exclude jobs the user has already applied to
        const appliedJobIds = (appliedJobs || []).map((j) => j.id); // assuming each appliedJob has an 'id'
        const filteredJobs = jobs.filter((job) => !appliedJobIds.includes(job.id));
        setJobOpenings(filteredJobs || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Check permissions or login.");
        setJobOpenings([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [user, appliedJobs]); // add appliedJobs as dependency


  // --- Window resize ---
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --- Swipe handling ---
  const triggerSwipe = async (dir) => {
    if (index >= jobOpenings.length) return;
    swipeDir.current = dir;

    const card = document.querySelector(".job-card");
    if (card) {
      card.style.border = dir === "right" ? "4px solid #51cf66" : "4px solid #ff6b6b";
      card.style.boxShadow =
        dir === "right" ? "0 20px 40px rgba(81, 207, 102, 0.4)" : "0 20px 40px rgba(255, 107, 107, 0.4)";
    }

    if (dir === "right") {
      try {
        // Add job to Firestore for the logged-in user
        await addJobApplication(user.uid, jobOpenings[index]);
        // Update local context (so UI reflects applied jobs)
        addAppliedJob(jobOpenings[index]);
      } catch (err) {
        console.error("Failed to add job application:", err);
        alert("Failed to apply for job. Try again.");
      }
    }

    api.start({
      x: (200 + window.innerWidth) * (dir === "right" ? 1 : -1),
      rot: dir === "right" ? 20 : -20,
      scale: 1,
      immediate: false,
      onResolve: () => {
        setIndex((i) => i + 1);
        api.start({ x: 0, rot: 0, scale: 1, immediate: true });
      },
    });
  };


  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], velocity }) => {
      const trigger = velocity > 0.3;
      const dir = xDir < 0 ? "left" : "right";
      if (!active && trigger) triggerSwipe(dir);
      else {
        api.start({
          x: active ? mx : 0,
          rot: active ? mx / 20 : 0,
          scale: active ? 1.1 : 1,
          immediate: active,
        });
      }
    },
    { axis: "x" }
  );

  if (jobOpenings.length === 0) {
    return <div>Loading jobs...</div>;
  }

  if (index >= jobOpenings.length) {
    return <NoMoreJobs />;
  }

  const currentJob = jobOpenings[index];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", userSelect: "none" }}>
      <Navbar user={user} onLogout={onLogout} />
      <ProgressIndicator currentIndex={index} totalJobs={jobOpenings.length} />

      <div
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          overflow: "hidden",
          padding: "64px 16px",
          boxSizing: "border-box",
        }}
      >
        {!isMobile && <LeftButton triggerSwipe={triggerSwipe} />}

        <div style={{ paddingTop: 64, paddingBottom: 64, maxWidth: 480, width: "90vw" }}>
          {isMobile && <MobileButtons triggerSwipe={triggerSwipe} />}

          {currentJob ? (
            <JobCard job={currentJob} bind={bind} props={props} isMobile={isMobile} />
          ) : (
            <NoMoreJobs />
          )}
        </div>

        {!isMobile && <RightButton triggerSwipe={triggerSwipe} />}
      </div>
    </div>
  );
}

/* ---------- Profile ---------- */
function Profile() {
  const { appliedJobs, removeAppliedJob } = useJobContext();
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: "20px 0" }}>
      <Navbar />
      <div style={{ padding: "0 20px" }}>
        <UserProfile appliedJobs={appliedJobs} onJobRemove={removeAppliedJob} />
      </div>
    </div>
  );
}


/* ---------- Inline Login page (from your working version) ---------- */
function Login() {
  const [mode, setMode] = React.useState("signin");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname || "/";

  const inputStyle = { width: "100%", margin: "6px 0 14px", padding: "10px 12px", borderRadius: 8, border: "1px solid #556", background: "#2c3e50", color: "#ecf0f1" };
  const btnStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: "#1abc9c", color: "#ecf0f1", fontWeight: 600, cursor: "pointer" };
  const linkBtn = { background: "transparent", color: "#1abc9c", border: "none", cursor: "pointer" };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), { firstName, lastName, email, createdAt: serverTimestamp() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#2c3e50", color: "#ecf0f1" }}>
      <form onSubmit={handleSubmit} style={{ width: 360, background: "#34495e", padding: 24, borderRadius: 12, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
        <h2 style={{ marginTop: 0, textAlign: "center" }}>{mode === "signup" ? "Create account" : "Log in"}</h2>

        {mode === "signup" && (
          <>
            <label>First name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
            <label>Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />
          </>
        )}

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />

        {error && <div style={{ color: "#ffb4b4", margin: "8px 0" }}>{error}</div>}

        <button disabled={busy} type="submit" style={btnStyle}>
          {busy ? "Please wait..." : mode === "signup" ? "Sign up" : "Sign in"}
        </button>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          {mode === "signup" ? (
            <span>Already have an account? <button type="button" onClick={() => setMode("signin")} style={linkBtn}>Sign in</button></span>
          ) : (
            <span>New here? <button type="button" onClick={() => setMode("signup")} style={linkBtn}>Create account</button></span>
          )}
        </div>

        <div style={{ marginTop: 12, textAlign: "center", opacity: 0.8 }}>
          <Link to="/" style={{ color: "#ecf0f1" }}>Back to home</Link>
        </div>
      </form>
    </div>
  );
}

/* ---------- App root ---------- */
export default function App() {
  const [user, setUser] = React.useState(null);
  const [authReady, setAuthReady] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const handleLogout = React.useCallback(() => signOut(auth), []);

  if (!authReady) return <div style={{ padding: 24, color: "#ecf0f1", background: "#2c3e50" }}>Loading…</div>;

  return (
    <JobProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected user={user}><Home user={user} onLogout={handleLogout} /></Protected>} />
        <Route path="/profile" element={<Protected user={user}><Profile /></Protected>} />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </JobProvider>
  );
}