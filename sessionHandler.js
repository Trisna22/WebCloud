
var crypto = require('crypto');


class sessionHandler {

        createNewSessionID() {
                return crypto.randomBytes(32).toString('base64');
        }


}


module.exports = sessionHandler;