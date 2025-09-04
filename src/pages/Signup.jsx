// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const quotes = [
  "Your future begins with a single step.",
  "Greatness starts with showing up.",
  "Create. Learn. Lead. Repeat."
];

const Signup = () => {
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    gender: '',
    faculty: '',
    role: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { firstName, lastName, username, password, gender, faculty, role } = formData;

    if (!firstName || !lastName || !username || !password || !gender || !faculty || !role) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const email = `${username}@gmail.com`;
    console.log('Creating user:', { ...formData, email });

    navigate('/login');
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="quote">{quotes[quoteIndex]}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
          />
          {formData.username && (
            <p className="email-preview">
              Your email will be: <strong>{formData.username}@gmail.com</strong>
            </p>
          )}
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />
          <select name="gender" onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <select name="faculty" onChange={handleChange}>
            <option value="">Select Faculty</option>
            <option value="FILMMAKING AND VIDEO PRODUCTION">FILMMAKING AND VIDEO PRODUCTION</option>
            <option value="MULTIMEDIA PRODUCTION">MULTIMEDIA PRODUCTION</option>
          </select>
          <select name="role" onChange={handleChange}>
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="Trainee">Trainee</option>
          </select>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn gold">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;