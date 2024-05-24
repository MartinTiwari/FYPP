import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/UserProfile.css';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/getUserData', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
          },
        });

        if (!response.ok) {
          console.error('Error fetching user data:', response.statusText);
          setUserData(null);
        } else {
          const userData = await response.json();
          setUserData(userData.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
      }
    };

    if (localStorage.getItem('userToken')) {
      fetchUserData();
    }
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/changePassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      const result = await response.json();
      console.log(result.message); // Password updated successfully

      localStorage.removeItem('userToken'); // Logout user
      navigate('/');
      window.location.reload(); // Reload the page after navigating

    } catch (error) {
      console.error('Error changing password:', error);
      setMessage('Failed to change password');
    }
  };

  return (
    <div className="user-profile-container">
    <div className="user-profile-container">
      <h1>User Profile</h1>
      {userData ? (
        <div>
          <p>Hello, {userData.user_name}!</p>
          <p>Email: {userData.user_email}</p>
          <form onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button type="submit">Change Password</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      ) : (
        <p>User data not available</p>
      )}
    </div>
    </div>
  );
};

export default UserProfile;
