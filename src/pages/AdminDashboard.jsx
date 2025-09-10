import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './AdminDashboard.css';

const calculateStats = (students, module) => {
  const scores = students.map(s => s.marks?.[module] ?? 0).filter(score => score > 0);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const passed = scores.filter(s => s >= 50).length;
  const failed = scores.filter(s => s < 50).length;
  const excellent = scores.filter(s => s >= 80).length;
  const best = students.reduce((top, s) => (s.marks?.[module] > (top?.marks?.[module] || 0) ? s : top), null);
  const bestMale = students.filter(s => s.gender === 'Male').reduce((top, s) => (s.marks?.[module] > (top?.marks?.[module] || 0) ? s : top), null);
  const bestFemale = students.filter(s => s.gender === 'Female').reduce((top, s) => (s.marks?.[module] > (top?.marks?.[module] || 0) ? s : top), null);

  return { avg, passed, failed, excellent, best, bestMale, bestFemale };
};

const AdminDashboard = () => {
  const [studentData, setStudentData] = useState({});
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userSnap = await getDocs(collection(db, 'users'));
      const quizSnap = await getDocs(collection(db, 'quizzes'));
      const moduleSnap = await getDocs(collection(db, 'modules'));

      const users = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const quizzes = quizSnap.docs.map(doc => doc.data());
      const moduleList = moduleSnap.docs.map(doc => doc.data().name);
      setModules(moduleList);

      const studentMarks = {};
      quizzes.forEach(quiz => {
        const { module, scores } = quiz;
        scores.forEach(score => {
          const id = score.studentId;
          if (!studentMarks[id]) studentMarks[id] = {};
          if (!studentMarks[id][module]) studentMarks[id][module] = [];
          studentMarks[id][module].push(score.score);
        });
      });

      const structured = {
        'FILMMAKING AND VIDEO PRODUCTION': { Day: [], Night: [], Weekend: [] },
        'MULTIMEDIA PRODUCTION': { Day: [], Night: [], Weekend: [] }
      };

      users.forEach(user => {
        const { id, firstName, lastName, gender, faculty, program, role } = user;
        if (role !== 'Trainee') return;

        const rawMarks = studentMarks[id] || {};
        const averagedMarks = {};

        // ✅ use moduleList instead of modules
        moduleList.forEach(mod => {
          const scores = rawMarks[mod] || [];
          averagedMarks[mod] = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
        });

        const student = {
          name: `${firstName} ${lastName}`,
          gender,
          marks: averagedMarks
        };

        if (structured[faculty] && structured[faculty][program]) {
          structured[faculty][program].push(student);
        }
      });

      setStudentData(structured);
    };

    fetchData();
  }, []); // ✅ no more ESLint warning

  return (
    <div className="admin-dashboard">
      {Object.entries(studentData).map(([faculty, programs]) => (
        <div key={faculty} className="faculty-section">
          <h2 className="faculty-title">{faculty}</h2>
          {['Day', 'Night', 'Weekend'].map(program => {
            const students = programs[program] || [];
            return (
              <div key={program} className="program-block">
                <h3 className="program-title">{program} Program</h3>
                <table className="module-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      {modules.map((mod, i) => (
                        <th key={i}>{mod}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? (
                      students.map((s, i) => (
                        <tr key={i}>
                          <td>{s.name}</td>
                          {modules.map((mod, j) => (
                            <td key={j}>
                              {s.marks?.[mod] !== null && s.marks?.[mod] !== undefined
                                ? s.marks[mod].toFixed(1)
                                : '-'}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={modules.length + 1} style={{ textAlign: 'center', color: '#999' }}>
                          No students enrolled yet.
                        </td>
                      </tr>
                    )}
                    <tr className="avg-row">
                      <td><strong>Average</strong></td>
                      {modules.map((mod, i) => (
                        <td key={i}>{calculateStats(students, mod).avg.toFixed(1)}</td>
                      ))}
                    </tr>
                    <tr className="report-row">
                      <td><strong>Report</strong></td>
                      {modules.map((mod, i) => {
                        const stats = calculateStats(students, mod);
                        return (
                          <td key={i}>
                            P: {stats.passed} / F: {stats.failed} / E: {stats.excellent}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="best-row">
                      <td><strong>Best Performer</strong></td>
                      {modules.map((mod, i) => (
                        <td key={i}>{calculateStats(students, mod).best?.name || '-'}</td>
                      ))}
                    </tr>
                    <tr className="best-row">
                      <td><strong>Best Male</strong></td>
                      {modules.map((mod, i) => (
                        <td key={i}>{calculateStats(students, mod).bestMale?.name || '-'}</td>
                      ))}
                    </tr>
                    <tr className="best-row">
                      <td><strong>Best Female</strong></td>
                      {modules.map((mod, i) => (
                        <td key={i}>{calculateStats(students, mod).bestFemale?.name || '-'}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
