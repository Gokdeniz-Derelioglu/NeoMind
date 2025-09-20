import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useSpring, animated, config } from "@react-spring/web";
import React from "react";
import { useDrag } from "react-use-gesture";
import "./App.css";

// Import components
import Navbar from "./components/Navbar";
import JobCard from "./components/JobCard";
import LeftButton from "./components/LeftButton";
import RightButton from "./components/RightButton";
import MobileButtons from "./components/MobileButtons";
import ProgressIndicator from "./components/ProgressIndicator";
import NoMoreJobs from "./components/NoMoreJobs";

// Import data
import { jobOpenings } from "./data/jobOpenings";

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
    if (index >= jobOpenings.length) return;
    swipeDir.current = dir;
    
    // Add visual feedback based on swipe direction
    const card = document.querySelector('.job-card');
    if (card) {
      card.style.border = dir === "right" ? "4px solid #51cf66" : "4px solid #ff6b6b";
      card.style.boxShadow = dir === "right" 
        ? "0 20px 40px rgba(81, 207, 102, 0.4)" 
        : "0 20px 40px rgba(255, 107, 107, 0.4)";
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

  if (index >= jobOpenings.length) {
    return <NoMoreJobs />;
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
        {/* Desktop Left Button */}
        {!isMobile && (
          <LeftButton triggerSwipe={triggerSwipe} />
        )}

        {/* Card wrapper for vertical padding */}
        <div
          style={{
            paddingTop: 64,
            paddingBottom: 64,
            maxWidth: 480,
            width: "90vw",
            boxSizing: "content-box",
          }}
        >
          {/* Mobile Action Buttons */}
          {isMobile && (
            <MobileButtons triggerSwipe={triggerSwipe} />
          )}
          
          <JobCard 
            job={jobOpenings[index]}
            bind={bind}
            props={props}
            isMobile={isMobile}
          />
        </div>

        {/* Desktop Right Button */}
        {!isMobile && (
          <RightButton triggerSwipe={triggerSwipe} />
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
