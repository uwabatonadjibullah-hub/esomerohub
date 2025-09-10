// src/pages/CreateQuiz.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './CreateQuiz.css';

const CreateQuiz = () => {
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedModuleName, setSelectedModuleName] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [schedule, setSchedule] = useState('');
  const [duration, setDuration] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({ type: 'MCQ', question: '', options: [], answer: '' });

  useEffect(() => {
    const fetchModules = async () => {
      const snapshot = await getDocs(collection(db, 'modules'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(data);
    };
    fetchModules();
  }, []);

  const addQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.answer) return;
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({ type: 'MCQ', question: '', options: [], answer: '' });
  };

  const handleCreateQuiz = async () => {
    if (!quizTitle || !schedule || !duration || questions.length === 0 || !selectedModuleId) return;

    try {
      await addDoc(collection(db, 'quizzes'), {
        moduleId: selectedModuleId,
        moduleName: selectedModuleName,
        title: quizTitle,
        schedule: new Date(schedule),
        duration: parseInt(duration),
        questions,
        scores: []
      });

      navigate('/admin/module-manager');
    } catch (err) {
      console.error('Error creating quiz:', err);
    }
  };

  return (
    <div className="create-quiz-container">
      <h1 className="page-title">📝 Create Quiz</h1>

      <select
        value={selectedModuleId}
        onChange={(e) => {
          const mod = modules.find(m => m.id === e.target.value);
          setSelectedModuleId(mod.id);
          setSelectedModuleName(mod.name);
        }}
      >
        <option value="">Select Module</option>
        {modules.map((mod) => (
          <option key={mod.id} value={mod.id}>{mod.name}</option>
        ))}
      </select>

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