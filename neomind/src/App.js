// src/App.js
import React from "react";
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { useSpring, config } from "@react-spring/web";
import { useDrag } from "react-use-gesture";
import "./App.css";

// --- Components ---
import Navbar from "./components/Navbar";
import JobCard from "./components/JobCard";
import LeftButton from "./components/LeftButton";
import RightButton from "./components/RightButton";
import MobileButtons from "./components/MobileButtons";
import ProgressIndicator from "./components/ProgressIndicator";
import NoMoreJobs from "./components/NoMoreJobs";
import { fetchJobOpenings } from "./data/jobOpenings";

// --- Firebase ---
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

/* ---------- route guard ---------- */
function Protected({ user, children }) {
  const location = useLocation();
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

/* ---------- Home ---------- */
function Home({ user, onLogout }) {
  const [jobOpenings, setJobOpenings] = React.useState([]); // <-- FIX: added state
  const [index, setIndex] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  const [props, api] = useSpring(() => ({
    x: 0,
    rot: 0,
    scale: 1,
    config: config.stiff,
  }));

  // Fetch jobs
  React.useEffect(() => {
    async function loadJobs() {
      try {
        const jobs = await fetchJobOpenings();
        setJobOpenings(jobs || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setJobOpenings([]);
      }
    }
    loadJobs();
  }, []);

  // Resize check
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const triggerSwipe = (dir) => {
    if (index >= jobOpenings.length) return;
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
function Profile({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#2c3e50", color: "#ecf0f1", padding: 24 }}>
      <Navbar user={user} onLogout={onLogout} />
      <h1>Profile</h1>
      {user ? (
        <>
          <p><b>UID:</b> {user.uid}</p>
          <p><b>Email:</b> {user.email}</p>
        </>
      ) : (
        <p>Loading…</p>
      )}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: 20,
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          background: "#1abc9c",
          color: "#ecf0f1",
        }}
      >
        Back
      </button>
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
    setError(""); setBusy(true);
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

  if (!authReady) {
    return <div style={{ padding: 24, color: "#ecf0f1", background: "#2c3e50" }}>Loading…</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected user={user}>
            <Home user={user} onLogout={handleLogout} />
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected user={user}>
            <Profile user={user} onLogout={handleLogout} />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}
