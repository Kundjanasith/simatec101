const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

// Serve static files from the backend directory
app.use(express.static(path.join(__dirname, '../backend')));

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});