
const express = require('express');
const router = express.Router();

// Handles our API request:
router.get('/fileData', (request, response) =>{
        response.json({test:"TEST_DATA2"});
});

module.exports = router;