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

    // Construct the SQL query with LIKE for partial match on name
    const query = `
        SELECT b.business_id, b.name
        FROM business b
        JOIN address a ON b.address_id = a.address_id
        JOIN zipcode z ON a.postal_code = z.postal_code
        WHERE b.name LIKE ? AND z.city = ? AND z.state = ?;
    `;

    // Prepare the name parameter for the LIKE clause
    const nameLike = `%${name}%`;

    // Execute the query
    connection.query(query, [nameLike, city, state], (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Send back the results
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

// Route 4: GET /userReviews?user_id=1
const getUserReviews = function(req, res) {
    // Construct the SQL query to fetch reviews given a user id.

    // Extract the user_id from query parameters
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: "User ID Invalid" });
    }

    const query = `
        SELECT r.review_id, r.user_id, r.business_id, r.stars, r.useful, r.funny, r.cool, r.text, r.date, b.name AS business_name
        FROM review r
        JOIN business b ON r.business_id = b.business_id
        WHERE r.user_id = '${ user_id }';
    `;

    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Extract state names from the results
        const reviews = results.map(row => row.review);

        // Send back all the reviews
        res.json({ reviews });
    });
};

// Export the new route along with any existing ones
module.exports = {
    searchBusiness,
    getCities,
    getStates,
};
