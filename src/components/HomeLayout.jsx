// src/components/HomeLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeLayout.css';
import ProfileIcon from '../assets/profile.png';

const HomeLayout = ({ title, buttons, background, quote }) => {
  const navigate = useNavigate();

  const handleNavigation = (label) => {
    const base = title.toLowerCase().includes('admin') ? '/admin' : '/trainee';
    const path = label.toLowerCase().replace(/\s+/g, '-');
    navigate(`${base}/${path}`);
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out'
      }}
    >
      <div className="top-bar">
        <h1 className="home-title">{title}</h1>
        <img src={ProfileIcon} alt="Profile" className="profile-icon" />
      </div>

      <div className="quote-box">
        <p className="motivational-quote">{quote}</p>
      </div>

      <div className="button-grid">
        {buttons.map((btn, index) => (
          <button key={index} className="home-btn" onClick={() => handleNavigation(btn)}>
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeLayout;