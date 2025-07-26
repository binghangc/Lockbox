require('dotenv').config({ path: './server/.env.server' });

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Check IP address
app.get('/', (req, res) => res.send('API is running'));

// API auth endpoints: signup, login, logout
app.use('/auth', require('./routes/auth.js'));

// API profile endpoints: get and edit profile info, ie name, bio, avatar_url
app.use('/profile', require('./routes/profile.js'));

// API trip endpoints: get and edit trip info, ie name, description, start_date, end_date
app.use('/trips', require('./routes/trips.js'));
app.use('/thumbnails', require('./routes/thumbnails.js'));

// API invites endpoints: send and respond to invites
app.use('/invites', require('./routes/invites.js'));

// API friends endpoints: get friends information, search new friends, and respond to requests
app.use('/friends', require('./routes/friends.js'));

app.use('/vibechecks', require('./routes/vibechecks.js'));

app.use('/orbs', require('./routes/orbs.js'));

app.use('/notifications', require('./routes/notifications.js'));

app.use('/vault', require('./routes/vault.js'));

module.exports = app;
