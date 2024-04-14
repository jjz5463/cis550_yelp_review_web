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
    getUserReviewSummary
};
