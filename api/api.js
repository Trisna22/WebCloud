
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

var mysql = require('mysql');
var pool = mysql.createPool({
        host     : 'localhost',
        user     : 'user',
        connectionLimit: 5,
        password : 'Password123',
        database : 'WebCloudDB'
});



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

        (async ()=> {
                var returnValue = await checkAPIRequest(username, apiKey);
                if (returnValue === false) {
                        response.json({'path':request.path,
                        'statusCode':2,
                        'description':"unauthorized",
                        'username':username});
                        return;
                }
                
                // Get the user files...


                console.log("username: " + username);
                response.json({'path':request.path,
                'statusCode':0,
                'decription':'ok',
                'username':username,
                'apiKey':apiKey});
        })();
});

function checkAPIRequest(username, apiKey) {

        return new Promise((resolve, reject) => {

                pool.getConnection(function(err, connection) {
                        
                        if (err) {
                                console.log("Failed to get connection!");
                                return resolve(false);
                        }
                        
                        connection.query(
                        "SELECT EXISTS (SELECT * FROM APICredentials WHERE username = " +
                        connection.escape(username) + 
                        " AND apiKey = " + connection.escape(apiKey) + ") as result;",
                        (err, data) => {
                        
                                if (err) {
                                        console.log("Query failed! error msg: " + err);
                                        return resolve(false);
                                }
                                        
                                connection.release();
                                if (data.length === 0) {
                                        return resolve(false);
                                }
                                
                                return err ? resolve(false) : resolve(data[0].result ? true : false);
                        });
                });
        });
}

module.exports = router;
//https://github.com/cornflourblue/node-basic-authentication-api/blob/master/users/users.controller.js
