import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting:", { email, password });

    // Basic client-side validation
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    try {
      const response = await axios.post('/api/register',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      localStorage.setItem('access_token', response.data.access_token);
      setSuccess(response.data.message);
      setError('');
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setSuccess('');
    }
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Register;

// return (
//   <div className="auth-form">
//     <h2>Register</h2>
//     {error && <div className="error">{error}</div>}
//     {success && <div className="success">{success}</div>}
//     <form onSubmit={handleSubmit}>
//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//         minLength="8"
//       />
//       <button type="submit">Register</button>
//     </form>
//   </div>
// );
// };

// export default Register;
