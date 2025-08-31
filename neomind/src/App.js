import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useSpring, animated, config } from "@react-spring/web";
import React, { useState, useEffect, useRef } from "react";
import { useDrag } from "react-use-gesture";

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

function Navbar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        width: "100%", // 100% of parent container (should be full viewport width)
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
        padding: "0 24px", // inner padding for content spacing
        margin: 0, // ensure no margin
        overflowX: "hidden", // prevent horizontal scroll
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
        <Link
          to="/profile"
          style={{
            marginLeft: 12,
            padding: "6px 14px",
            borderRadius: 6,
            backgroundColor: "transparent",
            border: "none",
            color: "#ecf0f1",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 500,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            userSelect: "none",
          }}
        >
          Profile
        </Link>
        <button
          onClick={() => alert("Logout clicked")}
          style={{
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
            userSelect: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#34495e")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          Logout
        </button>
      </div>
    </nav>
  );
}



function SwipeCard({ company, onSwipe }) {
  // spring animation for drag & swipe
  const [props, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rot: 0,
    scale: 1,
    config: config.stiff,
  }));

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], velocity }) => {
      const trigger = velocity > 0.3; // velocity threshold for swipe
      const dir = xDir < 0 ? -1 : 1; // swipe direction

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
        fontFamily:
          "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        cursor: "grab",
      }}
    >
      <h2 style={{ marginTop: 0, fontWeight: 700 }}>{company.name}</h2>
      <p style={{ fontSize: 18, lineHeight: 1.5 }}>{company.description}</p>
    </animated.div>
  );
}

function Home() {
  const [index, setIndex] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const swipeDir = React.useRef(null);

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
    swipeDir.current = dir;
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
        <Navbar />
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
      <Navbar />
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          overflow: "hidden",
          padding: "64px 16px", // increased vertical padding here!
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

        {/* Card wrapper for vertical padding */}
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

        {/* Accept Button - Right */}
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

function Profile() {
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
      <Navbar />
      <h1>Profile Page</h1>
      <p>This is where user profile info would go.</p>
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
