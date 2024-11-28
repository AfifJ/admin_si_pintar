import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import ClassItem from "./ClassItem";

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    title: '',
    subtitle: '',
    description: '',
    semester: '1', // Add semester
    credits: '2', // Add credits (SKS)
    room: 'A1.1', // Add room
    schedule: {
      day: 'Monday',
      time: '08:00-09:40'
    },
    class_section: 'A', // Add class_section
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data, error } = await supabase.from("classes").select("*");
    console.log("Fetched classes:", data); // Debug log
    if (error) {
      console.error("Error fetching classes:", error);
    } else {
      setClasses(data || []); // Pastikan data tidak null
    }
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      // Create new class
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          title: newClass.title,
          subtitle: newClass.subtitle,
          description: newClass.description,
          semester: newClass.semester, // Add semester
          credits: newClass.credits, // Add credits to insert
          room: newClass.room, // Add room to insert
          class_section: newClass.class_section, // Add class_section to insert
        }])
        .select()
        .single();

      if (error) throw error;

      // Create schedule for the class
      const scheduleData = {
        schedule_id: generateUUID(),
        class_id: data.class_id,
        day: newClass.schedule.day,
        time: newClass.schedule.time,
        created_at: new Date().toISOString()
      };

      const { error: scheduleError } = await supabase
        .from('class_schedules')
        .insert([scheduleData]);

      if (scheduleError) throw scheduleError;

      setClasses([...classes, data]);
      setIsModalOpen(false);
      setNewClass({
        title: '',
        subtitle: '',
        description: '',
        semester: '1', // Reset semester
        credits: '2', // Reset credits
        room: 'A1.1', // Reset room
        schedule: { day: 'Monday', time: '08:00-09:40' },
        class_section: 'A', // Reset class_section
      });
      alert('Kelas berhasil dibuat!');
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error creating class: ' + error.message);
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass({
      ...classItem,
      schedule: {
        day: classItem.day || 'Monday',
        time: classItem.time || '08:00-09:40'
      }
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        // Delete schedules first (foreign key constraint)
        const { error: scheduleError } = await supabase
          .from('class_schedules')
          .delete()
          .eq('class_id', classId);

        if (scheduleError) throw scheduleError;

        // Then delete the class
        const { error } = await supabase
          .from('classes')
          .delete()
          .eq('class_id', classId);

        if (error) throw error;

        // Update state
        setClasses(classes.filter(c => c.class_id !== classId));
        alert('Class deleted successfully!');
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Error deleting class: ' + error.message);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Update class
      const { error } = await supabase
        .from('classes')
        .update({
          title: editingClass.title,
          subtitle: editingClass.subtitle,
          description: editingClass.description,
          semester: editingClass.semester,
          credits: editingClass.credits,
          room: editingClass.room,
          class_section: editingClass.class_section
        })
        .eq('class_id', editingClass.class_id);

      if (error) throw error;

      // Update schedule
      const { error: scheduleError } = await supabase
        .from('class_schedules')
        .update({
          day: editingClass.schedule.day,
          time: editingClass.schedule.time
        })
        .eq('class_id', editingClass.class_id);

      if (scheduleError) throw scheduleError;

      // Update state
      setClasses(classes.map(c => 
        c.class_id === editingClass.class_id ? {...c, ...editingClass} : c
      ));
      setIsEditModalOpen(false);
      setEditingClass(null);
      alert('Class updated successfully!');
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Error updating class: ' + error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Kelas</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Tambah Kelas
        </button>
      </div>
      
      {/* Modal for creating new class */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Tambah Kelas Baru</h3>
            <form onSubmit={handleCreateClass}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Nama Kelas</label>
                  <input
                    type="text"
                    value={newClass.title}
                    onChange={(e) => setNewClass({...newClass, title: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                {/* New Subtitle field */}
                <div>
                  <label className="block mb-1">Sub Judul</label>
                  <input
                    type="text"
                    value={newClass.subtitle}
                    onChange={(e) => setNewClass({...newClass, subtitle: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Deskripsi</label>
                  <textarea
                    value={newClass.description}
                    onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows="3"
                    required
                  />
                </div>

                {/* Add Semester field */}
                <div>
                  <label className="block mb-1">Semester</label>
                  <select
                    value={newClass.semester}
                    onChange={(e) => setNewClass({...newClass, semester: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem.toString()}>{sem}</option>
                    ))}
                  </select>
                </div>

                {/* Add Credits (SKS) field */}
                <div>
                  <label className="block mb-1">SKS</label>
                  <select
                    value={newClass.credits}
                    onChange={(e) => setNewClass({...newClass, credits: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {[1,2,3,4].map(sks => (
                      <option key={sks} value={sks.toString()}>{sks}</option>
                    ))}
                  </select>
                </div>

                {/* Add Room field */}
                <div>
                  <label className="block mb-1">Ruangan</label>
                  <select
                    value={newClass.room}
                    onChange={(e) => setNewClass({...newClass, room: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {[
                      'A1.1', 'A1.2', 'A1.3', 'A1.4',
                      'A2.1', 'A2.2', 'A2.3', 'A2.4',
                      'B1.1', 'B1.2', 'B1.3', 'B1.4',
                      'LAB 1', 'LAB 2', 'LAB 3'
                    ].map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Hari</label>
                  <select
                    value={newClass.schedule.day}
                    onChange={(e) => setNewClass({
                      ...newClass,
                      schedule: { ...newClass.schedule, day: e.target.value }
                    })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1">Waktu</label>
                  <select
                    value={newClass.schedule.time}
                    onChange={(e) => setNewClass({
                      ...newClass,
                      schedule: { ...newClass.schedule, time: e.target.value }
                    })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="08:00-09:40">08:00-09:40</option>
                    <option value="10:00-11:40">10:00-11:40</option>
                    <option value="13:00-14:40">13:00-14:40</option>
                    <option value="15:00-16:40">15:00-16:40</option>
                  </select>
                </div>

                {/* Add class_section field */}
                <div>
                  <label className="block mb-1">Section</label>
                  <select
                    value={newClass.class_section}
                    onChange={(e) => setNewClass({...newClass, class_section: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(class_section => (
                      <option key={class_section} value={class_section}>{class_section}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Tambah Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Kelas</h3>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Nama Kelas</label>
                  <input
                    type="text"
                    value={editingClass.title}
                    onChange={(e) => setEditingClass({...editingClass, title: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                {/* New Subtitle field */}
                <div>
                  <label className="block mb-1">Sub Judul</label>
                  <input
                    type="text"
                    value={editingClass.subtitle}
                    onChange={(e) => setEditingClass({...editingClass, subtitle: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">Deskripsi</label>
                  <textarea
                    value={editingClass.description}
                    onChange={(e) => setEditingClass({...editingClass, description: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows="3"
                    required
                  />
                </div>

                {/* Add Semester field */}
                <div>
                  <label className="block mb-1">Semester</label>
                  <select
                    value={editingClass.semester}
                    onChange={(e) => setEditingClass({...editingClass, semester: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem.toString()}>{sem}</option>
                    ))}
                  </select>
                </div>

                {/* Add Credits (SKS) field */}
                <div>
                  <label className="block mb-1">SKS</label>
                  <select
                    value={editingClass.credits}
                    onChange={(e) => setEditingClass({...editingClass, credits: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {[1,2,3,4].map(sks => (
                      <option key={sks} value={sks.toString()}>{sks}</option>
                    ))}
                  </select>
                </div>

                {/* Add Room field */}
                <div>
                  <label className="block mb-1">Ruangan</label>
                  <select
                    value={editingClass.room}
                    onChange={(e) => setEditingClass({...editingClass, room: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {[
                      'A1.1', 'A1.2', 'A1.3', 'A1.4',
                      'A2.1', 'A2.2', 'A2.3', 'A2.4',
                      'B1.1', 'B1.2', 'B1.3', 'B1.4',
                      'LAB 1', 'LAB 2', 'LAB 3'
                    ].map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Hari</label>
                  <select
                    value={editingClass.schedule.day}
                    onChange={(e) => setEditingClass({
                      ...editingClass,
                      schedule: { ...editingClass.schedule, day: e.target.value }
                    })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1">Waktu</label>
                  <select
                    value={editingClass.schedule.time}
                    onChange={(e) => setEditingClass({
                      ...editingClass,
                      schedule: { ...editingClass.schedule, time: e.target.value }
                    })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="08:00-09:40">08:00-09:40</option>
                    <option value="10:00-11:40">10:00-11:40</option>
                    <option value="13:00-14:40">13:00-14:40</option>
                    <option value="15:00-16:40">15:00-16:40</option>
                  </select>
                </div>

                {/* Add class_section field */}
                <div>
                  <label className="block mb-1">Section</label>
                  <select
                    value={editingClass.class_section}
                    onChange={(e) => setEditingClass({...editingClass, class_section: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(class_section => (
                      <option key={class_section} value={class_section}>{class_section}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <ClassItem 
            key={classItem.class_id} 
            classItem={classItem}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ClassList;
