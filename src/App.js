// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import TraineeHome from './pages/TraineeHome';
import Announcements from './pages/Announcements';
import ModuleManager from './pages/ModuleManager';
import CreateQuiz from './pages/CreateQuiz';
import AddLecture from './components/AddLecture';
import AdminDashboard from './pages/AdminDashboard';
import TraineeAnnouncements from './pages/TraineeAnnouncements';
import TraineeModule from './pages/TraineeModule';
import TraineeDashboard from './pages/TraineeDashboard'; // ✅ NEW
import UpcomingQuizzes from './pages/UpcomingQuizzes';   // ✅ NEW
import TakeQuiz from './pages/TakeQuiz';                 // ✅ NEW

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/admin/announcements" element={<Announcements />} />
      <Route path="/admin/module-manager" element={<ModuleManager />} />
      <Route path="/admin/module/:moduleId/add-lecture" element={<AddLecture />} />
      <Route path="/admin/module/:moduleId/create-quiz" element={<CreateQuiz />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Trainee Routes */}
      <Route path="/trainee" element={<TraineeHome />} />
      <Route path="/trainee/announcements" element={<TraineeAnnouncements />} />
      <Route path="/trainee/modules" element={<TraineeModule />} />
      <Route path="/trainee/dashboard" element={<TraineeDashboard />} /> {/* ✅ NEW */}
      <Route path="/trainee/upcoming-quizzes" element={<UpcomingQuizzes />} /> {/* ✅ NEW */}
      <Route path="/trainee/quiz/:quizId" element={<TakeQuiz />} /> {/* ✅ NEW */}
    </Routes>
  );
}

export default App;