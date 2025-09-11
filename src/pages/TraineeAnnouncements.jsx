// src/pages/TraineeAnnouncements.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './TraineeAnnouncements.css';

const TraineeAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const now = new Date();
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(a => new Date(a.expiresAt.seconds * 1000) > now);
      setAnnouncements(data);
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="trainee-announcements-container">
      {/* Sticky Navigation Bar */}
      <div className="trainee-nav">
        <button className="btn" onClick={() => navigate('/trainee')}>
          🏡 Home
        </button>
        <button className="btn" onClick={() => navigate('/trainee/dashboard')}>
          📊 Dashboard
        </button>
        <button className="btn" onClick={() => navigate('/trainee/modules')}>
          📚 Modules
        </button>
        <button className="btn" onClick={() => navigate('/trainee/upcoming-quizzes')}>
          📝 Upcoming Quizzes
        </button>
      </div>

      <h1 className="trainee-title">📣 Announcements</h1>
      {announcements.length === 0 ? (
        <p className="empty-message">No announcements available at the moment.</p>
      ) : (
        <div className="announcement-list">
          {announcements.map((a) => (
            <div key={a.id} className="announcement-card">
              <p className="announcement-message">{a.message}</p>
              <p className="announcement-date">
                Posted: {new Date(a.createdAt.seconds * 1000).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TraineeAnnouncements;
