
const express = require('express');
const router = express.Router();

const sessionHandler = require('../sessionHandler');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const crypto = require('crypto');

const url = require('url');

// Creating API from codeproject
//https://www.codeproject.com/Articles/1239390/Creating-Simple-API-in-Node-js

// Uploading files with JSON API
//https://dotnetcoretutorials.com/2018/07/21/uploading-images-in-a-pure-json-api/


var API_keys = [];

router.get('/', (request, response) => {
        response.send("Test API by /api/test");
});

/// GET :8080/api/test
router.get('/test', (request, response) => {

        if (request.session.sessionID === undefined || 
                request.session.username === undefined ||
                request.session.loggedin === false) {

                response.json({"path":"/test", 
                'statusCode':2,
                'description':"unauthorized",
                'username':null});
                return;
        }

        response.json({"test":"Welcome by the API", 'sessionID':request.session.sessionID});
});

router.get('/users/:username', (request, response) => {
        const username = request.params.username;

        var apiKey = request.param('key');
        if (apiKey === undefined) {
                response.json({'path':request.path,
                        'statusCode':4,
                        'description':"invalid request",
                        'username':username});
                return;
        }

        // Get the user files.
        console.log("username: " + username);
        response.json({'path':request.path,
                'username':username,
                'apiKey':apiKey});
});

module.exports = router;
//https://github.com/cornflourblue/node-basic-authentication-api/blob/master/users/users.controller.js
