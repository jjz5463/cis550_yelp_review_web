import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import loadingGIF from '../images/running_loader.gif';
const config = require('../config.json'); // Adjust the path if necessary

function TopBusinessPage() {
    const [businesses, setBusinesses] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('All Cities');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch(`http://${config.server_host}:${config.server_port}/cities`);
                const data = await response.json();
                setCities(['All Cities', ...data.cities]); // Prepend 'All Cities' to the list of cities
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            }
        };

        fetchCities();
    }, []);

    useEffect(() => {
        const fetchTopBusinesses = async () => {
            setIsLoading(true);
            let url = `http://${config.server_host}:${config.server_port}/top-business`;
            if (selectedCity !== 'All Cities') {
                url += `/${selectedCity}`;
            }
            try {
                const response = await fetch(url);
                const data = await response.json();
                setBusinesses(data);
            } catch (error) {
                console.error('Failed to fetch top businesses:', error);
            }
            setIsLoading(false);
        };

        fetchTopBusinesses();
    }, [selectedCity]);

    if (isLoading) {
        return <img src={loadingGIF} alt="Loading top businesses..." className="loading-image"/>;
    }

    const handleCityChange = (event) => {
        setSelectedCity(event.target.value);
    };

    return (
        <div>
            <h1>Top Businesses {selectedCity !== 'All Cities' ? `in ${selectedCity}` : ''}</h1>
            <select value={selectedCity} onChange={handleCityChange} className="city-dropdown">
                {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                ))}
            </select>
            {businesses.length ? (
                <ul>
                    {businesses.map((business) => (
                        <li key={business.business_id}>
                            <Link to={`/business/${business.business_id}`}>{business.name}</Link>
                            <span> - {business.review_count} reviews</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No businesses found.</p>
            )}
        </div>
    );
}

export default TopBusinessPage;

