import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        try {
            // Remove the user from local storage
            localStorage.removeItem('compiler_user');
            
            // Display a success message
            // You could use a notification library for a better user experience
            alert('Logged out successfully');
        } catch (error) {
            console.error('Error during logout:', error);
        }

        // Redirect to the login page
        navigate('/login');
    }, [navigate]);

    return null; // No need to render anything
};

export default Logout;
