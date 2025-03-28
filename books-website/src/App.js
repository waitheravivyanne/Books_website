import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import BookList from './components/Books/BookList';
import BookViewer from './components/Books/BookViewer';
import VerifyEmail from './components/VerifyEmail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/:id" element={<BookViewer />} />
          <Route path="/" element={<BookList />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;