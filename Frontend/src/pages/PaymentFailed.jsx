import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailed = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-3xl shadow-xl sm:shadow-2xl max-w-md w-full text-center border-t-8 border-red-500 transform transition-all hover:-translate-y-1">
                <FaTimesCircle className="text-red-500 text-5xl sm:text-7xl mx-auto mb-4 sm:mb-6 drop-shadow-sm" />
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 sm:mb-4">Booking Failed</h1>
                <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-lg">We couldn't process your payment. Please ensure your payment details are correct and try again.</p>
                <div className="space-y-3 sm:space-y-4">
                    <Link to="/" className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition shadow-lg hover:shadow-xl text-sm sm:text-base">
                        Return to Events
                    </Link>
                    <Link to="/dashboard" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition text-sm sm:text-base">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
