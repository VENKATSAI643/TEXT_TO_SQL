const pool = require('../models/database');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const sanitizeName = (name) => name.replace(/[^a-zA-Z0-9_]/g, '_'); // Sanitize names

const createDatabaseAndTable = async (req, res) => {
  const { dbName } = req.body;
  const file = req.file;

  if (!dbName || !file) {
    return res.status(400).send('Database name and file are required.');
  }

  if (!file.mimetype.includes('csv')) {
    return res.status(400).send('Only CSV files are allowed.');
  }

  const tableName = sanitizeName(file.originalname.split('.')[0]);

  try {
    // Create database and use it
    await pool.query(`CREATE DATABASE IF NOT EXISTS ??`, [dbName]);
    await pool.query(`USE ??`, [dbName]);

    const columns = [];
    const rows = [];

    fs.createReadStream(file.path)
      .pipe(csv())
      .on('headers', (headers) => {
        headers.forEach((header) => {
          columns.push(`\`${sanitizeName(header)}\` VARCHAR(255)`);
        });
      })
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        try {
          const createTableQuery = `CREATE TABLE \`${tableName}\` (${columns.join(', ')})`;
          await pool.query(createTableQuery);

          for (const row of rows) {
            const keys = Object.keys(row).map((key) => `\`${sanitizeName(key)}\``).join(', ');
            const values = Object.values(row)
              .map((val) => `'${val.replace(/'/g, "\\'")}'`)
              .join(', ');

            await pool.query(`INSERT INTO \`${tableName}\` (${keys}) VALUES (${values})`);
          }

          fs.unlinkSync(file.path); // Clean up file after processing
          res.status(200).send(`Database ${dbName} and table ${tableName} created successfully.`);
        } catch (error) {
          fs.unlinkSync(file.path); // Clean up even on error
          throw error;
        }
      });
  } catch (error) {
    console.error('Error creating database:', error);
    res.status(500).send('Error creating database: ' + error.message);
  }
};

module.exports = { upload, createDatabaseAndTable };
