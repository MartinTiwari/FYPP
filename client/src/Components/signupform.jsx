// SignupForm.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../CSS/SignupForm.css';

const SignupForm = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: userName,
          user_email: userEmail,
          password: password,
        }),
      });

      if (!response.ok) {
        // Check for server-side error
        const errorData = await response.json();
        setError(errorData.error || 'Error during signup');

        // Clear previous notification on error
        setNotification('');
      } else {
        const data = await response.json();
        setNotification(data.message);
        console.log('Success:', data);

        // Clear form fields on successful signup
        setUserName('');
        setUserEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Clear previous error on success
        setError('');
      }
    } catch (error) {
      setError('Error during signup');
      console.error('Error:', error);

      // Clear previous notification on error
      setNotification('');
    }
  };

  return (
    <div className="signup-container">
      <div className="formcontai">
      {notification && <div className="notification">{notification}</div>}
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <h1>Signup</h1>
        <label htmlFor="userName">User Name:</label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <label htmlFor="userEmail">User Email:</label>
        <input
          type="email"
          id="userEmail"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Signup</button>
      </form>
      <div>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default SignupForm;
