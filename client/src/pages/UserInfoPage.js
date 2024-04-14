import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import defaultAvatar from '../images/avatar.png';
const config = require('../config.json');

function UserInfoPage() {
    const { userId } = useParams();
    const [userInfo, setUserInfo] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState(null);
    const baseUrl = `http://${config.server_host}:${config.server_port}`;
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
        fetch(`${baseUrl}/user/${userId}/info`)
            .then(response => response.json())
            .then(data => setUserInfo(data))
            .catch(error => console.error("Failed to fetch user info:", error));

        fetch(`${baseUrl}/user/${userId}/reviews`)
            .then(response => response.json())
            .then(data => setUserReviews(data))
            .catch(error => console.error("Failed to fetch user reviews:", error));

        fetch(`${baseUrl}/user/${userId}/reviewSummary`)
            .then(response => response.json())
            .then(data => {
                setReviewSummary(data);
                setReviewCount(data.review_count); // Set the review count
            })
            .catch(error => console.error("Failed to fetch user review summary:", error));
    }, [userId, baseUrl]);

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

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // ... inside the UserInfoPage component
    if (!userInfo || !reviewSummary) return <div>Loading user info...</div>;

    return (
        <div className="page-container">
            <div className="user-info-header">
                <img src={defaultAvatar} alt="User Avatar" className="user-avatar" />
                <h2>{userInfo.name}</h2>
                <div><strong>Yelping Since:</strong> {formatDate(userInfo.yelping_since)}</div>
                <div><strong>Total Reviews:</strong> {reviewCount}</div>
            </div>
            <h3>User Reviews</h3>
            <ul>
                {userReviews.map(review => (
                    <li key={review.review_id} className="review-item">
                        <div className="review-header">
                            <span className="review-date">{formatDate(review.date)}</span>
                        </div>
                        <div className="review-rating">
                            <strong>Rating:</strong> {renderStars(review.stars)} ({review.stars.toFixed(1)})
                        </div>
                        <div className="review-text">{review.text}</div>
                        <div className="review-footer">
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

export default UserInfoPage;
