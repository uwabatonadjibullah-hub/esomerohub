// src/pages/TraineeModule.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './TraineeModule.css';

const TraineeModule = () => {
  const [modules, setModules] = useState([]);
  const [results, setResults] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModulesAndResults = async () => {
      // Fetch all modules
      const moduleSnap = await getDocs(collection(db, 'modules'));
      const modulesData = moduleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(modulesData);

      // Fetch trainee's quiz results
      if (auth.currentUser?.uid) {
        const resultsQuery = query(
          collection(db, 'quizResults'),
          where('traineeId', '==', auth.currentUser.uid)
        );
        const resultsSnap = await getDocs(resultsQuery);

        const resMap = {};
        resultsSnap.forEach(doc => {
          const data = doc.data();
          // store result keyed by moduleId + quizTitle
          resMap[`${data.moduleId}_${data.quizTitle}`] = data;
        });
        setResults(resMap);
      }
    };

    fetchModulesAndResults();
  }, []);

  const getQuizStatus = (moduleId, quiz) => {
    const now = new Date();

    const start = quiz.schedule?.seconds
      ? new Date(quiz.schedule.seconds * 1000)
      : new Date(quiz.schedule);

    const end = quiz.expiry?.seconds
      ? new Date(quiz.expiry.seconds * 1000)
      : new Date(quiz.expiry);

    const key = `${moduleId}_${quiz.title}`;

    if (results[key]) return 'done';
    if (now >= start && now <= end) return 'active';
    if (now > end) return 'missed';
    if (now < start) return 'coming';
    return 'future';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString();
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
            <h2 className="module-title">{mod.moduleName || mod.name}</h2>

            {/* Lectures */}
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

            {/* Quizzes */}
            <div className="section">
              <h3 className="section-title">📝 Quizzes</h3>
              {mod.quizzes?.length > 0 ? (
                <ul className="quiz-list">
                  {mod.quizzes.map((quiz, i) => {
                    const status = getQuizStatus(mod.id, quiz);
                    const startStr = formatDate(quiz.schedule);
                    const endStr = formatDate(quiz.expiry);

                    return (
                      <li key={i} className={`quiz-item ${status}`}>
                        <span>{quiz.title}</span>
                        <div className="quiz-dates">
                          <small>Start: {startStr}</small> | <small>End: {endStr}</small>
                        </div>
                        {status === 'active' && (
                          <button
                            className="btn gold"
                            onClick={() =>
                              navigate(
                                `/trainee/quiz/${mod.id}/${encodeURIComponent(quiz.title)}`
                              )
                            }
                          >
                            Take Quiz
                          </button>
                        )}
                        {status === 'done' && <span className="status done">✔️ Done</span>}
                        {status === 'missed' && <span className="status missed">❌ Missed</span>}
                        {status === 'coming' && <span className="status coming">🕒 Coming Soon</span>}
                        {status === 'future' && <span className="status future">⛔ Not to be done</span>}
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
