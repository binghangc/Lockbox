require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

// imported routes
const uploadAvatarRoute = require('./routes/upload-avatar');

app.use(express.json());

// Check IP address
app.get('/', (req, res) => res.send('API is running'));

// API auth endpoints: signup, login, logout
app.use('/auth', require('./routes/auth'));

// API profile endpoints: get and edit profile info, ie name, bio, avatar_url
app.use('/profile', require('./routes/profile'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
