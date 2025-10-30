const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
// Use the PORT environment variable in production, or 3001 for development
const port = process.env.PORT || 3001;

app.use(cors());

// Serve static files from the backend data directory
app.use('/data', express.static(path.join(__dirname, '../backend')));

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

// For any other request, send the React app's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});