const express = require('express');
const { upload, createDatabaseAndTable } = require('../controllers/databaseController');

const router = express.Router();

router.post('/upload', upload.single('file'), createDatabaseAndTable);

module.exports = router;
