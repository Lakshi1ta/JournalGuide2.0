import React from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
    navigate("/login");
  };

  const navLink = (path) =>
    `relative text-sm transition pb-1 ${
      location.pathname === path
        ? "text-purple-400 font-medium after:w-full"
        : "text-gray-400 hover:text-gray-200 after:w-0"
    } after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-purple-400 after:transition-all`;

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/home">
          <h1 className="text-lg font-semibold tracking-tight text-gray-100 hover:text-purple-400 transition">
            Journal Guide
          </h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8">
          <Link to="/home" className={navLink("/home")}>Home</Link>
          <Link to="/journal" className={navLink("/journal")}>Journal</Link>
          <Link to="/profile" className={navLink("/profile")}>Profile</Link>
          <Link to="/journal/history" className={navLink("/journal/history")}>History</Link>
          <Link to="/about" className={navLink("/about")}>About us</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="hidden md:block px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col gap-[4px]"
            onClick={() => setOpen(!open)}
          >
            <span className="w-5 h-[2px] bg-gray-400"></span>
            <span className="w-5 h-[2px] bg-gray-400"></span>
            <span className="w-5 h-[2px] bg-gray-400"></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
          <Link to="/home" onClick={() => setOpen(false)} className="py-2 text-gray-300 hover:text-purple-400 transition">Home</Link>
          <Link to="/journal" onClick={() => setOpen(false)} className="py-2 text-gray-300 hover:text-purple-400 transition">Journal</Link>
          <Link to="/profile" onClick={() => setOpen(false)} className="py-2 text-gray-300 hover:text-purple-400 transition">Profile</Link>
          <Link to="/journal/history" onClick={() => setOpen(false)} className="py-2 text-gray-300 hover:text-purple-400 transition">History</Link>
          <Link to="/about" onClick={() => setOpen(false)} className="py-2 text-gray-300 hover:text-purple-400 transition">About</Link>
          <button onClick={() => { setOpen(false); handleLogout(); }} className="py-2 text-left text-red-400 hover:text-red-300 transition">Logout</button>
        </div>
      )}
    </nav>
  );
}