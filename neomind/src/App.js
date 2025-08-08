import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useSpring, animated, config } from "@react-spring/web";
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
        height: 56,
        backgroundColor: "#2c3e50",
        color: "#ecf0f1",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 24px",
        fontFamily:
          "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        userSelect: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Link
        to="/"
        style={{
          color: "#ecf0f1",
          textDecoration: "none",
          fontWeight: 600,
          marginRight: "auto",
          fontSize: 18,
        }}
      >
        NeoMind
      </Link>
      <Link
        to="/profile"
        style={{
          ...navButtonStyle,
          marginLeft: 0,
          marginRight: 12,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        Profile
      </Link>
      <button
        onClick={() => alert("Logout clicked")}
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
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSwipe = (dir) => {
    if (index >= companies.length) return;
    setDirection(dir);
    setTimeout(() => {
      setIndex((i) => i + 1);
      setDirection(null);
    }, 400);
  };

  if (index >= companies.length) {
    return (
      <div
        style={{
          padding: 24,
          fontFamily:
            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: "#ecf0f1",
          backgroundColor: "#2c3e50",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <Navbar />
        <h2 style={{ marginTop: 80, fontWeight: 600, fontSize: 24 }}>
          No more companies to review
        </h2>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#2c3e50",
        minHeight: "100vh",
        paddingBottom: 80,
      }}
    >
      <Navbar />
      <SwipeCard company={companies[index]} onSwipe={handleSwipe} />

      {/* Show buttons only on desktop */}
      {!isMobile && (
        <div
          style={{
            textAlign: "center",
            marginTop: 8,
          }}
        >
          <button
            onClick={() => handleSwipe("left")}
            style={{
              marginRight: 24,
              padding: "14px 28px",
              fontSize: 18,
              borderRadius: 8,
              border: "2px solid #7f8c8d",
              backgroundColor: "transparent",
              color: "#bdc3c7",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s ease",
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
          <button
            onClick={() => handleSwipe("right")}
            style={{
              padding: "14px 28px",
              fontSize: 18,
              borderRadius: 8,
              border: "none",
              backgroundColor: "#1abc9c",
              color: "#ecf0f1",
              cursor: "pointer",
              fontWeight: 600,
              transition: "background-color 0.3s ease",
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
        </div>
      )}
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
