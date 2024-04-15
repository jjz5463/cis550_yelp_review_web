import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const config = require('../config.json');

function HomePage() {
    const [businessName, setBusinessName] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [cities, setCities] = useState([]);
    const [states, setStates] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch cities and states when the component mounts
        const baseUrl = `http://${config.server_host}:${config.server_port}`;
        fetch(`${baseUrl}/cities`)
            .then(response => response.json())
            .then(data => setCities(data.cities))
            .catch(err => console.error('Error fetching cities:', err));

        fetch(`${baseUrl}/states`)
            .then(response => response.json())
            .then(data => setStates(data.states))
            .catch(err => console.error('Error fetching states:', err));
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        // Use encodeURIComponent to properly format query parameters
        navigate(`/searchresult?name=${encodeURIComponent(businessName)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`);
    };

    const handleNearbyBusinesses = () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                navigate(`/nearby?latitude=${latitude}&longitude=${longitude}`);
            },
            error => {
                console.error('Error obtaining location:', error);
                alert('Failed to retrieve location. Please ensure location services are enabled.');
            }
        );
    };

    return (
        <div className="page-container"> {/* This wraps your content and centers it */}
            <button onClick={handleNearbyBusinesses} className="nearby-button">Find Nearby Businesses</button>
            <h1>Business Search</h1>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Business Name"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                />
                <select value={city} onChange={e => setCity(e.target.value)}>
                    <option value="">Select City</option>
                    {cities.map((city, index) => <option key={index} value={city}>{city}</option>)}
                </select>
                <select value={state} onChange={e => setState(e.target.value)}>
                    <option value="">Select State</option>
                    {states.map((state, index) => <option key={index} value={state}>{state}</option>)}
                </select>
                <button type="submit">Search</button>
            </form>
        </div>
    );
}

export default HomePage;
