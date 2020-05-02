const https = require('https');
const fs = require('fs');

const express = require('express');
const session = require('express-session');
const app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

const host = '0.0.0.0';
const port = 8080;

app.use('/static', express.static('html/static'));

app.get('/', function (request, response) {
        var html = fs.readFileSync("html/index.html").toString();
        response.send(html);
});

app.get('/login', function(request, response) {

});


var key_domain = fs.readFileSync('domain.key', 'utf8');
var crt_domain = fs.readFileSync('domain.crt', 'utf8');
var credentials = {key: key_domain, cert: crt_domain};

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(port);
console.log("Listening for connections.");
