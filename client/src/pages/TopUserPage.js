import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import loadingGIF from '../images/running_loader.gif';
const config = require('../config.json');

function TopUsersPage() {
    const [topUsers, setTopUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTopUsers = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://${config.server_host}:${config.server_port}/top-users`);
                const data = await response.json();
                setTopUsers(data);
            } catch (error) {
                console.error('Failed to fetch top users:', error);
            }
            setIsLoading(false);
        };

        fetchTopUsers();
    }, []);

    if (isLoading) {
        return <img src={loadingGIF} alt="Loading top users..." className="loading-image"/>;
    }

    return (
        <div>
            <h1>Top Users</h1>
            <ul>
                {topUsers.map(user => (
                    <li key={user.user_id}>
                        <Link to={`/user/${user.user_id}/info`}>{user.name}</Link>
                        <span> - {user.review_count} reviews</span>
                    </li>
                ))}
            </ul>
            )}
        </div>
    );
}

export default TopUsersPage;
