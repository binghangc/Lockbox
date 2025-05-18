require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

// imported routes
const tripRoutes = require('./routes/trips');
const thumbnailsRoute = require('./routes/thumbnails');

app.use(express.json());

// Check IP address
app.get('/', (req, res) => res.send('API is running'));

// API auth endpoints: signup, login, logout
app.use('/auth', require('./routes/auth'));

// API profile endpoints: get and edit profile info, ie name, bio, avatar_url
app.use('/profile', require('./routes/profile'));

// API trip endpoints: get and edit trip info, ie name, description, start_date, end_date
app.use('/trips', tripRoutes);
app.use('/thumbnails', thumbnailsRoute);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
