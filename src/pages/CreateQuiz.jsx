// src/pages/CreateQuiz.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import './CreateQuiz.css';

const CreateQuiz = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState('');
  const [schedule, setSchedule] = useState('');
  const [duration, setDuration] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({ type: 'MCQ', question: '', options: [], answer: '' });
  const [moduleName, setModuleName] = useState('');

  useEffect(() => {
    const fetchModuleName = async () => {
      const moduleRef = doc(db, 'modules', moduleId);
      const moduleSnap = await getDoc(moduleRef);
      if (moduleSnap.exists()) {
        setModuleName(moduleSnap.data().name || 'Unnamed Module');
      }
    };
    fetchModuleName();
  }, [moduleId]);

  const addQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.answer) return;
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({ type: 'MCQ', question: '', options: [], answer: '' });
  };

  const handleCreateQuiz = async () => {
    if (!quizTitle || !schedule || !duration || questions.length === 0) return;

    try {
      await addDoc(collection(db, 'quizzes'), {
        moduleId,
        moduleName,
        title: quizTitle,
        schedule: new Date(schedule),
        duration: parseInt(duration),
        questions,
        scores: [] // trainee scores will be added here later
      });

      navigate('/admin/module-manager');
    } catch (err) {
      console.error('Error creating quiz:', err);
    }
  };

  return (
    <div className="create-quiz-container">
      <h1 className="page-title">📝 Create Quiz</h1>
      <input
        type="text"
        placeholder="Quiz Title"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
      />
      <input
        type="datetime-local"
        value={schedule}
        onChange={(e) => setSchedule(e.target.value)}
      />
      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <div className="question-builder">
        <select
          value={currentQuestion.type}
          onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
        >
          <option value="MCQ">Multiple Choice</option>
          <option value="TrueFalse">True/False</option>
          <option value="ShortAnswer">Short Answer</option>
        </select>
        <input
          type="text"
          placeholder="Question"
          value={currentQuestion.question}
          onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
        />
        {currentQuestion.type === 'MCQ' && (
          <>
            <input
              type="text"
              placeholder="Option A"
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, options: [e.target.value, ...currentQuestion.options.slice(1)] })}
            />
            <input
              type="text"
              placeholder="Option B"
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, options: [currentQuestion.options[0], e.target.value] })}
            />
          </>
        )}
        <input
          type="text"
          placeholder="Correct Answer"
          value={currentQuestion.answer}
          onChange={(e) => setCurrentQuestion({ ...currentQuestion, answer: e.target.value })}
        />
        <button className="btn" onClick={addQuestion}>Add Question</button>
      </div>

      <button className="btn gold" onClick={handleCreateQuiz}>Create Quiz</button>
    </div>
  );
};

export default CreateQuiz;