import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../firebase";
import { db } from "../firebase";

export default function Login() {
  const [mode, setMode] = useState("signin"); //blabla
  const [firstName, setFirstName] = useState("deneme");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [busy, setBusy]           = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
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
      setError(err.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#2c3e50", color: "#ecf0f1"
    }}>
      <form onSubmit={handleSubmit} style={{
        width: 360, background: "#34495e", padding: 24, borderRadius: 12,
        boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
      }}>
        <h2 style={{ marginTop: 0, textAlign: "center" }}>
          {mode === "signup" ? "Create account" : "Log in"}
        </h2>

        {mode === "signup" && (
          <>
            <label>First name</label>
            <input value={firstName} onChange={e=>setFirstName(e.target.value)} required
              style={inputStyle} />
            <label>Last name</label>
            <input value={lastName} onChange={e=>setLastName(e.target.value)} required
              style={inputStyle} />
          </>
        )}

        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
          style={inputStyle} />

        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
          style={inputStyle} />

        {error && <div style={{ color: "#ffb4b4", margin: "8px 0" }}>{error}</div>}

        <button disabled={busy} type="submit" style={btnStyle}>
          {busy ? "Please wait..." : (mode === "signup" ? "Sign up" : "Sign in")}
        </button>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          {mode === "signup" ? (
            <span>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("signin")} style={linkBtn}>Sign in</button>
            </span>
          ) : (
            <span>
              New here?{" "}
              <button type="button" onClick={() => setMode("signup")} style={linkBtn}>Create account</button>
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

const inputStyle = {
  width: "100%", margin: "6px 0 14px 0", padding: "10px 12px",
  borderRadius: 8, border: "1px solid #556", background: "#2c3e50", color: "#ecf0f1"
};
const btnStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8, border: "none",
  background: "#1abc9c", color: "#ecf0f1", fontWeight: 600, cursor: "pointer"
};
const linkBtn = {
  background: "transparent", color: "#1abc9c", border: "none", cursor: "pointer"
};
