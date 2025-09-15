// src/components/ProfileModal.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './ProfileModal.css';

const ProfileModal = ({ onClose }) => {
  const [userInfo, setUserInfo] = useState({});
  const [average, setAverage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const fullProfile = { ...data, email: user.email };
        setUserInfo(fullProfile);

        if (data.role === 'trainee') {
          const quizSnap = await getDocs(collection(db, 'quizzes'));
          const allQuizzes = quizSnap.docs.map(doc => doc.data());

          let total = 0;
          let count = 0;

          allQuizzes.forEach(q => {
            q.scores?.forEach(s => {
              if (s.studentId === user.uid) {
                total += s.score;
                count += 1;
              }
            });
          });

          setAverage(count > 0 ? Math.round(total / count) : 0);
        }
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <h2 className="modal-title">👤 Your Profile</h2>
        <p><strong>First Name:</strong> {userInfo.firstName}</p>
        <p><strong>Last Name:</strong> {userInfo.lastName}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
        <p><strong>Gender:</strong> {userInfo.gender}</p>
        <p><strong>Faculty:</strong> {userInfo.faculty}</p>
        <p><strong>Role:</strong> {userInfo.role}</p>
        {userInfo.role === 'trainee' && (
          <p><strong>Overall Marks:</strong> {average}%</p>
        )}
        
        <div className="modal-actions">
          <button className="btn gold" onClick={onClose}>Close</button>
          <button className="btn gold" onClick={handleLogout}>Log Out</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
