const https = require('https');
const fs = require('fs');

const express = require('express');
const session = require('express-session');
const app = express();
app.use(session({
	secret: 'This is a cot-damn secret!',
	resave: true,
	saveUninitialized: true
}));

const sessionHandler = require('./sessionHandler');
const accountHandler = require("./accountHandler");

const host = '0.0.0.0';
const port = 8080;
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use('/static', express.static('html/static'));

app.get('/', function (request, response) {
        var html = fs.readFileSync("html/index.html").toString();
        response.send(html);
});

app.get('/login', function(request, response) {
        response.send(buildLoginPage
                ("<p>In order to proceed you need " +
                "to login or" +
                " <a href=\"/register\">create</a> an account first!</p>")
                );
});

app.get('/register', function(request, response) {
        response.send(buildRegisterPage
                ("<p>In order to proceed you need " +
                "to <a href=\"/login\">login</a> or" +
                " create an account first!</p>")
                );
});

app.get('/about-us', function(request, response) {
        var html = fs.readFileSync('html/about-us.html').toString();
        response.send(html);
});

app.post('/login', urlencodedParser, function(request, response) {

        if (request.session.sessionID === undefined) {
                console.log("New user!");
                var sH = new sessionHandler();
                request.session.sessionID = sH.createNewSessionID();
                console.log("New sessionID: " + request.session.sessionID)
        }

        // Get post data.
        var username = request.body.userName;
        var password = request.body.password;
        var sessionID = request.session.sessionID;

        var aH = new accountHandler(request, response);
        aH.doLogin(username, password,sessionID)
});

app.post("/register", urlencodedParser, function(request, response) {
        if (request.session.sessionID === undefined) {
                console.log("New user!");
                var sH = new sessionHandler();
                request.session.sessionID = sH.createNewSessionID();
                console.log("New sessionID: " + request.session.sessionID)
        }

        // Get the post data.
        var userName = request.body.userName;
        var firstName = request.body.firstName;
        var lastName = request.body.lastName;
        var email = request.body.email;
        var password = request.body.password;
        var password2 = request.body.password2;
        var agreeTerms = request.body.agreeTerms;

        var aH = new accountHandler(request, response);
        aH.registerNewAccount(userName, firstName, lastName,
                email, password, password2, agreeTerms, request.session);
});


function buildRegisterPage(message) {
        var html = fs.readFileSync('html/register.html').toString();
        html = html.replace('{{registerText}}', message);
        return html;
}

function buildLoginPage(message) {
        var html = fs.readFileSync('html/login.html').toString();
        html = html.replace('{{loginText}}', message);
        return html;
}

var key_domain = fs.readFileSync('domain.key', 'utf8');
var crt_domain = fs.readFileSync('domain.crt', 'utf8');
var credentials = {key: key_domain, cert: crt_domain};

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(port);
console.log("Listening for connections.");
