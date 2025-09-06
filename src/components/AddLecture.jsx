// src/pages/AddLecture.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import './AddLecture.css';

const AddLecture = () => {
  const { moduleId } = useParams(); // assuming route like /admin/module/:moduleId/add-lecture
  const navigate = useNavigate();
  const [lectureName, setLectureName] = useState('');
  const [lectureLink, setLectureLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddLecture = async () => {
    if (!lectureName || !lectureLink) {
      setError('Please fill in both fields.');
      return;
    }

    try {
      const moduleRef = doc(db, 'modules', moduleId);
      await updateDoc(moduleRef, {
        lectures: arrayUnion({ name: lectureName, link: lectureLink })
      });

      setSuccess('Lecture added successfully!');
      setError('');
      setTimeout(() => navigate(`/admin/module-manager`), 2000);
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <div className="add-lecture-container">
      <h1 className="page-title">🎬 Add Lecture</h1>
      <input
        type="text"
        placeholder="Lecture Name"
        value={lectureName}
        onChange={(e) => setLectureName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Lecture Link (e.g., YouTube)"
        value={lectureLink}
        onChange={(e) => setLectureLink(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <button className="btn gold" onClick={handleAddLecture}>Add Lecture</button>
    </div>
  );
};

export default AddLecture;