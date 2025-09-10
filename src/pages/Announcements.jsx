// src/pages/Announcements.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [lifespanDays, setLifespanDays] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    const now = new Date();
    const snapshot = await getDocs(collection(db, 'announcements'));
    const data = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(a => new Date(a.expiresAt.seconds * 1000) > now);
    setAnnouncements(data);
  };

  const handlePost = async () => {
    if (!newAnnouncement.trim()) return;
    setLoading(true);

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + lifespanDays * 24 * 60 * 60 * 1000);

    await addDoc(collection(db, 'announcements'), {
      message: newAnnouncement,
      createdAt,
      expiresAt
    });

    setNewAnnouncement('');
    setLifespanDays(1);
    await fetchAnnouncements();
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div className="announcements-container">
      <h1 className="page-title">📢 Admin Announcements</h1>

      <div className="announcement-form">
        <textarea
          placeholder="Write a new announcement..."
          value={newAnnouncement}
          onChange={(e) => setNewAnnouncement(e.target.value)}
        />
        <label>
          Lifespan (in days):
          <input
            type="number"
            min="1"
            value={lifespanDays}
            onChange={(e) => setLifespanDays(parseInt(e.target.value))}
          />
        </label>
        <button className="btn gold" onClick={handlePost} disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Announcement'}
        </button>
      </div>

      <div className="announcement-list">
        {announcements.length === 0 ? (
          <p className="empty">No active announcements.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="announcement-card">
              <p>{a.message}</p>
              <span>
                Posted: {new Date(a.createdAt.seconds * 1000).toLocaleString()}<br />
                Expires: {new Date(a.expiresAt.seconds * 1000).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
