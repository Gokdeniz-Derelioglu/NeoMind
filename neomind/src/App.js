import { Routes, Route, Link, useNavigate,useLocation,Navigate } from "react-router-dom";
import { useSpring, animated, config } from "@react-spring/web";
import React, { useState, useEffect, useRef } from "react";
import { useDrag } from "react-use-gesture";

import {
  onAuthStateChanged, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

const companies = [
  { id: 1, name: "Company A", description: "A great place to work." },
  { id: 2, name: "Company B", description: "Innovative and fun." },
  { id: 3, name: "Company C", description: "Leading in tech." },
];

const navButtonStyle = {
  marginLeft: 12,
  padding: "6px 14px",
  borderRadius: 6,
  backgroundColor: "transparent",
  border: "none",
  color: "#ecf0f1",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 500,
  transition: "background-color 0.3s ease",
};

/* ---------------- UI components (modified minimally) ---------------- */
function Navbar({ user }) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: 56,
        backgroundColor: "#2c3e50",
        color: "#ecf0f1",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box",
        userSelect: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        zIndex: 9999,
        padding: "0 24px",
        margin: 0,
        overflowX: "hidden",
      }}
    >
      <Link
        to="/"
        style={{
          color: "#ecf0f1",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 18,
          userSelect: "none",
        }}
      >
        NeoMind
      </Link>

      <div style={{ display: "flex", alignItems: "center" }}>
        {user && (
          <Link
            to="/profile"
            style={{
              ...navButtonStyle,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            Profile
          </Link>
        )}

        {user ? (
          <button
            onClick={() => signOut(auth)}
            style={navButtonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#34495e")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            style={{ ...navButtonStyle, textDecoration: "none" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#34495e")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

function SwipeCard({ company, onSwipe }) {
  const [props, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rot: 0,
    scale: 1,
    config: config.stiff,
  }));

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], velocity }) => {
      const trigger = velocity > 0.3;
      const dir = xDir < 0 ? -1 : 1;

      if (!active && trigger) {
        api.start({
          x: (200 + window.innerWidth) * dir,
          rot: dir * 20,
          scale: 1,
          immediate: false,
          onResolve: () => onSwipe(dir > 0 ? "right" : "left"),
        });
      } else {
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

  return (
    <animated.div
      {...bind()}
      style={{
        x: props.x,
        rotateZ: props.rot,
        scale: props.scale,
        touchAction: "none",
        maxWidth: 420,
        margin: "60px auto 40px",
        padding: 24,
        boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
        borderRadius: 16,
        userSelect: "none",
        position: "relative",
        backgroundColor: "#d0f0e7",
        color: "#2c3e50",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        cursor: "grab",
      }}
    >
      <h2 style={{ marginTop: 0, fontWeight: 700 }}>{company.name}</h2>
      <p style={{ fontSize: 18, lineHeight: 1.5 }}>{company.description}</p>
    </animated.div>
  );
}

function Home({ user }) {
  const [index, setIndex] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  const [props, api] = useSpring(() => ({
    x: 0,
    rot: 0,
    scale: 1,
    config: config.stiff,
  }));

  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const triggerSwipe = (dir) => {
    if (index >= companies.length) return;
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
      if (!active && trigger) {
        triggerSwipe(dir);
      } else {
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

  if (index >= companies.length) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
        }}
      >
        <Navbar user={user} />
        <h2 style={{ marginTop: 80, fontWeight: 600, fontSize: 24 }}>
          That's all for now! Please check back later for more companies.
        </h2>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
      }}
    >
      <Navbar user={user} />
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
        {/* Reject Button - Left */}
        {!isMobile && (
          <button
            onClick={() => triggerSwipe("left")}
            style={{
              flexShrink: 0,
              width: 100,
              padding: "14px 0",
              fontSize: 18,
              borderRadius: 8,
              border: "2px solid #7f8c8d",
              backgroundColor: "transparent",
              color: "#bdc3c7",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s ease",
              height: 60,
              alignSelf: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#34495e";
              e.currentTarget.style.color = "#ecf0f1";
              e.currentTarget.style.borderColor = "#95a5a6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#bdc3c7";
              e.currentTarget.style.borderColor = "#7f8c8d";
            }}
          >
            Reject
          </button>
        )}

        <div
          style={{
            paddingTop: 64,
            paddingBottom: 64,
            maxWidth: 420,
            width: "90vw",
            boxSizing: "content-box",
          }}
        >
          <animated.div
            {...bind()}
            style={{
              x: props.x,
              rotateZ: props.rot,
              scale: props.scale,
              touchAction: "none",
              padding: 24,
              boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
              borderRadius: 16,
              backgroundColor: "#d0f0e7",
              color: "#2c3e50",
              cursor: "grab",
              fontFamily:
                "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              userSelect: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <h2 style={{ marginTop: 0, fontWeight: 700 }}>
              {companies[index].name}
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.5 }}>
              {companies[index].description}
            </p>
          </animated.div>
        </div>

        {!isMobile && (
          <button
            onClick={() => triggerSwipe("right")}
            style={{
              flexShrink: 0,
              width: 100,
              padding: "14px 0",
              fontSize: 18,
              borderRadius: 8,
              border: "none",
              backgroundColor: "#1abc9c",
              color: "#ecf0f1",
              cursor: "pointer",
              fontWeight: 600,
              transition: "background-color 0.3s ease",
              height: 60,
              alignSelf: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#16a085")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#1abc9c")
            }
          >
            Accept
          </button>
        )}
      </div>
    </div>
  );
}

function Profile({ user }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#2c3e50",
        color: "#ecf0f1",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: 24,
      }}
    >
      <Navbar user={user} />
      <h1>Profile Page</h1>
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
          fontSize: 16,
          borderRadius: 8,
          border: "none",
          backgroundColor: "#1abc9c",
          color: "#ecf0f1",
          cursor: "pointer",
        }}
      >
        Back
      </button>
    </div>
  );
}

/* ---------------- inline Login screen (email/password) ---------------- */
function Login() {
  const [mode, setMode] = React.useState("signin"); // 'signin' | 'signup'
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName]   = React.useState("");
  const [email, setEmail]         = React.useState("");
  const [password, setPassword]   = React.useState("");
  const [error, setError]         = React.useState("");
  const [busy, setBusy]           = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
          firstName, lastName, email, createdAt: serverTimestamp(),
        });
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
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"#2c3e50", color:"#ecf0f1"
    }}>
      <form onSubmit={handleSubmit} style={{
        width:360, background:"#34495e", padding:24, borderRadius:12,
        boxShadow:"0 10px 20px rgba(0,0,0,0.2)"
      }}>
        <h2 style={{ marginTop: 0, textAlign: "center" }}>
          {mode === "signup" ? "Create account" : "Log in"}
        </h2>

        {mode === "signup" && (
          <>
            <label>First name</label>
            <input value={firstName} onChange={e=>setFirstName(e.target.value)} required
              style={inputStyle}/>
            <label>Last name</label>
            <input value={lastName} onChange={e=>setLastName(e.target.value)} required
              style={inputStyle}/>
          </>
        )}

        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
          style={inputStyle}/>

        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
          style={inputStyle}/>

        {error && <div style={{ color: "#ffb4b4", margin: "8px 0" }}>{error}</div>}

        <button disabled={busy} type="submit" style={btnStyle}>
          {busy ? "Please wait..." : (mode === "signup" ? "Sign up" : "Sign in")}
        </button>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          {mode === "signup" ? (
            <span>Already have an account?{" "}
              <button type="button" onClick={()=>setMode("signin")} style={linkBtn}>Sign in</button>
            </span>
          ) : (
            <span>New here?{" "}
              <button type="button" onClick={()=>setMode("signup")} style={linkBtn}>Create account</button>
            </span>
          )}
        </div>

        <div style={{ marginTop: 12, textAlign: "center", opacity: 0.8 }}>
          <Link to="/" style={{ color: "#ecf0f1" }}>Back to home</Link>
        </div>
      </form>
    </div>
  );
}
const inputStyle = { width:"100%", margin:"6px 0 14px", padding:"10px 12px",
  borderRadius:8, border:"1px solid #556", background:"#2c3e50", color:"#ecf0f1" };
const btnStyle   = { width:"100%", padding:"10px 12px", borderRadius:8, border:"none",
  background:"#1abc9c", color:"#ecf0f1", fontWeight:600, cursor:"pointer" };
const linkBtn    = { background:"transparent", color:"#1abc9c", border:"none", cursor:"pointer" };

/* ---------------- route guard ---------------- */
function Protected({ user, children }) {
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

/* ---------------- app root ---------------- */
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

  if (!authReady) {
    return (
      <div style={{ padding: 24, color: "#ecf0f1", background: "#2c3e50" }}>
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected user={user}>
            <Home user={user} />
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected user={user}>
            <Profile user={user} />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}
