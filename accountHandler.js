var mysql = require('mysql');
const fs = require('fs');

var pool = mysql.createPool({
        host     : 'localhost',
        user     : 'user',
        connectionLimit: 5,
        password : 'Password123',
        database : 'WebCloudDB'
});

/*var pools = mysql.createPool({
        host: 'localhost',
        connectionLimit: 5,
        user: 'user',
        password: 'Password123',
        database: 'WebCloudDB'
});*/

class accountHandler {
        constructor(request, response) {
                this.request = request;
                this.response = response;
        }


        buildRegisterPage(message) {
                var html = fs.readFileSync('html/register.html').toString();
                html = html.replace('{{registerText}}', message);
                this.response.send(html);
        }

        registerNewAccount(userName, firstName, lastName,
                email, password, password2, agreeTerms, session) {
                var baseError = "<p style=\"color: red;\">";

                // Check if any inputbox is empty.
                if (this.checkIfEmpty(userName, firstName, lastName,
                        email, password, password2) === true)
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
                                        email, password);
                                if (result2 === false) {
                                        this.buildRegisterPage
                                        (baseError + 
                                        "Failed to create a new account!</p>");
                                }
                                else {
                                        this.buildRegisterPage
                                        ("<p style=\"color: green\">" +
                                        "Succesfully created an account!</p>");
                                }
                        }
                })();

                //return createNewAccount(userName, firstName, lastName, email, password);
        }

        checkIfEmpty(userName, firstName, lastName,
                email, password, password2) {

                if (userName === "" || firstName === "" || 
                        lastName === "" || email === "" || 
                        password === "" || password2 === "")
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

                                connection.query(
                                "SELECT EXISTS (SELECT * FROM UserAccounts "+
                                "WHERE " + field + " = '" + value + "') as result;",
                                (err, result) => {
                                        connection.release();
                                        return err ? reject(err) : resolve(result[0].result);
                                });
                        });
                });
        }

       createNewAccount(userName, firstName, lastName, email, password) {
                return new Promise ((resolve, reject) => {

                        pool.getConnection(function (err, connection) {

                                connection.query("INSERT INTO UserAccounts VALUES ('" + 
                                firstName + "','" + lastName + "','" + userName + "','" + email + "');",
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
}

module.exports = accountHandler;