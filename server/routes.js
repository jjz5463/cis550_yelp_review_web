const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect((err) => err && console.log(err));

/******************
 * ROUTES *
 ******************/

// Route 1: GET /searchBusiness
// input business name (not have to be exact), city, state -> return a list of matching business
// example use case: http://localhost:8080/searchBusiness?name=alice&city=Santa%20Barbara&state=CA
const searchBusiness = function(req, res) {
    // Extract query parameters
    const { name, city, state } = req.query;

    // Start constructing the SQL query, initially without WHERE clauses
    let query = `
        SELECT b.business_id, b.name
        FROM business b
        JOIN address a ON b.address_id = a.address_id
        JOIN zipcode z ON a.postal_code = z.postal_code
    `;

    const queryParams = [];

   
    if (name) {
        query += ` AND b.name LIKE ?`;
        queryParams.push(`%${name}%`);
    }
    if (city) {
        query += ` AND z.city = ?`;
        queryParams.push(city);
    }
    if (state) {
        query += ` AND z.state = ?`;
        queryParams.push(state);
    }
    connection.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }

       
        res.json(results);
    });
};



// Route 2: GET /cities
// example use case: http://localhost:8080/cities
const getCities = function(req, res) {
    // Construct the SQL query to fetch distinct city names
    const query = `
        SELECT DISTINCT z.city
        FROM address a
        JOIN zipcode z ON a.postal_code = z.postal_code
        ORDER BY z.city ASC;
    `;

    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Extract city names from the results
        const cities = results.map(row => row.city);

        // Send back the list of cities
        res.json({ cities });
    });
};

// Route 3: GET /states
// example usecase: http://localhost:8080/states
const getStates = function(req, res) {
    // Construct the SQL query to fetch distinct state names
    const query = `
        SELECT DISTINCT z.state
        FROM zipcode z
        ORDER BY z.state ASC;
    `;

    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Extract state names from the results
        const states = results.map(row => row.state);

        // Send back the list of states
        res.json({ states });
    });
};

// Route 4: GET /business/:businessId
// example use case: http://localhost:8080/business/1
const getBusinessInfo = function(req, res) {
    const { businessId } = req.params;

    const query = `
        SELECT
            business_id,
            name,
            categories,
            hours,
            address,
            latitude,
            longitude,
            postal_code,
            city,
            state
        FROM BusinessInfoStatic
        WHERE business_id = ?;
    `;

    connection.query(query, [businessId], (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: "Business not found" });
        }
    });
};


// Route 5: GET business/:businessId/reviews
// example use case: http://localhost:8080/business/1/reviews
const getBusinessReviews = function(req, res) {
    const { businessId } = req.params; // Extract businessId from URL parameters

    const query = `
        SELECT review_id, r.user_id, u.name, stars, text, date, useful, funny, cool
        FROM review r
        JOIN user u ON r.user_id = u.user_id
        WHERE business_id = ?
        ORDER BY date DESC; 
    `;

    connection.query(query, [businessId], (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Send back the list of reviews
        res.json(results);
    });
};

// Route 6: GET /business/:businessId/reviewSummary
const getReviewSummary = function(req, res) {
    const { businessId } = req.params; // Extract businessId from URL parameters

    // SQL query to get review count and average stars for the specified business
    const query = `
        SELECT 
            COUNT(review_id) AS review_count, 
            AVG(stars) AS average_stars
        FROM review
        WHERE business_id = ?
    `;

    connection.query(query, [businessId], (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Since the query returns a single row, use results[0] to send the summary back
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            // If there are no reviews, return 0 count and null for average stars
            res.json({ review_count: 0, average_stars: null });
        }
    });
};

// Route 7: GET /user/:userId/info
const getUserInfo = function(req, res) {
    const { userId } = req.params;

    const query = `
        SELECT
            user_id,
            name,
            yelping_since
        FROM user
        WHERE user_id = ?;
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
};

// Route 8: GET /user/:userId/reviews
const getUserReviews = function(req, res) {
    const { userId } = req.params;

    const query = `
        SELECT review_id, business_id, stars, text, date, useful, funny, cool
        FROM review
        WHERE user_id = ?
        ORDER BY date DESC;
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        res.json(results);
    });
};

// Route 9: GET /user/:userId/reviewSummary
const getUserReviewSummary = function(req, res) {
    const { userId } = req.params;

    const query = `
        SELECT 
            COUNT(review_id) AS review_count, 
            AVG(stars) AS average_stars
        FROM review
        WHERE user_id = ?
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({ review_count: 0, average_stars: null });
        }
    });
};

// Route 10: GET /top-users (Complex, about 18s to run)
const getTopUsers = function(req, res) {
    const query = `
        SELECT
            u.user_id,
            u.name,
            COUNT(r.review_id) AS review_count
        FROM
            user u
        JOIN review r ON u.user_id = r.user_id
        GROUP BY
            u.user_id
        ORDER BY review_count DESC
        LIMIT 20;
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
    });
};

// Route 11: GET /top-business (Complex, about 6s to run)
const getTopBusiness = function(req, res) {
    const query = `
        SELECT
            b.business_id,
            b.name,
            COUNT(r.review_id) AS review_count
        FROM 
            business b
        JOIN review r ON b.business_id = r.business_id
        GROUP BY 
            b.business_id
        ORDER BY review_count DESC
        LIMIT 20;
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
    });
};

// Route 12: GET /featured-review/:businessId (complex, 3 secs)
const featuredReview = function(req, res) {
    const { businessId } = req.params;

    const query = `
        WITH ReviewCounts AS (
            SELECT
                business_id,
                COUNT(review_id) AS reviews_count
            FROM
                review
            GROUP BY
                business_id
            HAVING
                COUNT(review_id) >= 10
        ), ReviewImpactScores AS (
            SELECT
                r.business_id,
                r.review_id,
                r.text AS review_text,
                (r.useful + r.funny + r.cool) AS impact_score,
                ROW_NUMBER() OVER (PARTITION BY r.business_id ORDER BY (r.useful + r.funny + r.cool) DESC) AS \`rank\`
            FROM
                review r
            JOIN ReviewCounts rc ON r.business_id = rc.business_id
        )
        SELECT
            ris.business_id,
            ris.review_id,
            ris.review_text,
            ris.impact_score
        FROM
            ReviewImpactScores ris
        WHERE
            ris.\`rank\` = 1 AND ris.business_id = ?
        ORDER BY
            ris.business_id;
    `;

    connection.query(query, [businessId], (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: "No featured review found for this business." });
        }
    });
};

// Route 13: GET /nearby-businesses/:latitude/:longitude (complex, 2 secs)
// Route to get nearby businesses to a specified location
const getNearbyBusinessesWithRatings = function(req, res) {
    const { latitude, longitude } = req.params;

    const query = `
        SELECT
            b.business_id,
            b.name,
            a.latitude,
            a.longitude,
            ST_Distance_Sphere(point(a.longitude, a.latitude), point(?, ?)) AS distance_in_meters,
            COALESCE(AVG(r.stars), 0) AS average_stars,
            COALESCE(COUNT(r.review_id), 0) AS review_count
        FROM
            business b
        JOIN address a ON b.address_id = a.address_id
        LEFT JOIN review r ON b.business_id = r.business_id
        WHERE
            ST_Distance_Sphere(point(a.longitude, a.latitude), point(?, ?)) <= 1609.34
        GROUP BY
            b.business_id, b.name, a.latitude, a.longitude
        ORDER BY distance_in_meters ASC;
    `;

    // Execute the query with latitude and longitude parameters twice
    connection.query(query, [longitude, latitude, longitude, latitude], (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ error: "No nearby businesses found within 1 mile." });
        }
    });
};

// Route 14: GET /top-business/:city (Complex, about 6s to run)
const getTopBusinessByCity = function(req, res) {
    const city = req.params.city; // get the city from the URL parameter
    const query = `
        SELECT
            b.business_id,
            b.name,
            COUNT(r.review_id) AS review_count
        FROM 
            business b
        JOIN address a ON b.address_id = a.address_id
        JOIN zipcode z ON a.postal_code = z.postal_code
        JOIN review r ON b.business_id = r.business_id
        WHERE z.city = ?
        GROUP BY 
            b.business_id
        ORDER BY review_count DESC
        LIMIT 20;
    `;

    connection.query(query, [city], (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
    });
};


// Export the new route along with any existing ones
module.exports = {
    searchBusiness,
    getCities,
    getStates,
    getBusinessInfo,
    getBusinessReviews,
    getReviewSummary,
    getUserInfo,
    getUserReviews,
    getUserReviewSummary,
    getTopUsers,
    getTopBusiness,
    featuredReview,
    getNearbyBusinessesWithRatings,
    getTopBusinessByCity
};
