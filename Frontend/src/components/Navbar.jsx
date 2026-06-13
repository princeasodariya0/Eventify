import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaTicketAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <NavLink to="/" className="text-white text-2xl font-black flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <FaTicketAlt /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-200">Eventify</span>
                    </NavLink>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <NavLink to="/" className="text-gray-100 hover:text-white transition cursor-pointer font-medium">Events</NavLink>
                        {user ? (
                            <>
                                <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-100 hover:text-white transition font-medium">Dashboard</NavLink>
                                <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition font-medium backdrop-blur-sm">Logout</button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className="text-gray-100 hover:text-white transition font-medium">Login</NavLink>
                                <NavLink to="/register" className="bg-white text-purple-700 hover:bg-pink-50 px-4 py-2 rounded-lg font-bold transition shadow-md">Sign Up</NavLink>
                            </>
                        )}
                    </div>
                    
                    {/* Mobile Toggle Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-white text-2xl focus:outline-none"
                    >
                        {isMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
                
                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-6 space-y-4">
                        <NavLink to="/" className="block text-gray-100 hover:text-white transition py-2 text-center font-medium" onClick={() => setIsMenuOpen(false)}>Events</NavLink>
                        {user ? (
                            <>
                                <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} className="block text-gray-100 hover:text-white transition py-2 text-center font-medium" onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                                <button onClick={handleLogout} className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition font-medium backdrop-blur-sm">Logout</button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className="block text-gray-100 hover:text-white transition py-2 text-center font-medium" onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                                <NavLink to="/register" className="block bg-white text-purple-700 hover:bg-pink-50 px-4 py-2 rounded-lg font-bold transition text-center shadow-md" onClick={() => setIsMenuOpen(false)}>Sign Up</NavLink>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
