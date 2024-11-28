import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const StudentList = ({ classId }) => {
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchUsers();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('class_enrollments')
      .select('*, users(*)')
      .eq('class_id', classId);
    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data);
    }
  };

  const handleAddStudent = async () => {
    const { error } = await supabase
      .from('class_enrollments')
      .insert({ class_id: classId, student_id: selectedUser });
    if (error) {
      console.error('Error adding student:', error);
    } else {
      fetchStudents();
      setSelectedUser('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4">Daftar Mahasiswa</h3>
      <div className="mb-4">
        <select 
          value={selectedUser} 
          onChange={(e) => setSelectedUser(e.target.value)}
          className="mr-2 p-2 border rounded"
        >
          <option value="">Pilih Mahasiswa</option>
          {users.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.full_name}
            </option>
          ))}
        </select>
        <button 
          onClick={handleAddStudent}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tambah Mahasiswa
        </button>
      </div>
      <ul className="divide-y">
        {students.map((student) => (
          <li key={student.enrollment_id} className="py-2">
            {student.users.full_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentList;