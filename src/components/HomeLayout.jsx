// src/components/HomeLayout.jsx
import React from 'react';
import './HomeLayout.css';
import ProfileIcon from '../assets/profile.png';

const HomeLayout = ({ title, buttons, background, quote }) => {
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
          <button key={index} className="home-btn">
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeLayout;