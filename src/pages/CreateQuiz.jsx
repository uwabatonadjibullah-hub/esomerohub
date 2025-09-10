// src/pages/CreateQuiz.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import './CreateQuiz.css';

const CreateQuiz = () => {
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedModuleName, setSelectedModuleName] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [schedule, setSchedule] = useState('');
  const [expiry, setExpiry] = useState('');
  const [duration, setDuration] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'MCQ',
    question: '',
    options: ['', ''],
    answer: ''
  });

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
    setCurrentQuestion({ type: 'MCQ', question: '', options: ['', ''], answer: '' });
  };

  const handleCreateQuiz = async () => {
    if (
      !quizTitle ||
      !schedule ||
      !expiry ||
      !duration ||
      questions.length === 0 ||
      !selectedModuleId
    )
      return;

    try {
      const moduleRef = doc(db, 'modules', selectedModuleId);

      await updateDoc(moduleRef, {
        quizzes: arrayUnion({
          title: quizTitle,
          schedule: new Date(schedule), // start date
          expiry: new Date(expiry),     // end date (life span)
          duration: parseInt(duration),
          questions,
          createdAt: new Date(),
          moduleId: selectedModuleId,
          moduleName: selectedModuleName
        })
      });

      navigate('/admin/module-manager');
    } catch (err) {
      console.error('Error creating quiz:', err);
    }
  };

  return (
    <div className="create-quiz-container">
      <h1 className="page-title">📝 Create Quiz</h1>

      {/* Select Module */}
      <select
        value={selectedModuleId}
        onChange={(e) => {
          const mod = modules.find(m => m.id === e.target.value);
          if (mod) {
            setSelectedModuleId(mod.id);
            setSelectedModuleName(mod.name);
          }
        }}
      >
        <option value="">Select Module</option>
        {modules.map((mod) => (
          <option key={mod.id} value={mod.id}>{mod.name}</option>
        ))}
      </select>

      {/* Quiz Details */}
      <input
        type="text"
        placeholder="Quiz Title"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
      />

      <label>Start Time</label>
      <input
        type="datetime-local"
        value={schedule}
        onChange={(e) => setSchedule(e.target.value)}
      />

      <label>End Time (Expiry)</label>
      <input
        type="datetime-local"
        value={expiry}
        onChange={(e) => setExpiry(e.target.value)}
      />

      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      {/* Question Builder */}
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
              value={currentQuestion.options[0]}
              onChange={(e) => {
                const updatedOptions = [...currentQuestion.options];
                updatedOptions[0] = e.target.value;
                setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
              }}
            />
            <input
              type="text"
              placeholder="Option B"
              value={currentQuestion.options[1]}
              onChange={(e) => {
                const updatedOptions = [...currentQuestion.options];
                updatedOptions[1] = e.target.value;
                setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
              }}
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

      {/* Show added questions */}
      <div className="questions-list">
        {questions.map((q, idx) => (
          <div key={idx} className="question-preview">
            <p><strong>{idx + 1}.</strong> {q.question}</p>
            {q.type === 'MCQ' && (
              <ul>
                {q.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            )}
            <p><em>Answer:</em> {q.answer}</p>
          </div>
        ))}
      </div>

      <button className="btn gold" onClick={handleCreateQuiz}>Create Quiz</button>
    </div>
  );
};

export default CreateQuiz;
