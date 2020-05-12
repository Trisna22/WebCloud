var mysql = require('mysql');
const fs = require('fs');
var crypto = require('crypto');

var pool = mysql.createPool({
        host     : 'localhost',
        user     : 'user',
        connectionLimit: 5,
        password : 'Password123',
        database : 'WebCloudDB'
});

class accountHandler {
        constructor(request, response) {
                this.request = request;
                this.response = response;
        }


        buildRegisterPage(message) {
                var html = fs.readFileSync('html/register.html').toString();
                html = html.replace('{{registerText}}', message);
                html = html.replace('{{LOGIN}}', this.buildHeader(this.request));
                this.response.send(html);
        }

        buildLoginPage(message) {
                var html = fs.readFileSync('html/login.html').toString();
                html = html.replace('{{loginText}}', message);
                html = html.replace('{{LOGIN}}', this.buildHeader(this.request));
                this.response.send(html);
        }

        buildHeader(request) {

                if (request === undefined || request.session.loggedin === undefined || request.session.loggedin === false) {
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

        /*
                Registering a new account on the server.
        */
        registerNewAccount(userName, firstName, lastName,
                email, password, password2, agreeTerms) {
                
                var baseError = "<p style=\"color: red;\">";

                // Check if any inputbox is empty.
                if (this.checkIfEmpty([userName, firstName, lastName,
                        email, password, password2]) === true)
                {
                        this.buildRegisterPage(baseError + "Make sure every input box is filled with data!</p>");
                        return;
                }
        
                // Check if user agrees with our terms of condition.
                if (agreeTerms === undefined)
                {
                        this.buildRegisterPage(baseError + "You need to agree with the terms of condition to proceed!</p>");
                        return;
                }

                // Input validation.
                if (this.inputValidation([userName, firstName, lastName,
                        email, password, password2]) === true)
                {
                        this.buildRegisterPage(baseError + "Characters like ' \" \\ / | ` are not allowed! </p>");
                        return;
                }

                 // Checking if password has a correct value.
                 if (password.length < 8) {
                        this.buildRegisterPage(baseError + "Your password needs to have 8 or more characters!</p>");
                        return;
                }
                if (password !== password2) {
                        this.buildRegisterPage(baseError + "The first password doesn't match the second one! </p>");
                        return;
                }


                // Check if user already exists.
                (async () => {
                        const result = await this.checkIfAlreadyExists(userName, "userName");
                        if (result === 1) {
                                this.buildRegisterPage(baseError + "The username is already registered!<br> " +
                                "Click <a href=\"/login\">here</a> to login or try another username!</p>");
                                return;
                        }
                        else {
                                const result = await this.checkIfAlreadyExists(email, "emailAddress");
                                if (result === 1) {
                                        this.buildRegisterPage(baseError + "The email-address is already registered! <br>" +
                                        "Click <a href=\"/login\">here</a> to login or try another email-address!</p>");
                                        return;
                                }

                                const result2 = await this.createNewAccount(userName, firstName, lastName,
                                        email);
                                if (result2 === false) {
                                        this.buildRegisterPage
                                        (baseError + 
                                        "Failed to create a new account! Error code 2001</p>");
                                        return;
                                }

                                const result3 = await this.createNewAccount2(email, password);
                                if (result3 === false) {
                                        this.buildRegisterPage
                                        (baseError + 
                                        "Failed to create a new account! Error code 2002</p>");
                                        return;
                                }
                                else {

                                        this.request.session.tries = 0;
                                        this.request.session.username = userName;
                                        this.request.session.email = email;
                                        this.request.session.loggedin = true;
                                        
                                        this.response.redirect('/my-files');
                                }
                        }
                })();
        }

        /*
                Logging in an account.
        */
        doLogin(userName, password, sessionID) {

                var baseError = "<p style=\"color: red;\">";
                this.request.session.tries += 1;

                 // Check if any inputbox is empty.
                 if (this.checkIfEmpty([userName, password]) === true)
                {
                        this.buildLoginPage(baseError + "Make sure every input box is filled with data!</p>");
                        return;
                }

                // If the user had too many tries.
                if (this.request.session.tries >= 8) {
                        this.buildLoginPage(
                                baseError + "Too many tries, please contact the adminstrator for resetting your account!</p>"
                        );
                        return;
                }

                // Input validation.
                if (this.inputValidation([userName, password]) === true)
                {
                        this.buildLoginPage(baseError + "Characters like ' \" \\ / | ` are not allowed! </p>");
                        return;
                }

                (async () => {
                        // Check if the account exists.
                        const result = await this.checkIfAlreadyExists(userName, "userName");
                        // Maybe the username is an email-address
                        const result2 = await this.checkIfAlreadyExists(userName, "emailAddress");
                        if (result === 0 && result2 === 0) {
                                this.buildLoginPage(baseError + "Invalid username or password given!</p>");
                                return;
                        }

                        // Get the email-address from username if username is given.
                        var email = userName;
                        if (result === 1) {
                                email = await this.getEmailFromUsername(userName);
                                if (email === "" || email.indexOf("ERROR") != -1) {
                                        this.buildLoginPage(baseError + "An error code 2003 occured while processing your login! <br>Please contact the adminstrator!</p>");
                                        return;
                                }

                        }

                        // Get the salt.
                        const salt = await this.getSaltFromEmail(email);
                        if (salt === "" || salt.indexOf("ERROR")  != -1) {
                                this.buildLoginPage(baseError + "An error code 2003 occured while processing your login! <br>Please contact the adminstrator!</p>");
                                return;
                        }

                        // Now check if login is correct.
                        const loggedIn = await this.checkCredentials(email, salt, password);
                        if (loggedIn === false) {
                                this.buildLoginPage(baseError + "Invalid username or password given!</p>");
                                return;
                        }

                        // Correct login.
                        this.request.session.tries = 0;
                        this.request.session.username = userName;
                        this.request.session.email = email;
                        this.request.session.loggedin = true;

                        this.response.redirect('/my-files');
                })();
        }

        checkIfEmpty(strList) {

                for (var i = 0; i < strList.length; i++)
                        if (strList[i] === "" || strList[i].length === 0)
                                return true;
                return false;
        }

        inputValidation(stringList) {

                for (var i = 0; i < stringList.length; i++)
                {
                        var str = stringList[i];
                        if (str.indexOf("\"") != -1)
                                return true;
                        if (str.indexOf("'") != -1)
                                return true;
                        if (str.indexOf("\\") != -1)
                                return true;
                        if (str.indexOf('/') != -1)
                                return true;
                        if (str.indexOf(";") != -1)
                                return true;
                        if (str.indexOf("`") != -1)
                                return true;
                        if (str.indexOf("~") != -1)
                                return true;
                        if (str.indexOf("<") != -1)
                                return true;
                        if (str.indexOf(">") != -1)
                                return true;
                }

                return false;
        }

        checkIfAlreadyExists(value, field) {

                return new Promise ((resolve, reject) => {
                        
                        pool.getConnection(function(err, connection) {

                                // Check if fields already exist in database.
                                connection.query(
                                "SELECT EXISTS (SELECT * FROM UserAccounts "+
                                "WHERE " + field + " = '" + value + "') as result;",
                                (err, result) => {
                                        connection.release();

                                        if (result.length === 0) {
                                                console.log("result is empty")
                                                return resolve("ERROR result is empty!");
                                        }

                                        return err ? reject(err) : resolve(result[0].result);
                                });
                        });
                });
        }

        /*
                Adds information from the user to the database. part 1
        */
        createNewAccount(userName, firstName, lastName, email) {
                return new Promise ((resolve, reject) => {

                        pool.getConnection(function (err, connection) {

                                // Add information of the user to the database.
                                connection.query("INSERT INTO UserAccounts VALUES ('" + 
                                firstName + "','" + lastName + "','" + userName + "','" + email + "', NOW());",
                                (err, result) => {

                                        connection.release();
                                        if (err) {
                                                console.log("Error occured: " + err);
                                                return reject(false);
                                        }
                                        return resolve(true);
                                });
                        });
                });
        }

        /*
                Adds information from the user to the database. part 2
        */
        createNewAccount2(email, password) {
                return new Promise((resolve, reject) => {
                        pool.getConnection(function(err, connection) {

                                // Generate a salt
                                var salt = crypto.randomBytes(16).toString('hex');

                                // Create a hashed password with the salt.
                                var hash = crypto.createHash('md5').update(salt + password + salt).digest('hex');

                                // Add the hash and salt to database.
                                connection.query("INSERT INTO UserCredentials VALUES ('" + 
                                        email + "','" + hash + "','" + salt + "');",
                                        (err, result) => {
                                        connection.release();

                                        if (err) {
                                                console.log("Error occured: " + err);
                                                return reject(false);
                                        }

                                        return resolve(true);
                                });
                        });
                });
        }

        /*
                Get the email-address from username.
        */
        getEmailFromUsername(userName) {
                return new Promise((resolve, reject) => {
                        pool.getConnection(function(err, connection) {
                                connection.query(
                                "SELECT emailAddress as result FROM UserAccounts WHERE userName = '" + userName + "';"
                                , (err, data) => {
                                        connection.release();

                                        if (data.length === 0) {
                                                return resolve("ERROR result is empty!");
                                        }

                                        return err ? reject("ERROR " + err) : resolve(data[0].result);  
                                });
                        });
                });
        }

        getSaltFromEmail(email) {
                return new Promise((resolve, reject) => {
                        pool.getConnection(function(err, connection) {
                                connection.query(
                                "SELECT salt as result FROM UserCredentials WHERE emailAddress = '" + email + "';",
                                 (err, data) => {
                                        connection.release();

                                        if (data.length === 0) {
                                                return resolve("ERROR result is empty!");
                                        }
                                        return err ? reject("ERROR " + err) : resolve(data[0].result);
                                });
                        });
                });
        }

        checkCredentials(email, salt, password) {

                // Hash the password.
                var hashedPassword = crypto.createHash('md5').update(salt + password + salt).digest('hex');

                return new Promise((resolve, reject) => {
                        pool.getConnection(function(err, connection) {
                                connection.query(
                                "SELECT hashedPassword as result FROM UserCredentials WHERE emailAddress = '" + 
                                email + "' AND salt = '" + salt + "';", (err, data) => {
                                        connection.release();

                                        if (data.length === 0) {
                                                return resolve(false);
                                        }

                                        if (data[0].result.toString() === hashedPassword.toString())
                                                return resolve(true);
                                        else
                                                return resolve(false);
                                });
                        });
                });
        }
}

module.exports = accountHandler;