// src/pages/TraineeDashboard.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./TraineeDashboard.css";

const TraineeDashboard = () => {
  const [userInfo, setUserInfo] = useState({});
  const [results, setResults] = useState([]);
  const [modulesMap, setModulesMap] = useState({});
  const [quizTitles, setQuizTitles] = useState([]);
  const [programRank, setProgramRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        setLoading(true);
        
        // ✅ Load trainee info
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;
        const traineeData = userSnap.data();
        setUserInfo(traineeData);

        // ✅ Load all modules into a map { moduleId: moduleName }
        const moduleSnap = await getDocs(collection(db, "modules"));
        const moduleMap = {};
        moduleSnap.forEach((docSnap) => {
          moduleMap[docSnap.id] = docSnap.data().name || "Unnamed Module";
        });
        setModulesMap(moduleMap);

        // ✅ Load this trainee's quiz results
        const q = query(collection(db, "quizResults"), where("traineeId", "==", user.uid));
        const quizSnap = await getDocs(q);
        const traineeResults = quizSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setResults(traineeResults);

        // ✅ Collect all quiz titles dynamically
        const titles = [...new Set(traineeResults.map((r) => r.quizTitle))];
        setQuizTitles(titles);

        // ✅ Compute rank across program (only users with same program)
        const allResultsSnap = await getDocs(collection(db, "quizResults"));
        const totals = {};
        allResultsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.traineeId) {
            totals[data.traineeId] = (totals[data.traineeId] || 0) + (data.score || 0);
          }
        });

        // Get all users in the same program with their totals
        const usersSnap = await getDocs(collection(db, "users"));
        const programUsersWithTotals = [];

        usersSnap.forEach((docSnap) => {
          const u = docSnap.data();
          if (u.program === traineeData.program && totals[docSnap.id] !== undefined) {
            programUsersWithTotals.push({
              userId: docSnap.id,
              total: totals[docSnap.id] || 0
            });
          }
        });

        // Sort by total score descending
        programUsersWithTotals.sort((a, b) => b.total - a.total);

        // Find current user's rank (fix: use userId comparison)
        const userIndex = programUsersWithTotals.findIndex(user => user.userId === user.uid);
        const myRank = userIndex !== -1 ? userIndex + 1 : null;
        setProgramRank(myRank);

      } catch (error) {
        console.error("Error fetching data:", error);
        setProgramRank(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Compute average score
  const getAverage = () => {
    if (!results.length) return "0.0";
    const sum = results.reduce((acc, r) => acc + (r.score || 0), 0);
    return (sum / results.length).toFixed(1);
  };

  // ✅ Helper: Get score by module & quiz title (missing quiz = 0)
  const getScore = (moduleId, quizTitle) => {
    const match = results.find(
      (r) => r.moduleId === moduleId && r.quizTitle === quizTitle
    );
    return match ? match.score : 0;
  };

  // ✅ Helper: Compute total for a module
  const getModuleTotal = (moduleId) => {
    return results
      .filter((r) => r.moduleId === moduleId)
      .reduce((sum, r) => sum + (r.score || 0), 0);
  };

  // ✅ CSV Export
  const exportCSV = () => {
    let csv = "Module," + quizTitles.join(",") + ",Total,Rank\n";

    Object.entries(modulesMap).forEach(([moduleId, moduleName]) => {
      const row = [
        moduleName,
        ...quizTitles.map((title) => getScore(moduleId, title)),
        getModuleTotal(moduleId),
        "-",
      ];
      csv += row.join(",") + "\n";
    });

    // Add summary rows
    csv += `Average,,,,${getAverage()}%\n`;
    csv += `Program Rank,,,,#${programRank || "-"}`;

    // Trigger download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trainee_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      {/* Sticky Navigation Bar */}
      <div className="trainee-nav">
        <button className="btn" onClick={() => navigate("/trainee")}>
          🏡 Home
        </button>
        <button className="btn" onClick={() => navigate("/trainee/modules")}>
          📚 Modules
        </button>
        <button className="btn" onClick={() => navigate("/trainee/announcements")}>
          📢 Announcements
        </button>
      </div>

      <h1 className="dashboard-title">🎓 Trainee Dashboard</h1>
      <div className="trainee-info">
        <p>
          <strong>Name:</strong> {userInfo.firstName} {userInfo.lastName}
        </p>
        <p>
          <strong>Faculty:</strong> {userInfo.faculty}
        </p>
        <p>
          <strong>Gender:</strong> {userInfo.gender}
        </p>
        <p>
          <strong>Program:</strong> {userInfo.program}
        </p>
      </div>

      <button className="btn export-btn" onClick={exportCSV}>
        ⬇️ Export CSV
      </button>

      <table className="score-table">
        <thead>
          <tr>
            <th>Module</th>
            {quizTitles.map((title, i) => (
              <th key={i}>{title}</th>
            ))}
            <th>Total</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(modulesMap).map(([moduleId, moduleName]) => (
            <tr key={moduleId}>
              <td>{moduleName}</td>
              {quizTitles.map((title, i) => (
                <td key={i}>{getScore(moduleId, title)}</td>
              ))}
              <td>{getModuleTotal(moduleId)}</td>
              <td>
                <ModuleRank moduleId={moduleId} />
              </td>
            </tr>
          ))}
          <tr className="average-row">
            <td colSpan={quizTitles.length + 3}>
              <strong>General Average: {getAverage()}%</strong>
            </td>
          </tr>
          <tr className="rank-row">
            <td colSpan={quizTitles.length + 3}>
              <strong>Rank in Program:</strong>{" "}
              {loading ? "Calculating..." : (programRank ? `#${programRank}` : "No rank available")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Small helper component for async module rank
const ModuleRank = ({ moduleId }) => {
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        const allResultsSnap = await getDocs(collection(db, "quizResults"));
        const totals = {};
        allResultsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.moduleId === moduleId) {
            totals[data.traineeId] = (totals[data.traineeId] || 0) + (data.score || 0);
          }
        });

        const user = auth.currentUser;
        if (!user) return;

        // Get all users with their totals for this module
        const usersWithTotals = Object.entries(totals).map(([userId, total]) => ({
          userId,
          total
        }));

        // Sort by total score descending
        usersWithTotals.sort((a, b) => b.total - a.total);

        // Find current user's rank
        const userIndex = usersWithTotals.findIndex(user => user.userId === user.uid);
        const myRank = userIndex !== -1 ? userIndex + 1 : null;
        setRank(myRank);
      } catch (error) {
        console.error("Error fetching module rank:", error);
        setRank(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRank();
  }, [moduleId]);

  return <>{loading ? "-" : (rank ? `#${rank}` : "-")}</>;
};

export default TraineeDashboard;
