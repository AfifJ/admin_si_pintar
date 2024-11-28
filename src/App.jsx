import { Routes, Route } from 'react-router-dom'
import ClassList from './components/ClassList'
import ClassDetail from './components/ClassDetail'
import UserManagement from './screen/UserManagement'
import Navbar from './components/Navbar'

function App() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<ClassList />} />
          <Route path="/classes" element={<ClassList />} />
          <Route path="/classes/:id" element={<ClassDetail />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </div>
    </>
  )
}

export default App
