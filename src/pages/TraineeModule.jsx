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
      // Get all modules
      const moduleSnap = await getDocs(collection(db, 'modules'));
      const modulesData = moduleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(modulesData);

      // Get user quiz results
      const resultsQuery = query(
        collection(db, 'quizResults'),
        where('traineeId', '==', auth.currentUser?.uid)
      );
      const resultsSnap = await getDocs(resultsQuery);

      const resMap = {};
      resultsSnap.forEach(doc => {
        const data = doc.data();
        resMap[data.quizId] = data; // store quiz result by quizId
      });

      setResults(resMap);
    };

    fetchModulesAndResults();
  }, []);

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const start = quiz.schedule?.seconds
      ? new Date(quiz.schedule.seconds * 1000)
      : new Date(quiz.schedule);
    const end = new Date(start.getTime() + quiz.duration * 60 * 1000);

    if (results[quiz.id]) return 'done'; // user already submitted
    if (now > end) return 'missed';
    if (now >= start && now <= end) return 'active';
    if (now < start) return 'coming';
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
                    const status = getQuizStatus(quiz);
                    return (
                      <li key={i} className={`quiz-item ${status}`}>
                        <span>{quiz.title}</span>
                        {status === 'active' && (
                          <button
                            className="btn gold"
                            onClick={() => navigate(`/trainee/quiz/${quiz.id}`)}
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
