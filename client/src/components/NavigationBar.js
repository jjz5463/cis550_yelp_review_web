// src/components/NavigationBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; // Assuming index.css contains your styling

const NavigationBar = () => {
    return (
        <nav className="navigation-bar">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/top_business" className="nav-link">Trending Business</Link>
            <Link to="/top_user" className="nav-link">Trending User</Link>
        </nav>
    );
};

export default NavigationBar;
