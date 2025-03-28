import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyToken(token);
    } else {
      setError('No verification token provided');
    }
  }, [searchParams]);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/verify-email?token=${token}`);
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
      setMessage('');
    }
  };

  return (
    <div className="auth-container">
      <h2>Email Verification</h2>
      {error && <p className="error">{error}</p>}
      {message && (
        <>
          <p className="success">{message}</p>
          <p>
            <a href="/login">Proceed to Login</a>
          </p>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;