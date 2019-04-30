const functions = require('firebase-functions');
const app = require('express')();

const firebaseAuth = require('./util/firebaseAuth');

// Community Routes
const {getAllCommunities, getCommunity, createCommunity} = require('./handlers/communities');
    // Create
app.post('/community', firebaseAuth, createCommunity);
    //Read
app.get('/communities', getAllCommunities);
app.get('/community/:communityId', getCommunity);
    // Update
    // Delete
    // Join Community
    // Leave Community

// User Routes
const {signup, login, uploadImage, changeUserDetails, getUserDetails} = require('./handlers/users');
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', firebaseAuth, uploadImage);
app.post('/user', firebaseAuth, changeUserDetails);
app.get('/user', firebaseAuth, getUserDetails);

exports.api = functions.https.onRequest(app);