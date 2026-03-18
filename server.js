// A minimal server just to host the static files on port 3000
// This is required so Supabase has a valid URL (http://localhost:3000) to redirect to after email confirmation!

const express = require('express');
const path = require('path');
const app = express();

const PORT = 3000;

// Serve the static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Frontend server running perfectly at http://localhost:${PORT}`);
});
