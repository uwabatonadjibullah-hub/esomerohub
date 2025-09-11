// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Login.css';

const quotes = [
  "Welcome back — your journey continues.",
  "Every login is a step toward mastery.",
  "Your future is just one click away."
];

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unverifiedUser, setUnverifiedUser] = useState(null); // store unverified user

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        setUnverifiedUser(user); // store user so we can resend
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        setError('User profile not found.');
        return;
      }

      const role = userDoc.data().role;
      setSuccess('Login successful! Redirecting...');
      setError('');
      setUnverifiedUser(null);

      setTimeout(() => {
        if (role === 'Admin') {
          navigate('/admin');
        } else if (role === 'Trainee') {
          navigate('/trainee');
        } else {
          setError('Invalid role detected.');
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
      setSuccess('');
      setUnverifiedUser(null);
    }
  };

  const handleResendVerification = async () => {
    if (unverifiedUser) {
      try {
        await sendEmailVerification(unverifiedUser);
        setSuccess('Verification email resent. Please check your inbox.');
        setError('');
      } catch (err) {
        setError('Failed to resend verification email. Try again later.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="quote">{quotes[0]}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button type="submit" className="btn gold">Login</button>
        </form>

        {/* Resend Verification Button */}
        {unverifiedUser && (
          <button
            onClick={handleResendVerification}
            className="btn resend-btn"
          >
            Resend Verification Email
          </button>
        )}

        <p className="signup-link">
          Don't have an account? <span onClick={() => navigate('/signup')}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
