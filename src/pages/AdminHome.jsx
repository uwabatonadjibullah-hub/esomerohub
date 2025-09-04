// src/pages/AdminHome.jsx
import React, { useState, useEffect } from 'react';
import HomeLayout from '../components/HomeLayout';
import ABG1 from '../assets/ABG1.jpg';
import ABG2 from '../assets/ABG2.jpg';
import ABG3 from '../assets/ABG3.jpeg';

const backgrounds = [ABG1, ABG2, ABG3];
const quotes = [
  "Lead with vision, manage with purpose.",
  "Every module is a step toward mastery.",
  "Admins empower the future, one decision at a time."
];

const AdminHome = () => {
  const buttons = ['Dashboard', 'Module Manager', 'Announcements'];
  const [bgIndex, setBgIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 6000);

    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 7000);

    return () => {
      clearInterval(bgTimer);
      clearInterval(quoteTimer);
    };
  }, []);

  return (
    <HomeLayout
      title="Admin Panel"
      buttons={buttons}
      background={backgrounds[bgIndex]}
      quote={quotes[quoteIndex]}
    />
  );
};

export default AdminHome;