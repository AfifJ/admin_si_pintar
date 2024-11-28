import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import PropTypes from 'prop-types';

const MaterialList = ({ classId }) => {
  const [materials, setMaterials] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('class_id', classId);
    if (error) {
      console.error('Error fetching materials:', error);
    } else {
      setMaterials(data);
    }
  };

  const handleAddMaterial = async () => {
    const { error } = await supabase.from('materials').insert({
      class_id: classId,
      title,
      description,
      file_url: fileUrl,
      date: new Date().toISOString(),
    });
    if (error) {
      console.error('Error adding material:', error);
    } else {
      fetchMaterials();
      setTitle('');
      setDescription('');
      setFileUrl('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4">Daftar Materi</h3>
      
      <div className="grid gap-4 mb-4">
        <input
          type="text"
          placeholder="Judul Materi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <textarea
          placeholder="Deskripsi Materi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border rounded w-full h-24"
        />
        <input
          type="text"
          placeholder="URL File"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <button 
          onClick={handleAddMaterial}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tambah Materi
        </button>
      </div>

      <ul className="divide-y">
        {materials.map((material) => (
          <li key={material.material_id} className="py-3">
            <h4 className="font-medium">{material.title}</h4>
            <p className="text-gray-600 text-sm">{material.description}</p>
            <a 
              href={material.file_url} 
              className="text-blue-500 text-sm hover:underline"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Lihat File
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
MaterialList.propTypes = {
  classId: PropTypes.string.isRequired,
};

export default MaterialList;