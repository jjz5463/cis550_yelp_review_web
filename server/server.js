const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
    origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/searchBusiness', routes.searchBusiness);
app.get('/cities', routes.getCities);
app.get('/states', routes.getStates);
app.get('/business/:businessId', routes.getBusinessInfo);
app.get('/business/:businessId/reviews', routes.getBusinessReviews);
app.get('/business/:businessId/reviewSummary', routes.getReviewSummary);
app.get('/user/:userId/info', routes.getUserInfo);
app.get('/user/:userId/reviews', routes.getUserReviews);
app.get('/user/:userId/reviewSummary', routes.getUserReviewSummary);
app.get('/top-users', routes.getTopUsers);
app.get('/top-business', routes.getTopBusiness);
app.get('/featured-review/:businessId', routes.featuredReview);
app.get('/nearby-businesses/:latitude/:longitude', routes.getNearbyBusinessesWithRatings);

app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;