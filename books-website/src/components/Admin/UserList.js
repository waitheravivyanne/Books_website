import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': token }
        });
        setUsers(response.data.users);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}`,
        { is_admin: !currentStatus },
        { headers: { 'Authorization': token } }
      );
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: !currentStatus } : user
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-list">
      <h3>Users</h3>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Verified</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.is_verified ? 'Yes' : 'No'}</td>
              <td>
                <input
                  type="checkbox"
                  checked={user.is_admin}
                  onChange={() => toggleAdminStatus(user.id, user.is_admin)}
                />
              </td>
              <td>
                <button>Reset Password</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;