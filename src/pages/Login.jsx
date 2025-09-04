// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const quotes = [
  "Welcome back — your journey continues.",
  "Every login is a step toward mastery.",
  "Your future is just one click away."
];

const mockUserRoles = {
  'adminuser': 'Admin',
  'traineeuser': 'Trainee'
};

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const email = `${username}@gmail.com`;
    console.log('Logging in with:', email);

    // Simulate role lookup
    const role = mockUserRoles[username.toLowerCase()];

    if (!role) {
      setError('User role not found. Please check your credentials.');
      return;
    }

    // Redirect based on role
    if (role === 'Admin') {
      navigate('/admin');
    } else if (role === 'Trainee') {
      navigate('/trainee');
    } else {
      setError('Invalid role detected.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="quote">{quotes[0]}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />
          {formData.username && (
            <p className="email-preview">
              Logging in as: <strong>{formData.username}@gmail.com</strong>
            </p>
          )}
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn gold">Login</button>
        </form>
        <p className="signup-link">
          Don't have an account? <span onClick={() => navigate('/signup')}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;