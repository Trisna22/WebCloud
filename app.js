const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const express = require('express');
const session = require('express-session');
const app = express();
app.use(session({
	secret: 'This is a cot-damn secret!',
	resave: true,
	saveUninitialized: true
}));

const accountHandler = require("./accountHandler");

const host = '0.0.0.0';
const port = 8080;
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use('/static', express.static('html/static'));

app.use('/api', require('./api/api.js'));


app.get('/', function (request, response) {
        var html = fs.readFileSync("html/index.html").toString();
        response.send(html);
});

app.get('/login', function(request, response) {
        response.send(buildLoginPage
                ("<p>In order to proceed you need " +
                "to login or" +
                " <a href=\"/register\">create</a> an account first!</p>", request));
});

app.get('/register', function(request, response) {
        response.send(buildRegisterPage
                ("<p>In order to proceed you need " +
                "to <a href=\"/login\">login</a> or" +
                " create an account first!</p>", request)
                );
});

app.get('/about-us', function(request, response) {
        var html = fs.readFileSync('html/about-us.html').toString();
        html = html.replace('{{LOGIN}}', buildHeader(request));
        response.send(html);
});

app.get('/my-files', function(request, response) {
        var html = fs.readFileSync('html/my-files.html').toString();
        html = html.replace('{{LOGIN}}', buildHeader(request));
        response.send(html);
});


app.get('/settings', function (request, response) {
        var html = fs.readFileSync('html/settings.html').toString();
        html = html.replace('{{LOGIN}}', buildHeader(request));
        response.send(html);
});

app.get('/my-profile', function (request, response) {
        
        (async () => {
        var html = fs.readFileSync('html/my-profile.html').toString();
        html = html.replace('{{LOGIN}}', buildHeader(request));
        
        if (request.session.loggedin === undefined || request.session.loggedin === false) {
                html = html.replace("{{username}}", "not_logged_in");
                html = html.replace("{{createdOn}}", "not_logged_in");
                html = html.replace("{{firstname}}", "not_logged_in");
                html = html.replace("{{lastname}}", "not_logged_in");
                html = html.replace("{{email}}", "not_logged_in");
        }
        else {
                var aH = new accountHandler(request, response);

                        const userInfo = await aH.getAccountInfo(request.session.username);
                        if (userInfo.returnValue === false) {
                                html = html.replace("{{username}}", "not_logged_in");
                                html = html.replace("{{createdOn}}", "not_logged_in");
                                html = html.replace("{{firstname}}", "not_logged_in");
                                html = html.replace("{{lastname}}", "not_logged_in");
                                html = html.replace("{{email}}", "not_logged_in");
                        }
        
                        html = html.replace("{{username}}", userInfo['username']);
                        html = html.replace("{{createdOn}}", userInfo['createdOn']);
                        html = html.replace("{{firstname}}", userInfo['firstname']);
                        html = html.replace("{{lastname}}", userInfo['lastname']);
                        html = html.replace("{{email}}", userInfo['email']);
                }
                
                response.send(html);
        })();
});

app.post('/login', urlencodedParser, function(request, response) {

        if (request.session.sessionID === undefined) {
                request.session.sessionID = crypto.randomBytes(32).toString('base64');
                console.log("New sessionID: " + request.session.sessionID)
        }
        else {
                if (request.session.loggedin === true) {
                        response.send(buildLoginPage(
                                "<p style=\"color: red\">You already logged in!</p>", request
                        ));
                        return;
                }
        }

        // Get post data.
        var username = request.body.userName;
        var password = request.body.password;
        var sessionID = request.session.sessionID;

        if (username === undefined || password === undefined) {
                console.log("Empty post request");
                response.send(buildLoginPage(
                        "<p style=\"color: green\">Invalid POST request sent!</p>", request
                ));
                return;
        }

        var aH = new accountHandler(request, response);
        aH.doLogin(username, password,sessionID)
});

app.post("/register", urlencodedParser, function(request, response) {
        
        if (request.session.sessionID === undefined) {
                request.session.sessionID = crypto.randomBytes(32).toString('base64');
                console.log("New sessionID: " + request.session.sessionID)

                request.session.loggedin = false;
                request.session.tries = 0;
        }
        else {
                if (request.session.loggedin === true) {
                        response.send(buildRegisterPage(
                                "<p style=\"color: red\">You already logged in!</p>", request
                        ));
                        return;
                }
        }

        // Get the post data.
        var userName = request.body.userName;
        var firstName = request.body.firstName;
        var lastName = request.body.lastName;
        var email = request.body.email;
        var password = request.body.password;
        var password2 = request.body.password2;
        var agreeTerms = request.body.agreeTerms;

        if (userName === undefined || firstName === undefined ||
                lastName === undefined || email === undefined ||
                password === undefined || password2 === undefined ||
                agreeTerms === undefined) {
                response.send(buildLoginPage(
                        "<p style=\"color: green\">Invalid POST request sent!</p>", request
                ));
                return;
        }

        var aH = new accountHandler(request, response);
        aH.registerNewAccount(userName, firstName, lastName,
                email, password, password2, agreeTerms, request.session);
});

app.get('/logout', (request, response)=> {
        if (request.session.loggedin === undefined) {
                response.send(buildLoginPage("<p style=\"color: red\">You are not logged in!</p>", request));
                return;
        }
        
        request.session.loggedin = undefined;
        request.session.sessionID = undefined;
        request.session.username = undefined;
        request.session.destroy(function(error) {
                if (error) {
                        console.log(error);
                        return;
                }

                response.send(buildLoginPage(
                        "<p style=\"color: green\">Succesfully logged out!</p>", request
                ));
        });

});

function buildHeader(request) {

        if (request === undefined || request.session === undefined
                || request.session.loggedin === undefined ||
                 request.session.loggedin === false) {
                return "<li onclick=\"window.location.href='/'\"><h3>WebCloud</h3></li>" +
                "<li onclick=\"window.location.href='/about-us'\"><h3>About us</h3></li>" +
                "<li onclick=\"window.location.href='/register'\"><h3>Register</h3></li>"+
                "<li onclick=\"window.location.href='/login'\"><h3>Login</h3></li>";
        }
        return "<li onclick=\"window.location.href='/my-files'\"><h3>My-Files</h3></li>" +
                "<li onclick=\"window.location.href='/my-profile'\"><h3>My-Profile</h3></li>" +
                "<li onclick=\"window.location.href='/settings'\"><h3>Settings</h3></li>" +
                "<li onclick=\"window.location.href='/logout'\"><h3>Logout</h3></li>" +
                "<h4 class=\"usernameLabel\">" + request.session.username + "</h4>";

}

function buildRegisterPage(message, request) {
        var html = fs.readFileSync('html/register.html').toString();
        html = html.replace('{{registerText}}', message);
        html = html.replace('{{LOGIN}}',  buildHeader(request));
        return html;
}

function buildLoginPage(message, request) {
        var html = fs.readFileSync('html/login.html').toString();
        html = html.replace('{{loginText}}',message);
        html = html.replace('{{LOGIN}}', buildHeader(request));
        return html;
}

var key_domain = fs.readFileSync('domain.key', 'utf8');
var crt_domain = fs.readFileSync('domain.crt', 'utf8');
var credentials = {key: key_domain, cert: crt_domain};

var httpsServer = https.createServer(credentials, app);


httpsServer.listen(port);
console.log("Listening for connections.");
