import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
const config = require('../config.json');

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function SearchResultPage() {
    const [results, setResults] = useState([]);
    const query = useQuery();
    const baseUrl = `http://${config.server_host}:${config.server_port}`;

    useEffect(() => {
        // Construct the search URL using query parameters
        const name = query.get('name');
        const city = query.get('city');
        const state = query.get('state');
        const searchUrl = `${baseUrl}/searchBusiness?name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;

        // Fetch search results
        fetch(searchUrl)
            .then(response => response.json())
            .then(data => setResults(data))
            .catch(error => console.error('Error fetching data:', error));
    }, [query]);

    return (
        <div>
            <h1>Search Results</h1>
            <ul>
                {results.map((business, index) => (
                    <li key={index}>{business.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default SearchResultPage;

