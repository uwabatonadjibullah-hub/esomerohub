// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import './Signup.css';

const quotes = [
  "Your future begins with a single step.",
  "Greatness starts with showing up.",
  "Create. Learn. Lead. Repeat."
];

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    gender: '',
    faculty: '',
    role: '',
    program: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, username, password, gender, faculty, role, program } = formData;

    if (!firstName || !lastName || !username || !password || !gender || !faculty || !role || !program) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const email = `${username}@gmail.com`;

    try {
      // 🔎 Check Firestore if email already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('This email is already registered in our system.');
        return;
      }

      // ✅ Proceed with Firebase Auth signup
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        firstName,
        lastName,
        email,
        gender,
        faculty,
        role,
        program,
        createdAt: new Date()
      });

      await sendEmailVerification(userCredential.user);
      setSuccess('Signup successful! Please check your inbox to verify your email.');
      setError('');

      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in instead.');
      } else {
        setError(err.message);
      }
      setSuccess('');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="quote">{quotes[0]}</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} />
          <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} />
          <input type="text" name="username" placeholder="Username" onChange={handleChange} />
          {formData.username && (
            <p className="email-preview">
              Your email will be: <strong>{formData.username}@gmail.com</strong>
            </p>
          )}
          <input type="password" name="password" placeholder="Password" onChange={handleChange} />
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
          <select name="program" onChange={handleChange}>
            <option value="">Select Program</option>
            <option value="Day">Day</option>
            <option value="Night">Night</option>
            <option value="Weekend">Weekend</option>
          </select>
          <select name="role" onChange={handleChange}>
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="Trainee">Trainee</option>
          </select>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button type="submit" className="btn gold">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
