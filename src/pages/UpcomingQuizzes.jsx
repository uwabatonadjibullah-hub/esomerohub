// src/pages/UpcomingQuizzes.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './UpcomingQuizzes.css';

const UpcomingQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get all modules
      const snapshot = await getDocs(collection(db, 'modules'));

      // Collect quizzes from each module's quizzes array
      const allQuizzes = snapshot.docs.flatMap(doc => {
        const moduleData = doc.data();
        const moduleQuizzes = moduleData.quizzes || [];
        return moduleQuizzes.map(q => ({
          ...q,
          moduleId: doc.id,
          moduleName: moduleData.name || 'Unknown',
        }));
      });

      // Filter by schedule & expiry, also limit to next 7 days
      const upcoming = allQuizzes
        .filter(q => {
          if (!q.schedule || !q.expiry) return false;

          const start = q.schedule.seconds
            ? new Date(q.schedule.seconds * 1000)
            : new Date(q.schedule);

          const end = q.expiry.seconds
            ? new Date(q.expiry.seconds * 1000)
            : new Date(q.expiry);

          // quiz must be within [now, oneWeekFromNow] and not expired
          return start <= oneWeekFromNow && end >= now;
        })
        .sort((a, b) => {
          const aDate = a.schedule.seconds
            ? new Date(a.schedule.seconds * 1000)
            : new Date(a.schedule);
          const bDate = b.schedule.seconds
            ? new Date(b.schedule.seconds * 1000)
            : new Date(b.schedule);
          return aDate - bDate;
        });

      setQuizzes(upcoming);
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="upcoming-quizzes-container">
      <h1 className="page-title">🗓️ Upcoming Quizzes</h1>
      {quizzes.length === 0 ? (
        <p className="empty-message">No quizzes scheduled within the next 7 days.</p>
      ) : (
        <div className="quiz-list">
          {quizzes.map((quiz, index) => (
            <div key={index} className="quiz-card">
              <h2 className="quiz-title">{quiz.title}</h2>
              <p className="quiz-module">
                Module: <strong>{quiz.moduleName}</strong>
              </p>
              <p className="quiz-time">
                Scheduled:{' '}
                {quiz.schedule?.seconds
                  ? new Date(quiz.schedule.seconds * 1000).toLocaleString()
                  : new Date(quiz.schedule).toLocaleString()}
              </p>
              <p className="quiz-expiry">
                Expires:{' '}
                {quiz.expiry?.seconds
                  ? new Date(quiz.expiry.seconds * 1000).toLocaleString()
                  : new Date(quiz.expiry).toLocaleString()}
              </p>
              <p className="quiz-duration">Duration: {quiz.duration} minutes</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingQuizzes;
