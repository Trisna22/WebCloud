
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


router.get('/fileData', (request, response) => {
        if (request.session.sessionID === undefined || 
                request.session.username === undefined ||
                request.session.loggedin === false) {

                response.json({'path':'/fileData',
                        'statusCode':2,
                        'description':"unauthorized",
                        'username':null});
                return;
        }

        var username = request.param('username');
        var APIKey = request.param('API_KEY');

        if (APIKey === undefined) {
                response.json({'path':'/fileData',
                        'statusCode':4,
                        'description':"invalid request",
                        'username':request.session.username});
                return;
        }
        if (username === undefined) {
                response.json({'path':'/fileData',
                        'statusCode':4,
                        'description':"invalid request",
                        'username':request.session.username});
                return;
        }

        console.log('query: ' + request.param('API_KEY').toString());
        console.log('query2: '+ request.param('username').toString());

        if (checkAPIKey(username, APIKey) === false) {
                response.json({"path":"/fileData", 
                'statusCode':2,
                'description':"invalid API key or username",
                'username':username});
                return;
        }

        response.json({'path':'/fileData', 
                'statusCode':0,
                'description':'ok',
                'username':request.session.username});
});

// You need to login to use this API.
router.get('/login', urlencodedParser, (request, response) => {
        if (request.session.loggedin === undefined || request.session.loggedin === false) {
                response.json({'path':'/login',
                        'statusCode':2,
                        'description':'unauthorized',
                        'username': null});
                return;
        }
        else {
                if (checkAlreadyHasKey(request) === true) {

                        response.json({'path':'/login', 
                                'statusCode':3,
                                'description':'already got key',
                                'username':request.session.username});
                        return;
                }
        }

        var APIKEY = crypto.randomBytes(32).toString('hex');

        API_keys.push({'username':request.session.username,
                'APIKey':APIKEY,
                'sessionID':request.session.sessionID});

        response.json({'path':'/login', 
                'statusCode':0,
                'description':'ok',
                'username':request.session.username,
                'APIKey':APIKEY});
});


function checkAPIKey(username, APIKey) {

        for (let item of API_keys) {
                if (item.APIKey === APIKey && item.username === username)
                        return true;
        }

        return false;
}

function checkAlreadyHasKey(request) {
        for (let item of API_keys) {
                if (item.username === request.session.username
                        && item.sessionID === request.session.sessionID)
                        return true;
        }
        return false;
}

module.exports = router;
//https://github.com/cornflourblue/node-basic-authentication-api/blob/master/users/users.controller.js
