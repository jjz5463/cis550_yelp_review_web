import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
const config = require('../config.json');

function NearbyBusinessPage() {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const baseUrl = `http://${config.server_host}:${config.server_port}`;

    useEffect(() => {
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

    // Helper function to render stars using Unicode characters
    const renderStars = (rating) => {
        const fullStar = '★';
        const emptyStar = '☆';
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += i < Math.floor(rating) ? fullStar : emptyStar;
        }
        return stars;
    };

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
                                    {business.name} - {renderStars(business.average_stars)}
                                    {business.distance_in_meters && <span> ({business.distance_in_meters.toFixed(0)} m)</span>}
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

