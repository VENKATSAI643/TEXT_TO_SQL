const pool = require('../models/database');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// Set up file upload with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Define the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Preserve original file name
  }
});

// Create multer upload middleware with the storage config
const upload = multer({ storage: storage });
// Helper function to sanitize names (e.g., column names, table names)
const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9_]/g, '_');

// Create database and table from uploaded CSV file
const createDatabaseAndTable = async (req, res) => {
  const { dbName } = req.body;
  const file = req.file;

  // Check if database name and file are provided
  if (!dbName || !file) {
    return res.status(400).send('Database name and file are required.');
  }

  // Check if the uploaded file is a CSV
  if (!file.mimetype.includes('csv')) {
    return res.status(400).send('Only CSV files are allowed.');
  }

  const tableName = sanitizeName(file.originalname.split('.')[0]);

  try {
    // Create database if not exists and switch to it
    await pool.query(`CREATE DATABASE IF NOT EXISTS ??`, [dbName]);
    await pool.query(`USE ??`, [dbName]);

    const columns = [];
    const rows = [];

    // Parse the CSV file
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('headers', (headers) => {
        // Push sanitized column names into columns array
        headers.forEach((header) => {
          columns.push(`\`${sanitizeName(header)}\` VARCHAR(255)`); // Default data type: VARCHAR
        });
      })
      .on('data', (data) => rows.push(data)) // Collect data rows
      .on('end', async () => {
        try {
          // Create table with the parsed columns
          const createTableQuery = `CREATE TABLE \`${tableName}\` (${columns.join(', ')})`;
          await pool.query(createTableQuery);

          // Insert rows into the table
          for (const row of rows) {
            const keys = Object.keys(row).map((key) => `\`${sanitizeName(key)}\``).join(', ');
            const values = Object.values(row)
              .map((val) => `'${val.replace(/'/g, "\\'")}'`)
              .join(', ');

            await pool.query(`INSERT INTO \`${tableName}\` (${keys}) VALUES (${values})`);
          }

          // Clean up the uploaded file after processing
          fs.unlinkSync(file.path); 
          res.status(200).send(`Database ${dbName} and table ${tableName} created successfully.`);
        } catch (error) {
          // Clean up file if any error occurs during table creation or data insertion
          fs.unlinkSync(file.path); 
          console.error('Error processing CSV file:', error);
          res.status(500).send('Error processing file: ' + error.message);
        }
      })
      .on('error', (err) => {
        // Handle file parsing error
        fs.unlinkSync(file.path); // Clean up the file in case of error
        res.status(500).send('Error parsing file: ' + err.message);
      });
  } catch (error) {
    console.error('Error creating database or table:', error);
    res.status(500).send('Error creating database or table: ' + error.message);
  }
};

// Get column names from the uploaded CSV file (for constraint definition)
const getColumnsFromFile = async (req, res) => {
  const file = req.file;

  // Check if file is provided
  if (!file) {
    return res.status(400).send('File is required.');
  }

  const columns = [];

  // Parse the CSV file to get the column headers
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('headers', (headers) => {
      // Push sanitized column names
      headers.forEach((header) => columns.push(sanitizeName(header)));
    })
    .on('end', () => {
      // Clean up the uploaded file after parsing
      fs.unlinkSync(file.path); 
      res.status(200).send({ columns }); // Return columns as a response
    })
    .on('error', (err) => {
      // Handle any errors during parsing
      fs.unlinkSync(file.path); // Clean up the file in case of error
      res.status(500).send('Error parsing file: ' + err.message);
    });
};

module.exports = { upload, createDatabaseAndTable, getColumnsFromFile };
