const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3030;

app.use(express.static('node'));
app.use('/AOI_hit', express.static('AOI_hit'));
app.use('/stimuli', express.static('stimuli'));

// Endpoint to get list of CSV files
app.get('/api/files', (req, res) => {
  const folderPath = path.join(__dirname, 'AOI_hit');
  fs.readdir(folderPath, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read folder' });
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    res.json(csvFiles);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});