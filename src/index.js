
const express = require('express'),
    passport = require('passport'),
    bodyParser = require("body-parser"),
    path = require('path'),
    createRoutes = require('./routes'),
    auth = require('./auth');

require('dotenv').config({ path: path.join(__dirname, '.env') })

const PORT = process.env.PORT || 4444;
const app = express();

//middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

//authentication and routes
auth(passport);
createRoutes(app, passport);

//listen
app.listen(PORT, "0.0.0.0", () => {
    console.info(`User-service listening on ${PORT}`);
});
