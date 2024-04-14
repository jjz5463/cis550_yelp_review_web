import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
const config = require('../config.json');

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function SearchResultPage() {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Set loading true by default
    const query = useQuery();
    const baseUrl = `http://${config.server_host}:${config.server_port}`;

    useEffect(() => {
        // Flag to keep track if the component is mounted
        let isMounted = true;

        const name = query.get('name');
        const city = query.get('city');
        const state = query.get('state');
        const searchUrl = `${baseUrl}/searchBusiness?name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;

        fetch(searchUrl)
            .then(response => response.json())
            .then(data => {
                if (isMounted) {
                    setResults(data);
                    setIsLoading(false); // Update the loading state only if the component is mounted
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                if (isMounted) {
                    setIsLoading(false); // Handle the error state too
                }
            });

        // Cleanup function to set the isMounted flag to false when the component unmounts
        return () => {
            isMounted = false;
        };
    }, [query, baseUrl]);

    // Render loading message or results
    return (
        <div>
            <h1>Search Results</h1>
            {isLoading ? (
                <p>Loading results...</p>
            ) : (
                results.length > 0 ? ( // Check if there are results
                    <ul>
                        {results.map((business) => (
                            <li key={business.business_id}>
                                <Link to={`/business/${business.business_id}`}>{business.name}</Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No results found.</p> // Display a message if there are no results
                )
            )}
        </div>
    );
}

export default SearchResultPage;



