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
    // Route: GET /searchBusiness
    // input business name (not have to be exact), city, state -> return a list of matching business
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


// Export the new route along with any existing ones
module.exports = {
    searchBusiness // Add your new route here
};
