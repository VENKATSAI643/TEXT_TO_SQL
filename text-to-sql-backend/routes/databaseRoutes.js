const express = require('express');
const { upload, createDatabaseAndTable } = require('../controllers/databaseController');

const { getColumnsFromFile } = require('../controllers/databaseController');


const router = express.Router();

router.post('/upload', upload.single('file'), createDatabaseAndTable);
router.post('/columns', upload.single('file'), getColumnsFromFile);

module.exports = router;
