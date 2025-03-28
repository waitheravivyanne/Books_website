import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BookForm from './BookForm';
import UserList from './UserList';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'books') {
      fetchBooks();
    }
  }, [activeTab]);

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:5000/api/books', {
        headers: { 'Authorization': token }
      });
      setBooks(response.data.books);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch books');
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://localhost:5000/api/admin/books/${bookId}`, {
        headers: { 'Authorization': token }
      });
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete book');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <div className="admin-tabs">
        <button 
          className={activeTab === 'books' ? 'active' : ''}
          onClick={() => setActiveTab('books')}
        >
          Manage Books
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
      </div>

      {activeTab === 'books' && (
        <>
          <BookForm onBookAdded={fetchBooks} />
          <div className="book-list">
            <h3>Books</h3>
            <ul>
              {books.map(book => (
                <li key={book.id}>
                  <Link to={`/books/${book.id}`}>{book.title}</Link>
                  <div className="book-actions">
                    <Link to={`/admin/books/edit/${book.id}`}>Edit</Link>
                    <button onClick={() => handleDeleteBook(book.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {activeTab === 'users' && <UserList />}
    </div>
  );
};

export default AdminPanel;