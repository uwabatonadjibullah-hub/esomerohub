// src/pages/TakeQuiz.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import './TakeQuiz.css';

const shuffleArray = (arr) => {
  return arr
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      const quizRef = doc(db, 'quizzes', quizId);
      const quizSnap = await getDoc(quizRef);
      if (quizSnap.exists()) {
        const data = quizSnap.data();

        const randomizedQuestions = shuffleArray(
          data.questions.map((q) => {
            if (q.type === 'MCQ') {
              return { ...q, options: shuffleArray(q.options) };
            }
            if (q.type === 'TrueFalse') {
              return { ...q, options: shuffleArray(['True', 'False']) };
            }
            return q;
          })
        );

        setQuiz({ id: quizSnap.id, ...data });
        setShuffledQuestions(randomizedQuestions);

        const now = new Date();
        const start = data.schedule?.seconds
          ? new Date(data.schedule.seconds * 1000)
          : new Date(data.schedule);
        const expiry = data.expiry?.seconds
          ? new Date(data.expiry.seconds * 1000)
          : new Date(data.expiry);

        const endByDuration = new Date(start.getTime() + data.duration * 60 * 1000);
        const effectiveEnd = endByDuration < expiry ? endByDuration : expiry;

        const remaining = Math.floor((effectiveEnd - now) / 1000);
        setTimeLeft(remaining > 0 ? remaining : 0);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleSubmit = useCallback(async () => {
    if (!quiz || submitted) return;

    // Check for duplicate submission
    const resultQuery = query(
      collection(db, 'quizResults'),
      where('quizId', '==', quiz.id),
      where('traineeId', '==', auth.currentUser.uid)
    );
    const resultSnap = await getDocs(resultQuery);
    if (!resultSnap.empty) {
      setSubmitted(true);
      setShowPopup(true);
      return;
    }

    let total = 0;
    shuffledQuestions.forEach((q, i) => {
      const correct = q.answer.trim().toLowerCase();
      const given = (answers[i] || '').trim().toLowerCase();
      if (correct === given) total += 1;
    });

    const finalScore = Math.round((total / shuffledQuestions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    setShowPopup(true);

    await addDoc(collection(db, 'quizResults'), {
      quizId: quiz.id,
      traineeId: auth.currentUser.uid,
      score: finalScore,
      timestamp: new Date(),
      quizTitle: quiz.title,
      moduleName: quiz.moduleName,
      duration: quiz.duration
    });
  }, [quiz, shuffledQuestions, answers, submitted]);

  useEffect(() => {
    if (submitted || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted, handleSubmit]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswerChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  if (!quiz) return <div className="take-quiz-container">Loading quiz...</div>;

  const now = new Date();
  const start = quiz.schedule?.seconds
    ? new Date(quiz.schedule.seconds * 1000)
    : new Date(quiz.schedule);
  const expiry = quiz.expiry?.seconds
    ? new Date(quiz.expiry.seconds * 1000)
    : new Date(quiz.expiry);

  if (now < start) return <div className="take-quiz-container">⛔ Quiz not yet available.</div>;
  if (now > expiry && !submitted) return <div className="take-quiz-container">✔️ Quiz has expired.</div>;

  return (
    <div className="take-quiz-container">
      <h1 className="quiz-title">📝 {quiz.title}</h1>
      <p className="quiz-meta">Module: {quiz.moduleName}</p>
      <p className="quiz-meta">Duration: {quiz.duration} minutes</p>
      <p className="quiz-meta">Expiry: {expiry.toLocaleString()}</p>
      {!submitted && <p className="countdown">⏳ Time Left: {formatTime(timeLeft)}</p>}

      {shuffledQuestions.map((q, i) => (
        <div key={i} className="question-block">
          <p className="question-text">{i + 1}. {q.question}</p>
          {q.type === 'MCQ' && (
            <div className="options">
              {q.options.map((opt, j) => (
                <label key={j}>
                  <input
                    type="radio"
                    name={`q${i}`}
                    value={opt}
                    onChange={() => handleAnswerChange(i, opt)}
                    disabled={submitted}
                  />
                  {String.fromCharCode(65 + j)}. {opt}
                </label>
              ))}
            </div>
          )}
          {q.type === 'TrueFalse' && (
            <div className="options">
              {q.options.map((opt, j) => (
                <label key={j}>
                  <input
                    type="radio"
                    name={`q${i}`}
                    value={opt}
                    onChange={() => handleAnswerChange(i, opt)}
                    disabled={submitted}
                  />
                  {String.fromCharCode(65 + j)}. {opt}
                </label>
              ))}
            </div>
          )}
          {q.type === 'ShortAnswer' && (
            <input
              type="text"
              placeholder="Your answer"
              onChange={(e) => handleAnswerChange(i, e.target.value)}
              disabled={submitted}
            />
          )}
        </div>
      ))}

      {!submitted ? (
        <button className="btn gold" onClick={handleSubmit}>Submit Quiz</button>
      ) : (
        <p className="score-display">🎉 Your Score: {score}%</p>
      )}

      {showPopup && (
        <div className="score-popup">
          <div className="popup-content">
            <h2>🎉 Quiz Completed</h2>
            <p>Your Score: <strong>{score}%</strong></p>
            <button className="btn gold" onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
