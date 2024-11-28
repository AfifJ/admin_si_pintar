
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-white font-bold text-xl">
          SI Pintar Admin
        </Link>
        <div className="space-x-4">
          <Link to="/classes" className="text-white hover:text-gray-300">
            Class Management
          </Link>
          <Link to="/users" className="text-white hover:text-gray-300">
            User Management
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;