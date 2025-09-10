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

      const snapshot = await getDocs(collection(db, 'quizzes'));
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(q => {
          if (!q.schedule?.seconds) return false;
          const start = new Date(q.schedule.seconds * 1000);
          return start >= now && start <= oneWeekFromNow;
        })
        .sort((a, b) => {
          const aDate = new Date(a.schedule.seconds * 1000);
          const bDate = new Date(b.schedule.seconds * 1000);
          return aDate - bDate;
        });

      setQuizzes(data);
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
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h2 className="quiz-title">{quiz.title}</h2>
              <p className="quiz-module">
                Module: <strong>{quiz.moduleName || 'Unknown'}</strong>
              </p>
              <p className="quiz-time">
                Scheduled: {quiz.schedule?.seconds
                  ? new Date(quiz.schedule.seconds * 1000).toLocaleString()
                  : 'N/A'}
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