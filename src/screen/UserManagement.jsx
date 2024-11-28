import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://jldoagdubuqilrosdnhd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZG9hZ2R1YnVxaWxyb3NkbmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4NzczMzEsImV4cCI6MjA0NjQ1MzMzMX0.CpZ42ET0w0vyp-rvjxwJByxA_3EiI-G2s4y5AIfqywU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Hash password function
const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [mode, setMode] = useState('view'); // view, add, edit, delete
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    npm: '',
    password: '',
    email: '',
    full_name: '',
    role: 'student',
    semester: 0,
    image_url: 'https://unsplash.it/100/100',
    academic_year: '2024/2025'
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      setUsers(data);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'add') {
        const hashedPassword = await hashPassword(formData.password);
        const { error } = await supabase
          .from('users')
          .insert([{ ...formData, password: hashedPassword }]);
        
        if (error) throw error;
        showMessage('User added successfully');
      } else if (mode === 'edit') {
        const { error } = await supabase
          .from('users')
          .update({ 
            username: formData.username,
            npm: formData.npm,
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role,
            semester: formData.semester,
            image_url: formData.image_url,
            academic_year: formData.academic_year
          })
          .eq('user_id', selectedUser.user_id);
        
        if (error) throw error;
        showMessage('User updated successfully');
      }
      
      fetchUsers();
      resetForm();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('user_id', userId);
        
        if (error) throw error;
        showMessage('User deleted successfully');
        fetchUsers();
      } catch (error) {
        showMessage(error.message, 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      npm: '',
      password: '',
      email: '',
      full_name: '',
      role: 'student',
      semester: 0,
      image_url: 'https://unsplash.it/100/100',
      academic_year: '2024/2025'
    });
    setMode('view');
    setSelectedUser(null);
  };

  const editUser = (user) => {
    setSelectedUser(user);
    setFormData({
      ...user,
      password: '' // Don't populate password field
    });
    setMode('edit');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management System</h1>
      
      {/* Message display */}
      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {/* Mode selection */}
      <div className="mb-6">
        <button 
          onClick={() => setMode('view')} 
          className={`mr-2 px-4 py-2 rounded ${mode === 'view' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          View Users
        </button>
        <button 
          onClick={() => setMode('add')} 
          className={`px-4 py-2 rounded ${mode === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Add User
        </button>
      </div>

      {/* User form */}
      {(mode === 'add' || mode === 'edit') && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">NPM/ID</label>
              <input
                type="text"
                name="npm"
                value={formData.npm}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {mode === 'add' && (
              <div>
                <label className="block mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            )}
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
              </select>
            </div>
            {formData.role === 'student' && (
              <div>
                <label className="block mb-1">Semester</label>
                <input
                  type="number"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="14"
                />
              </div>
            )}
            <div>
              <label className="block mb-1">Academic Year</label>
              <input
                type="text"
                name="academic_year"
                value={formData.academic_year}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              {mode === 'add' ? 'Add User' : 'Update User'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      {mode === 'view' && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="p-2 border">Full Name</th>
                <th className="p-2 border">Username</th>
                <th className="p-2 border">NPM/ID</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Semester</th>
                <th className="p-2 border">Academic Year</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.user_id}>
                  <td className="p-2 border">{user.full_name}</td>
                  <td className="p-2 border">{user.username}</td>
                  <td className="p-2 border">{user.npm}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.role}</td>
                  <td className="p-2 border">{user.semester}</td>
                  <td className="p-2 border">{user.academic_year}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => editUser(user)}
                      className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.user_id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;