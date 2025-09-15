// src/pages/TraineeModule.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './TraineeModule.css';

const TraineeModule = () => {
  const [modules, setModules] = useState([]);
  const [userScores, setUserScores] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModulesAndScores = async () => {
      const moduleSnap = await getDocs(collection(db, 'modules'));
      const data = moduleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(data);

      // ✅ fetch user scores
      const user = auth.currentUser;
      if (user) {
        const scoresSnap = await getDocs(collection(db, 'quizzes'));
        const scoresData = {};
        scoresSnap.forEach(docSnap => {
          const quiz = docSnap.data();
          if (quiz.scores) {
            quiz.scores.forEach(s => {
              if (s.studentId === user.uid) {
                scoresData[docSnap.id] = s; // store score record
              }
            });
          }
        });
        setUserScores(scoresData);
      }
    };

    fetchModulesAndScores();
  }, []);

  const getQuizStatus = (quiz, quizId) => {
    const now = new Date();
    const start = new Date(quiz.schedule.seconds * 1000);
    const end = new Date(quiz.expiry.seconds * 1000);

    const attempted = userScores[quizId];

    if (attempted) return 'done';
    if (now >= start && now <= end) return 'active';
    if (now > end) return 'missed';
    return 'future';
  };

  return (
    <div className="trainee-module-container">
      {/* Sticky Navigation Bar */}
      <div className="trainee-nav">
        <button className="btn" onClick={() => navigate('/trainee')}>
          🏡 Home
        </button>
        <button className="btn" onClick={() => navigate('/trainee/dashboard')}>
          🏠 Dashboard
        </button>
        <button className="btn" onClick={() => navigate('/trainee/announcements')}>
          📢 Announcements
        </button>
      </div>

      <h1 className="page-title">📚 Your Modules</h1>
      {modules.length === 0 ? (
        <p className="empty-message">No modules available yet.</p>
      ) : (
        modules.map((mod) => (
          <div key={mod.id} className="module-card">
            <h2 className="module-title">{mod.name}</h2>

            <div className="section">
              <h3 className="section-title">🎬 Lectures</h3>
              {mod.lectures?.length > 0 ? (
                <ul className="lecture-list">
                  {mod.lectures.map((lec, i) => (
                    <li key={i}>
                      <a href={lec.link} target="_blank" rel="noopener noreferrer">
                        {lec.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-sub">No lectures yet.</p>
              )}
            </div>

            <div className="section">
              <h3 className="section-title">📝 Quizzes</h3>
              {mod.quizzes?.length > 0 ? (
                <ul className="quiz-list">
                  {mod.quizzes.map((quiz, i) => {
                    // ⚡ ensure quiz has a stable id
                    const quizId = quiz.id || `${mod.id}-quiz-${i}`;
                    const status = getQuizStatus(quiz, quizId);

                    return (
                      <li key={i} className={`quiz-item ${status}`}>
                        <span>{quiz.title}</span>
                        {status === 'active' && (
                          <button
                            className="btn gold"
                            onClick={() => navigate(`/trainee/quiz/${quizId}`)}
                          >
                            Take Quiz
                          </button>
                        )}
                        {status === 'done' && <span className="status done">✔️ Done</span>}
                        {status === 'missed' && <span className="status missed">❌ Missed</span>}
                        {status === 'future' && <span className="status future">⏳ Not Started</span>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="empty-sub">No quizzes yet.</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TraineeModule;
