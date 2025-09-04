// src/pages/TraineeHome.jsx
import React, { useState, useEffect } from 'react';
import HomeLayout from '../components/HomeLayout';
import TBG1 from '../assets/TBG1.jpg';
import TBG2 from '../assets/TBG2.jpg';
import TBG3 from '../assets/TBG3.jpg';

const backgrounds = [TBG1, TBG2, TBG3];
const quotes = [
  "Every module is a milestone.",
  "Quizzes sharpen your brilliance.",
  "Learning today, leading tomorrow."
];

const TraineeHome = () => {
  const buttons = ['Dashboard', 'Modules', 'Upcoming Quizzes', 'Announcements'];
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
      title="Trainee Portal"
      buttons={buttons}
      background={backgrounds[bgIndex]}
      quote={quotes[quoteIndex]}
    />
  );
};

export default TraineeHome;