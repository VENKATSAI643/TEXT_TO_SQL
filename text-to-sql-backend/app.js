const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const databaseRoutes = require('./routes/databaseRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api', databaseRoutes);

app.get('/api/databases', (req, res) => {
  res.json(['Database1', 'Database2']);
});

// Dummy query route
app.post('/api/query', (req, res) => {
  const { dbName, query } = req.body;
  // Simulate a response
  res.json({ result: `Executed query "${query}" on database "${dbName}"` });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
