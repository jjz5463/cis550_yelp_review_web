import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Removed useLocation, useQuery as they're not needed here
const config = require('../config.json');

function NearbyBusinessPage() {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Set loading true by default
    const baseUrl = `http://${config.server_host}:${config.server_port}`;

    useEffect(() => {
        // Fetch user's location and nearby businesses
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const nearbyUrl = `${baseUrl}/nearby-businesses/${latitude}/${longitude}`;

            fetch(nearbyUrl)
                .then(response => response.json())
                .then(data => {
                    setResults(data);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setIsLoading(false);
                });
        }, (error) => {
            console.error('Error obtaining location:', error);
            setIsLoading(false);
        });
    }, [baseUrl]);

    return (
        <div className="page-container">
            <h1>Nearby Businesses</h1>
            {isLoading ? (
                <p>Loading nearby businesses...</p>
            ) : (
                results.length > 0 ? (
                    <ul>
                        {results.map((business) => (
                            <li key={business.business_id}>
                                <Link to={`/business/${business.business_id}`}>
                                    {business.name} - {business.average_stars.toFixed(2)} Stars
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No nearby businesses found.</p>
                )
            )}
        </div>
    );
}

export default NearbyBusinessPage;
