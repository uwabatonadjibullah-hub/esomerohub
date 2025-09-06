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
import AddLecture from './components/AddLecture'; // assuming it's in components
import AdminDashboard from './pages/AdminDashboard'; // new dashboard page

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
    </Routes>
  );
}

export default App;