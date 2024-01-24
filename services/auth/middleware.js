const { verify } = require('jsonwebtoken');

const sendAuthFailure = (req, res) =>
    res.status(401).json({ ok: 0, error: 'Not Authorized' });

const checkAuthenticated = (req, res, next) => {
    const jwt = req.cookies.jwt;
    if (!jwt) {
        sendAuthFailure(req, res);
    } else {
        try {
            const user = verify(jwt, process.env.JWT_SECRET);
            if (user) {
                req.user = user;
                next();
            } else {
                sendAuthFailure(req, res);
            }
        } catch (e) {
            sendAuthFailure(req, res);
        }
    }
};
const optionallyAuthenticated = (req, res, next) => {
    const jwt = req.cookies.jwt;
    if (jwt) {
        try {
            const user = verify(jwt, process.env.JWT_SECRET);
            if (user) {
                req.user = user;
            }
        } catch (e) {
            //err
        } finally {
            return next();
        }
    } else {
        return next();
    }
};

module.exports = { checkAuthenticated, optionallyAuthenticated };
