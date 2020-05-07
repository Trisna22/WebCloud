
const express = require('express');
const router = express.Router();

const sessionHandler = require('../sessionHandler');

// Creating API from codeproject
//https://www.codeproject.com/Articles/1239390/Creating-Simple-API-in-Node-js

// Uploading files with JSON API
//https://dotnetcoretutorials.com/2018/07/21/uploading-images-in-a-pure-json-api/


router.get('/', (request, response) => {
        response.send("Test API by /api/test");
});

/// GET :8080/api/test
router.get('/test', (request, response) => {

        if (request.session.sessionID === undefined) {
                response.json({"path":"/test", 
                'statusCode':404,
                'description':"unauthorized",
                'username':null});
                return;
        }

        response.json({"test":"Welcome by the API", 'sessionID':request.session.sessionID});
});


router.get('/fileData', (request, response) => {
        if (request.session.sessionID === undefined) {
                response.json({'path':'/fileData',
                'statusCode':404,
                'description':"unauthorized",
                'username':null});
                return;
        }

        response.json({'data':'dir', 'username':request.session.username});
});

module.exports = router;
//https://github.com/cornflourblue/node-basic-authentication-api/blob/master/users/users.controller.js
