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