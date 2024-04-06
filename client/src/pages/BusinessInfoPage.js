import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
const config = require('../config.json');

function BusinessInfoPage() {
    const { businessId } = useParams();
    const [businessInfo, setBusinessInfo] = useState(null);
    const [reviewSummary, setReviewSummary] = useState(null); // Add state for review summary
    const [reviews, setReviews] = useState([]);
    const baseUrl = `http://${config.server_host}:${config.server_port}`;

    useEffect(() => {
        fetch(`${baseUrl}/business/${businessId}`)
            .then(response => response.json())
            .then(data => setBusinessInfo(data))
            .catch(error => console.error("Failed to fetch business info:", error));

        // Fetch review summary
        fetch(`${baseUrl}/business/${businessId}/reviewSummary`)
            .then(response => response.json())
            .then(data => setReviewSummary(data))
            .catch(error => console.error("Failed to fetch review summary:", error));

        fetch(`${baseUrl}/business/${businessId}/reviews`)
            .then(response => response.json())
            .then(data => setReviews(data))
            .catch(error => console.error("Failed to fetch reviews:", error));
    }, [businessId, baseUrl]);

    // render stars
    const renderStars = (rating) => {
        let stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="star full-star">★</span>);
        }
        for (let i = fullStars; i < 5; i++) {
            stars.push(<span key={i} className="star empty-star">☆</span>);
        }
        return <span className="star-rating">{stars}</span>;
    };

    // Helper function to format business hours from JSON string
    const formatHours = (hoursJson) => {
        if (!hoursJson) return 'Hours not available';

        try {
            const hoursObj = JSON.parse(hoursJson.replace(/'/g, '"'));
            return Object.entries(hoursObj).map(([day, hours]) => {
                // Format the hours to ensure two zeros for minutes
                const times = hours.split('-').map(time => {
                    const [hrs, mins] = time.split(':');
                    return `${hrs}:${mins.padEnd(2, '0')}`; // Ensure two digits for minutes
                });
                return `${day}: ${times.join(' - ')}`;
            }).join('\n'); // Join with newline character for display
        } catch (e) {
            console.error('Error parsing hours:', e);
            return 'Hours not available';
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (!businessInfo || !reviewSummary) return <div>Loading business info...</div>;

    const formattedHours = businessInfo.hours ? formatHours(businessInfo.hours) : 'Hours not available';

    return (
        <div>
            <h2>{businessInfo.name}</h2>
            <div className="business-details"><strong>Categories:</strong> {businessInfo.categories}</div>
            <div className="business-details"><strong>Address:</strong> {`${businessInfo.address}, ${businessInfo.city}, ${businessInfo.state} ${businessInfo.postal_code}`}</div>
            <div className="business-details"><strong>Hours:</strong></div>
            <pre>{formattedHours}</pre>
            <div className="business-details">
                <strong>Rating:</strong>
                {reviewSummary.average_stars ? (
                    <span>
                {renderStars(reviewSummary.average_stars)}
                        <span> ({reviewSummary.average_stars.toFixed(2)}) </span>
            </span>
                ) : 'N/A '}
                from {reviewSummary.review_count ? reviewSummary.review_count : 'N/A '} reviews
            </div>
            <h3>Reviews</h3>
            <ul>
                {reviews.map(review => (
                    <li key={review.review_id}>
                        <div className="review-rating">
                            <strong>Rating:</strong> {renderStars(review.stars)} ({review.stars.toFixed(1)})
                        </div>
                        <div className="review-text">{review.text}</div>
                        <div className="review-footer">
                            <span className="review-date">{formatDate(review.date)}</span>
                            <span className="review-votes">
                    <span className="useful">👍 {review.useful}</span>
                    <span className="funny">😄 {review.funny}</span>
                    <span className="cool">😎 {review.cool}</span>
                </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default BusinessInfoPage;


