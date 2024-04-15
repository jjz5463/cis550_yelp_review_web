import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import loadingGIF from '../images/running_loader.gif';
const config = require('../config.json'); // Adjust the path if necessary

function TopBusinessPage() {
    const [businesses, setBusinesses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTopBusinesses = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://${config.server_host}:${config.server_port}/top-business`);
                const data = await response.json();
                setBusinesses(data);
            } catch (error) {
                console.error('Failed to fetch top businesses:', error);
            }
            setIsLoading(false);
        };

        fetchTopBusinesses();
    }, []);

    if (isLoading) {
        return <img src={loadingGIF} alt="Loading top businesses..." className="loading-image"/>;
    }

    return (
        <div>
            <h1>Top Businesses</h1>
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
