// src/pages/TraineeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './TraineeDashboard.css';

const TraineeDashboard = () => {
  const [userInfo, setUserInfo] = useState({});
  const [modules, setModules] = useState([]);
  const [scores, setScores] = useState({});
  const [rank, setRank] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      setUserInfo(userData);

      const moduleSnap = await getDocs(collection(db, 'modules'));
      const moduleList = moduleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(moduleList);

      const quizSnap = await getDocs(collection(db, 'quizzes'));
      const allQuizzes = quizSnap.docs.map(doc => doc.data());

      const traineeScores = {};
      const facultyScores = [];

      allQuizzes.forEach(quiz => {
        const { module, type, scores } = quiz;
        scores.forEach(s => {
          if (s.studentId === user.uid) {
            if (!traineeScores[module]) traineeScores[module] = {};
            traineeScores[module][type] = s.score;
          }

          // Collect scores for ranking
          facultyScores.push({ studentId: s.studentId, module, type, score: s.score });
        });
      });

      setScores(traineeScores);

      // Calculate rank
      const myTotal = Object.values(traineeScores).reduce((sum, mod) => {
        return sum + Object.values(mod).reduce((a, b) => a + b, 0);
      }, 0);

      const totals = {};
      facultyScores.forEach(s => {
        if (!totals[s.studentId]) totals[s.studentId] = 0;
        totals[s.studentId] += s.score;
      });

      const sorted = Object.values(totals).filter(Boolean).sort((a, b) => b - a);
      const myRank = sorted.findIndex(t => t <= myTotal) + 1;
      setRank(myRank);
    };

    fetchData();
  }, []);

  const getModuleTotal = (mod) => {
    const quiz = scores[mod]?.Quiz || 0;
    const cat = scores[mod]?.CAT || 0;
    return quiz + cat;
  };

  const getAverage = () => {
    const totals = modules.map(m => getModuleTotal(m.name));
    const sum = totals.reduce((a, b) => a + b, 0);
    return modules.length ? (sum / modules.length).toFixed(1) : '0.0';
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">🎓 Trainee Dashboard</h1>
      <div className="trainee-info">
        <p><strong>Name:</strong> {userInfo.firstName} {userInfo.lastName}</p>
        <p><strong>Faculty:</strong> {userInfo.faculty}</p>
        <p><strong>Gender:</strong> {userInfo.gender}</p>
      </div>

      <table className="score-table">
        <thead>
          <tr>
            <th>Module</th>
            <th>Quiz</th>
            <th>CAT</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((mod, i) => (
            <tr key={i}>
              <td>{mod.name}</td>
              <td>{scores[mod.name]?.Quiz ?? '-'}</td>
              <td>{scores[mod.name]?.CAT ?? '-'}</td>
              <td>{getModuleTotal(mod.name)}</td>
            </tr>
          ))}
          <tr className="average-row">
            <td><strong>Average (over 100)</strong></td>
            <td colSpan="3">{getAverage()}</td>
          </tr>
          <tr className="rank-row">
            <td><strong>Rank in Faculty</strong></td>
            <td colSpan="3">{rank ? `#${rank}` : 'Calculating...'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TraineeDashboard;
