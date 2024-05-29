const jwt = require('jsonwebtoken');

const AuthKey = require('./../config/jwt');

function verifyJWT(req, res, next) {

    const bearerToken = req.headers['authorization'];

    if (typeof bearerToken !== 'undefined') {

        const bearer = bearerToken.split(" ");

        const token = bearer[1];

        jwt.verify(token, AuthKey.key, (err, result) => {

            if (err) {
                res.status(400).send({
                    message: "Error Found " + err.message,
                    status: false,
                    data: []
                });
            } else {
                req.user = result[0];
                req.userData = result;
                next();
            }
        });

    } else {
        res.send({
            message: "Invalid bearer token",
            status: false,
            data: []
        });
    }

}

module.exports = verifyJWT;