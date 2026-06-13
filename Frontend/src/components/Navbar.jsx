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
        <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <NavLink to="/" className="text-white text-2xl font-bold flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <FaTicketAlt /> Eventify
                    </NavLink>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <NavLink to="/" className="text-gray-200 hover:text-white transition cursor-pointer">Events</NavLink>
                        {user ? (
                            <>
                                <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-200 hover:text-white transition">Dashboard</NavLink>
                                <button onClick={handleLogout} className="bg-gray-700 hover:bg-black text-white px-4 py-2 rounded-lg transition">Logout</button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className="text-gray-200 hover:text-white transition">Login</NavLink>
                                <NavLink to="/register" className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition">Sign Up</NavLink>
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
                        <NavLink to="/" className="block text-gray-200 hover:text-white transition py-2 text-center" onClick={() => setIsMenuOpen(false)}>Events</NavLink>
                        {user ? (
                            <>
                                <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} className="block text-gray-200 hover:text-white transition py-2 text-center" onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                                <button onClick={handleLogout} className="w-full bg-gray-700 hover:bg-black text-white px-4 py-2 rounded-lg transition">Logout</button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className="block text-gray-200 hover:text-white transition py-2 text-center" onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                                <NavLink to="/register" className="block bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition text-center" onClick={() => setIsMenuOpen(false)}>Sign Up</NavLink>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
