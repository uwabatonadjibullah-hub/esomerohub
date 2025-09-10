// src/pages/TraineeModule.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './TraineeModule.css';

const TraineeModule = () => {
  const [modules, setModules] = useState([]);
  const navigate = useNavigate();
  const now = new Date();

  useEffect(() => {
    const fetchModules = async () => {
      const moduleSnap = await getDocs(collection(db, 'modules'));
      const data = moduleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(data);
    };

    fetchModules();
  }, []);

  const getQuizStatus = (quiz) => {
    const start = new Date(quiz.schedule.seconds * 1000);
    const end = new Date(start.getTime() + quiz.duration * 60 * 1000);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (now > end) return 'done';
    if (now >= start && now <= end) return 'active';
    if (start <= oneWeekFromNow) return 'coming';
    return 'future';
  };

  return (
    <div className="trainee-module-container">
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
                    const status = getQuizStatus(quiz);
                    return (
                      <li key={i} className={`quiz-item ${status}`}>
                        <span>{quiz.title}</span>
                        {status === 'active' && (
                          <button className="btn gold" onClick={() => navigate(`/trainee/quiz/${quiz.id}`)}>
                            Take Quiz
                          </button>
                        )}
                        {status === 'done' && <span className="status done">✔️ Done</span>}
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