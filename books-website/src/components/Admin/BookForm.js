import React, { useState } from 'react';
import axios from 'axios';

const BookForm = ({ onBookAdded }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [accessLevel, setAccessLevel] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://localhost:5000/api/admin/books',
        { title, content, access_level: accessLevel },
        { headers: { 'Authorization': token } }
      );
      setSuccess('Book added successfully');
      setError('');
      setTitle('');
      setContent('');
      setAccessLevel(1);
      onBookAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add book');
      setSuccess('');
    }
  };

  return (
    <div className="book-form">
      <h3>Add New Book</h3>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Access Level:</label>
          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(parseInt(e.target.value))}
          >
            <option value="1">Free</option>
            <option value="2">Premium</option>
          </select>
        </div>
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
};

export default BookForm;