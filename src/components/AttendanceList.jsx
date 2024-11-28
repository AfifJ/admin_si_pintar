import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AttendanceList = ({ classId }) => {
    const [attendances, setAttendances] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [students, setStudents] = useState([]);
    const [newAttendance, setNewAttendance] = useState({
        schedule_id: '',
        date: new Date().toISOString().split('T')[0],
        selectedStudents: [],
        createForAll: false
    });
    const [editingAttendance, setEditingAttendance] = useState(null);

    useEffect(() => {
        fetchAttendances();
        fetchSchedules();
        fetchStudents();
    }, [classId]);

    const fetchAttendances = async () => {
        const { data, error } = await supabase
            .from('attendances')
            .select('*, class_schedules(day, time), users(full_name)')
            .eq('class_schedules.class_id', classId);
        if (error) {
            console.error('Error fetching attendances:', error);
        } else {
            setAttendances(data);
        }
    };

    const fetchSchedules = async () => {
        const { data, error } = await supabase
            .from('class_schedules')
            .select('*')
            .eq('class_id', classId);
        if (error) {
            console.error('Error fetching schedules:', error);
        } else {
            setSchedules(data);
        }
    };

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

    const handleCreateAttendance = async () => {
        try {
            let attendanceRecords;
            
            if (newAttendance.createForAll) {
                // Create records for all students
                attendanceRecords = students.map(enrollment => ({
                    schedule_id: newAttendance.schedule_id,
                    student_id: enrollment.student_id,  // Changed from user_id to student_id
                    status: null,
                    date: newAttendance.date
                }));
            } else {
                // Create records only for selected students
                attendanceRecords = newAttendance.selectedStudents.map(studentId => ({
                    schedule_id: newAttendance.schedule_id,
                    student_id: studentId,  // Changed from user_id to student_id
                    status: null,
                    date: newAttendance.date
                }));
            }

            if (attendanceRecords.length === 0) {
                throw new Error('Please select at least one student');
            }

            const { error } = await supabase
                .from('attendances')
                .insert(attendanceRecords);

            if (error) throw error;
            
            alert('Attendance records created successfully!');
            fetchAttendances();
            setNewAttendance({ 
                schedule_id: '', 
                date: new Date().toISOString().split('T')[0],
                selectedStudents: [],
                createForAll: false
            });
        } catch (error) {
            console.error('Error creating attendance:', error);
            alert(`Failed to create attendance records: ${error.message}`);
        }
    };

    const handleEditAttendance = async (attendance) => {
        try {
            const { error } = await supabase
                .from('attendances')
                .update({
                    status: attendance.status,
                })
                .eq('attendance_id', attendance.attendance_id);

            if (error) throw error;
            
            alert('Attendance updated successfully!');
            setEditingAttendance(null);
            fetchAttendances();
        } catch (error) {
            console.error('Error updating attendance:', error);
            alert(`Failed to update attendance: ${error.message}`);
        }
    };

    const handleDeleteAttendance = async (attendanceId) => {
        if (!window.confirm('Are you sure you want to delete this attendance record?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('attendances')
                .delete()
                .eq('attendance_id', attendanceId);

            if (error) throw error;
            
            alert('Attendance deleted successfully!');
            fetchAttendances();
        } catch (error) {
            console.error('Error deleting attendance:', error);
            alert(`Failed to delete attendance: ${error.message}`);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Daftar Presensi</h3>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-4">Buat Presensi Baru</h4>
                <div className="grid grid-cols-1 gap-4">
                    <select
                        value={newAttendance.schedule_id}
                        onChange={(e) => setNewAttendance({
                            ...newAttendance,
                            schedule_id: e.target.value
                        })}
                        className="p-2 border rounded"
                    >
                        <option value="">Pilih Jadwal</option>
                        {schedules.map((schedule) => (
                            <option key={schedule.schedule_id} value={schedule.schedule_id}>
                                {schedule.day} - {schedule.time}
                            </option>
                        ))}
                    </select>
                    
                    <input
                        type="date"
                        value={newAttendance.date}
                        onChange={(e) => setNewAttendance({
                            ...newAttendance,
                            date: e.target.value
                        })}
                        className="p-2 border rounded"
                    />

                    <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={newAttendance.createForAll}
                                onChange={(e) => setNewAttendance({
                                    ...newAttendance,
                                    createForAll: e.target.checked,
                                    selectedStudents: []
                                })}
                                className="form-checkbox"
                            />
                            <span>Buat presensi untuk semua mahasiswa</span>
                        </label>

                        {!newAttendance.createForAll && (
                            <div className="border p-2 rounded max-h-40 overflow-y-auto">
                                {students.map((student) => (
                                    <label key={student.student_id} className="flex items-center space-x-2 p-1">
                                        <input
                                            type="checkbox"
                                            checked={newAttendance.selectedStudents.includes(student.student_id)}
                                            onChange={(e) => {
                                                const updatedStudents = e.target.checked
                                                    ? [...newAttendance.selectedStudents, student.student_id]
                                                    : newAttendance.selectedStudents.filter(id => id !== student.student_id);
                                                setNewAttendance({
                                                    ...newAttendance,
                                                    selectedStudents: updatedStudents
                                                });
                                            }}
                                            className="form-checkbox"
                                        />
                                        <span>{student.users.full_name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleCreateAttendance}
                        disabled={!newAttendance.schedule_id || (!newAttendance.createForAll && newAttendance.selectedStudents.length === 0)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        Buat Presensi
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hari</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {attendances && attendances
                            .filter(attendance => attendance.class_schedules)
                            .map((attendance) => (
                                <tr key={attendance.attendance_id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{attendance.users.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{attendance.class_schedules.day}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{attendance.class_schedules.time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(attendance.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                                            attendance.status === 'absent' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {attendance.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingAttendance?.attendance_id === attendance.attendance_id ? (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={editingAttendance.status || ''}
                                                    onChange={(e) => setEditingAttendance({
                                                        ...editingAttendance,
                                                        status: e.target.value
                                                    })}
                                                    className="p-1 text-sm border rounded"
                                                >
                                                    <option value="">-</option>
                                                    <option value="present">Present</option>
                                                    <option value="absent">Absent</option>
                                                </select>
                                                <button
                                                    onClick={() => handleEditAttendance(editingAttendance)}
                                                    className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingAttendance(null)}
                                                    className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setEditingAttendance(attendance)}
                                                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAttendance(attendance.attendance_id)}
                                                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceList;