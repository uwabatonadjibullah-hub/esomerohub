// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import TraineeHome from './pages/TraineeHome';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/trainee" element={<TraineeHome />} />
    </Routes>
  );
}

export default App;