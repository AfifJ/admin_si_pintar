import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import StudentList from "./StudentList";
import MaterialList from "./MaterialList";
import AttendanceList from "./AttendanceList";

const ClassDetail = () => {
  const { id } = useParams(); // Ubah dari classId ke id sesuai route
  const [classDetail, setClassDetail] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassDetail();
  }, [id]); // Tambahkan dependency id

  const fetchClassDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("class_id", id)
        .single();
      
      if (error) throw error;
      console.log("Fetched class detail:", data); // Debug log
      setClassDetail(data);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!classDetail) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-2">{classDetail.title}</h2>
        <p className="text-gray-600 mb-4">{classDetail.description}</p>
      </div>
      <StudentList classId={id} />
      <MaterialList classId={id} />
      <AttendanceList classId={id} />
    </div>
  );
};

export default ClassDetail;
