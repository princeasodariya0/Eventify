import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
                    <Link to="/" className="text-white text-2xl font-bold flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <FaTicketAlt /> Eventify
                    </Link>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-gray-200 hover:text-white transition cursor-pointer">Events</Link>
                        {user ? (
                            <>
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-200 hover:text-white transition">Dashboard</Link>
                                <button onClick={handleLogout} className="bg-gray-700 hover:bg-black text-white px-4 py-2 rounded-lg transition">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-200 hover:text-white transition">Login</Link>
                                <Link to="/register" className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition">Sign Up</Link>
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
                        <Link to="/" className="block text-gray-200 hover:text-white transition py-2 text-center" onClick={() => setIsMenuOpen(false)}>Events</Link>
                        {user ? (
                            <>
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="block text-gray-200 hover:text-white transition py-2 text-center" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                                <button onClick={handleLogout} className="w-full bg-gray-700 hover:bg-black text-white px-4 py-2 rounded-lg transition">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block text-gray-200 hover:text-white transition py-2 text-center" onClick={() => setIsMenuOpen(false)}>Login</Link>
                                <Link to="/register" className="block bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition text-center" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
