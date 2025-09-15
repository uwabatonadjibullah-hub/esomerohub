// src/pages/TakeQuiz.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./TakeQuiz.css";

const shuffleArray = (arr) =>
  arr
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);

const TakeQuiz = () => {
  const { moduleId, quizTitle } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // Load quiz from module doc
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const moduleRef = doc(db, "modules", moduleId);
        const moduleSnap = await getDoc(moduleRef);

        if (!moduleSnap.exists()) return;

        const moduleData = moduleSnap.data();

        // Match quiz by title
        const foundQuiz = moduleData.quizzes?.find(
          (q) =>
            q.title.toLowerCase().trim() ===
            decodeURIComponent(quizTitle).toLowerCase().trim()
        );

        if (!foundQuiz) return;

        // Shuffle questions + options
        const randomizedQuestions = shuffleArray(
          foundQuiz.questions.map((q) => {
            if (q.type === "MCQ") {
              return { ...q, options: shuffleArray(q.options) };
            }
            if (q.type === "TrueFalse") {
              return { ...q, options: shuffleArray(["True", "False"]) };
            }
            return q;
          })
        );

        setQuiz({ ...foundQuiz, moduleName: moduleData.moduleName });
        setShuffledQuestions(randomizedQuestions);

        // Timer setup
        const now = new Date();
        const expiry = foundQuiz.expiry?.seconds
          ? new Date(foundQuiz.expiry.seconds * 1000)
          : new Date(foundQuiz.expiry);

        const endByDuration = new Date(
          now.getTime() + foundQuiz.duration * 60 * 1000
        );
        const effectiveEnd = endByDuration < expiry ? endByDuration : expiry;

        const remaining = Math.floor((effectiveEnd - now) / 1000);
        setTimeLeft(remaining > 0 ? remaining : 0);
      } catch (error) {
        console.error("Error loading quiz:", error);
      }
    };

    fetchQuiz();
  }, [moduleId, quizTitle]);

  // Handle submission
  const handleSubmit = useCallback(async () => {
    if (!quiz || submitted) return;

    try {
      // Prevent duplicate submissions
      const resultQuery = query(
        collection(db, "quizResults"),
        where("moduleId", "==", moduleId),
        where("quizTitle", "==", quiz.title),
        where("traineeId", "==", auth.currentUser.uid)
      );
      const resultSnap = await getDocs(resultQuery);
      if (!resultSnap.empty) {
        setSubmitted(true);
        setShowPopup(true);
        return;
      }

      // Calculate score
      let total = 0;
      shuffledQuestions.forEach((q, i) => {
        const correct = q.answer.trim().toLowerCase();
        const given = (answers[i] || "").trim().toLowerCase();
        if (correct === given) total += 1;
      });

      const finalScore = Math.round(
        (total / shuffledQuestions.length) * 100
      );
      setScore(finalScore);
      setSubmitted(true);
      setShowPopup(true);

      // ✅ Save result safely
      const quizResultData = {
        moduleId,
        quizTitle: quiz.title,
        traineeId: auth.currentUser.uid,
        score: finalScore,
        timestamp: new Date(),
        duration: quiz.duration,
      };

      // Add moduleName only if it exists
      if (quiz.moduleName) {
        quizResultData.moduleName = quiz.moduleName;
      }

      await addDoc(collection(db, "quizResults"), quizResultData);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  }, [quiz, shuffledQuestions, answers, submitted, moduleId]);

  // Timer effect
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
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleAnswerChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  if (!quiz)
    return (
      <div className="take-quiz-container">Loading quiz...</div>
    );

  // Availability check
  const now = new Date();
  const start = quiz.schedule?.seconds
    ? new Date(quiz.schedule.seconds * 1000)
    : new Date(quiz.schedule);
  const expiry = quiz.expiry?.seconds
    ? new Date(quiz.expiry.seconds * 1000)
    : new Date(quiz.expiry);

  if (now < start)
    return (
      <div className="take-quiz-container">⛔ Quiz not yet available.</div>
    );
  if (now > expiry && !submitted)
    return (
      <div className="take-quiz-container">✔️ Quiz has expired.</div>
    );

  return (
    <div className="take-quiz-container">
      <h1 className="quiz-title">📝 {quiz.title}</h1>
      <p className="quiz-meta">Module: {quiz.moduleName || moduleId}</p>
      <p className="quiz-meta">Duration: {quiz.duration} minutes</p>
      <p className="quiz-meta">Expiry: {expiry.toLocaleString()}</p>
      {!submitted && (
        <p className="countdown">⏳ Time Left: {formatTime(timeLeft)}</p>
      )}

      {shuffledQuestions.map((q, i) => {
        const correctAns = q.answer.trim().toLowerCase();
        const userAns = (answers[i] || "").trim().toLowerCase();
        const isCorrect = correctAns === userAns;

        return (
          <div key={i} className="question-block">
            <p className="question-text">
              {i + 1}. {q.question}
            </p>

            {q.type !== "ShortAnswer" ? (
              <div className="options">
                {q.options.map((opt, j) => {
                  const optLower = opt.trim().toLowerCase();
                  let className = "";

                  if (reviewMode) {
                    if (optLower === userAns && isCorrect) className = "correct";
                    if (optLower === userAns && !isCorrect) className = "wrong";
                    if (optLower === correctAns && !isCorrect)
                      className = "correct";
                  }

                  return (
                    <label key={j} className={className}>
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={opt}
                        onChange={() => handleAnswerChange(i, opt)}
                        disabled={submitted || reviewMode}
                        checked={answers[i] === opt}
                      />
                      {String.fromCharCode(65 + j)}. {opt}
                    </label>
                  );
                })}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Your answer"
                value={answers[i] || ""}
                onChange={(e) => handleAnswerChange(i, e.target.value)}
                disabled={submitted || reviewMode}
                className={
                  reviewMode ? (isCorrect ? "correct" : "wrong") : ""
                }
              />
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button className="btn gold" onClick={handleSubmit}>
          Submit Quiz
        </button>
      ) : !reviewMode ? (
        <p className="score-display">🎉 Your Score: {score}%</p>
      ) : null}

      {/* ✅ Back button at bottom in review mode */}
      {reviewMode && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button
            className="btn gold"
            onClick={() => navigate("/trainee/modules")}
          >
            ⬅ Back to Modules
          </button>
        </div>
      )}

      {/* ✅ Show popup only if not in review mode */}
      {showPopup && !reviewMode && (
        <div className="score-popup">
          <div className="popup-content">
            <h2>🎉 Quiz Completed</h2>
            <p>
              Your Score: <strong>{score}%</strong>
            </p>
            <div className="popup-buttons">
              <button
                className="btn gold"
                onClick={() => {
                  setReviewMode(true);
                  setShowPopup(false); // 🔑 close popup on review
                }}
              >
                Review
              </button>
              <button
                className="btn gold"
                onClick={() => navigate("/trainee/modules")}
              >
                Back to Modules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
