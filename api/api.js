
const express = require('express');
const router = express.Router();


// Creating API from codeproject
//https://www.codeproject.com/Articles/1239390/Creating-Simple-API-in-Node-js

// Uploading files with JSON API
//https://dotnetcoretutorials.com/2018/07/21/uploading-images-in-a-pure-json-api/


/// GET :8080/api/test
router.get('/test', (request, response) => {
	response.json({"test":"Welcome by a API"});
});

module.exports = router;
