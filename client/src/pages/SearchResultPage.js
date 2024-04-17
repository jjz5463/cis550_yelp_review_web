import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
// import Pagination from '../components/Pagination';
const config = require('../config.json');

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function SearchResultPage() {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Set loading true by default
    // pagination
    const [displayedResults, setDisplayedResults] = useState([]);
    const [lastIndex, setLastIndex] = useState(0);
    const [hasMoreResults, setHasMoreResults] = useState(true);


    const resultsPerPage = 30;
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

    useEffect(() => {
        const loader = document.getElementById('loader');
        if (isLoading) return;
        const observer = new IntersectionObserver(entries => {
            // Check if the observed entry is intersecting
            if (entries[0].isIntersecting && hasMoreResults) {
                loadMoreResults();
            }
        }, {
            root: null, // assuming the viewport
            rootMargin: '0px',
            threshold: 0.0 // fully in view
        });
    
        // Start observing the element
        if (loader) {
            observer.observe(loader);
        }
    
        // Clean up observer on component unmount
        return () => {
            if (loader) {
                observer.unobserve(loader);
            }
        };
    }, [isLoading]); // Empty dependency array ensures the effect only runs once
    
    const loadMoreResults = () => {
        if (lastIndex >= results.length) {
            console.log(lastIndex >= results.length);
            setHasMoreResults(false);
            return; // No more results to load, so exit the function
        }
        const moreResults = results.slice(lastIndex, lastIndex + resultsPerPage);
        setDisplayedResults(prevResults => [...prevResults, ...moreResults]);
        setLastIndex(lastIndex + resultsPerPage);
    };

    useEffect(() => {
        if (isLoading) {
            return;
        }
        loadMoreResults();
    }, [isLoading]); // Loads the initial results
    

    // Render loading message or results
    
    return (
        <div className="page-container">
            <h1>Search Results</h1>
            {isLoading ? (
                <p>Loading results...</p>
            ) : (
                <>
                    <ul>
                        {displayedResults.map((business) => (
                            <li key={business.business_id}>
                                <Link to={`/business/${business.business_id}`}>{business.name}</Link>
                            </li>
                        ))}
                    </ul>
                    {hasMoreResults ? (
                        <div id="loader" style={{ visibility: hasMoreResults ? 'visible' : 'hidden' }}>Loading more...</div>
                    ) : (
                        <div>No more results.</div>
                    )}
                </>
            )}
            {/* <Pagination resultsPerPage={resultsPerPage} totalResults={results.length} currentPage={currentPage} setCurrentPage={setCurrentPage}></Pagination> */}
        </div>
    );
}

export default SearchResultPage;



