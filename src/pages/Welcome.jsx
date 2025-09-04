// src/pages/Welcome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';
import BG1 from '../assets/BG1.jpg';
import BG2 from '../assets/BG2.jpg';
import BG3 from '../assets/BG3.jpg';
import Logo from '../assets/Logo.png';

const backgrounds = [BG1, BG2, BG3];
const quotes = [
  "Empower your mind, elevate your future.",
  "Learning is the passport to tomorrow.",
  "Every click is a step toward greatness."
];

const Welcome = () => {
  const [bgIndex, setBgIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);

    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 7000);

    return () => {
      clearInterval(bgTimer);
      clearInterval(quoteTimer);
    };
  }, []);

  return (
    <div
      className="welcome-container"
      style={{ backgroundImage: `url(${backgrounds[bgIndex]})` }}
    >
      <div className="overlay">
        <img src={Logo} alt="Esomeerhub Logo" className="logo" />
        <h1 className="quote">{quotes[quoteIndex]}</h1>
        <p className="subtext">Welcome to Esomerohub — your journey starts here.</p>
        <div className="button-group">
          <button className="btn gold" onClick={() => navigate('/login')}>Login</button>
          <button className="btn white" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;