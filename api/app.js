const express = require('express');
const session = require('express-session');
var app = express();


// Creating API from codeproject
//https://www.codeproject.com/Articles/1239390/Creating-Simple-API-in-Node-js

// Uploading files with JSON API
//https://dotnetcoretutorials.com/2018/07/21/uploading-images-in-a-pure-json-api/


app.get('/test', (request, response) => {
	response.json({"test":"Welcome by a API"});
});

app.listen(8081, () => {
	var dateTime = new Date();
	console.log("Server running since " + dateTime);
});
