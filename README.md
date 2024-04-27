# cis550_yelp_review_web
A simple review site demo using yelp data. 
There are about 7 million reviews in the database.

Features Includes:

1. Search for a business using name + city + state
2. View list of matched results from feature 1
2. View business detailed Info including name, address, hours, ratings, reviews. Able to see a featured review for a business if condition was met (>= 10 reviews)
3. View user Info including name, reviews, ratings
4. View top 20 active users 
5. View top 20 trending business (All cities or a Particular city)
7. Use your geo location to find nearby businesses

This Repo has a client-sever architecture. The sever uses NodeJS and client uses React.
To run the code, first start the server.

Under the `/server` folder, run `npm install` to install all the dependencies, then `npm start` which will start the sever on port `:8000`

```
npm install
npm start
```

After the start of sever, go to `/client` folder and run the same thing to install dependencies and start client on port `:3000`

```
npm install
npm start
```