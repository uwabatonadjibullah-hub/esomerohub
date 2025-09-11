// src/pages/ModuleManager.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import './ModuleManager.css';

const ModuleManager = () => {
  const [modules, setModules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newModule, setNewModule] = useState({ name: '', key: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      const snapshot = await getDocs(collection(db, 'modules'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(data);
    };
    fetchModules();
  }, []);

  const handleAddModule = async () => {
    if (!newModule.name || !newModule.key) return;

    try {
      const docRef = await addDoc(collection(db, 'modules'), {
        name: newModule.name,
        enrolmentKey: newModule.key,
        lectures: [],
        quizzes: []
      });

      setModules([...modules, { id: docRef.id, ...newModule, lectures: [], quizzes: [] }]);
      setNewModule({ name: '', key: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating module:', err);
    }
  };

  const handleDeleteModule = async (id) => {
    try {
      await deleteDoc(doc(db, 'modules', id));
      setModules(modules.filter(mod => mod.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error deleting module:', err);
    }
  };

  return (
    <div className="module-manager-container">
      {/* 🔹 Admin Navigation Bar */}
      <div className="admin-nav">
        <button className="btn" onClick={() => navigate('/admin')}>
          🏡 Home
        </button>
        <button className="btn" onClick={() => navigate('/admin/announcements')}>
          📣 Announcements
        </button>
        <button className="btn" onClick={() => navigate('/admin/dashboard')}>
          📊 Dashboard
        </button>
      </div>

      <h1 className="page-title">📚 Module Manager</h1>

      <button className="btn gold" onClick={() => setShowForm(true)}>+ Add Module</button>

      {showForm && (
        <div className="module-form">
          <input
            type="text"
            placeholder="Module Name"
            value={newModule.name}
            onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Enrolment Key"
            value={newModule.key}
            onChange={(e) => setNewModule({ ...newModule, key: e.target.value })}
          />
          <button className="btn gold" onClick={handleAddModule}>Create</button>
        </div>
      )}

      <div className="module-list">
        {modules.map((mod) => (
          <div key={mod.id} className="module-card">
            <h2>{mod.name}</h2>
            <p>Enrolment Key: <strong>{mod.enrolmentKey}</strong></p>

            {/* Lectures */}
            {mod.lectures && mod.lectures.length > 0 && (
              <div className="lectures-section">
                <h3>📖 Lectures</h3>
                <ul>
                  {mod.lectures.map((lec, i) => (
                    <li key={i}>{lec.title || `Lecture ${i + 1}`}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quizzes */}
            {mod.quizzes && mod.quizzes.length > 0 && (
              <div className="quizzes-section">
                <h3>📝 Quizzes</h3>
                <ul>
                  {mod.quizzes.map((quiz, i) => (
                    <li key={i}>
                      {quiz.title} ({quiz.questions?.length || 0} questions)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="module-actions">
              <button className="btn" onClick={() => navigate(`/admin/module/${mod.id}/add-lecture`)}>
                Add Lecture
              </button>
              <button className="btn" onClick={() => navigate(`/admin/module/${mod.id}/create-quiz`)}>
                Create Quiz
              </button>
              <button className="btn red" onClick={() => setConfirmDeleteId(mod.id)}>
                Delete Module
              </button>
            </div>

            {confirmDeleteId === mod.id && (
              <div className="confirm-box">
                <p>Are you sure you want to delete this module?</p>
                <button className="btn gold" onClick={() => handleDeleteModule(mod.id)}>Yes</button>
                <button className="btn" onClick={() => setConfirmDeleteId(null)}>No</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleManager;
