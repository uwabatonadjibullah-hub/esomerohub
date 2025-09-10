import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './TakeQuiz.css';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
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
        setQuiz({ id: quizSnap.id, ...data });

        const now = new Date();
        const start = new Date(data.schedule.seconds * 1000);
        const end = new Date(start.getTime() + data.duration * 60 * 1000);
        const remaining = Math.floor((end - now) / 1000);
        setTimeLeft(remaining > 0 ? remaining : 0);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (submitted || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswerChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleSubmit = async () => {
    if (!quiz || submitted) return;

    let total = 0;
    quiz.questions.forEach((q, i) => {
      const correct = q.answer.trim().toLowerCase();
      const given = (answers[i] || '').trim().toLowerCase();
      if (correct === given) total += 1;
    });

    const finalScore = Math.round((total / quiz.questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    setShowPopup(true);

    const quizRef = doc(db, 'quizzes', quiz.id);
    const updatedScores = [...(quiz.scores || []), {
      studentId: auth.currentUser.uid,
      score: finalScore,
      timestamp: new Date()
    }];

    await updateDoc(quizRef, { scores: updatedScores });
  };

  if (!quiz) return <div className="take-quiz-container">Loading quiz...</div>;

  const now = new Date();
  const start = new Date(quiz.schedule.seconds * 1000);
  const end = new Date(start.getTime() + quiz.duration * 60 * 1000);

  if (now < start) return <div className="take-quiz-container">⛔ Quiz not yet available.</div>;
  if (now > end && !submitted) return <div className="take-quiz-container">✔️ Quiz has expired.</div>;

  return (
    <div className="take-quiz-container">
      <h1 className="quiz-title">📝 {quiz.title}</h1>
      <p className="quiz-meta">Module: {quiz.moduleName}</p>
      <p className="quiz-meta">Duration: {quiz.duration} minutes</p>
      {!submitted && <p className="countdown">⏳ Time Left: {formatTime(timeLeft)}</p>}

      {quiz.questions.map((q, i) => (
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
                  {opt}
                </label>
              ))}
            </div>
          )}
          {q.type === 'TrueFalse' && (
            <div className="options">
              {['True', 'False'].map((opt, j) => (
                <label key={j}>
                  <input
                    type="radio"
                    name={`q${i}`}
                    value={opt}
                    onChange={() => handleAnswerChange(i, opt)}
                    disabled={submitted}
                  />
                  {opt}
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