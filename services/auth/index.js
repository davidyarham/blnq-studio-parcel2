const { Router } = require('express');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const { sign, verify } = require('jsonwebtoken');
const { sendPasswordResetMail, sendMail } = require('../blnq-mailer');
const { pool } = require('../db');
const { checkAuthenticated } = require('./middleware');
//const passwordResetTpl = require('./tpl/password-reset');

const SALT_ROUNDS = 10;

const auth = Router();

// get user based on email - e.g when checking if registered already
const getUserByEmail = async (email) =>
    new Promise(async (resolve, reject) => {
        try {
            const result = await pool.query(
                'select id, displayname, email, password from users where email = $1',
                [email]
            );
            if (result.rows.length === 1) {
                resolve({ ok: -1, user: result.rows[0] });
            } else {
                resolve({ ok: 0 });
            }
        } catch (e) {
            resolve({ ok: 0, error: e });
        }
    });

// get user by id -  e.g. from the jwt token
const getUserById = async (id) =>
    new Promise(async (resolve, reject) => {
        try {
            const result = await pool.query(
                'select id, displayname, email, password, verificationkey from users where id = $1',
                [id]
            );
            if (result.rows.length === 1) {
                resolve({ ok: -1, user: result.rows[0] });
            } else {
                resolve({
                    ok: 0,
                    user: { displayname: null, email: null, password: null }
                });
            }
        } catch (e) {
            console.log('error finding user', e);
            resolve({ ok: 0, error: e });
        }
    });

const isRegistered = async (email) => {
    const result = await getUserByEmail(email);
    if (result.ok) {
        return Promise.reject('Email already registered');
    }
};

const comparePassword = async ({ user, password }) => {
    const match = await bcrypt.compare(password, user.password);
    return match;
};

const createUser = async ({ displayname, email, password }) =>
    new Promise((resolve, reject) => {
        pool.query(
            'INSERT into users(email, displayname, password) VALUES ($1,$2,$3)',
            [email, displayname, password]
        )
            .then((result) => {
                resolve(result);
            })
            .catch((e) => resolve({ error: e }));
    });

auth.get('/user', checkAuthenticated, async (req, res) => {
    const {
        ok,
        user: { displayname, email, id }
    } = await getUserById(req.user.subject);
    if (ok) {
        res.send({ ok, user: { id, displayname, email } });
    } else {
        //user not found
        res.status(403).send({
            ok: 0,
            error: 'Not authorized'
        });
    }
});

const LOGIN_ERROR_RESPONSE = {
    ok: 0,
    error: 'login-error',
    errors: { login: 'Login details incorrect' }
};

const signToken = (user, res) => {
    const token = sign(
        {
            subject: user.id,
            data: {
                displayname: user.displayname,
                id: user.id,
                email: user.email
            }
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 2592000000
    });
    return token;
};

const sendLoginError = (res) => res.status(401).send(LOGIN_ERROR_RESPONSE);

auth.post(
    '/login',
    [[check('email').isEmail(), check('password').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendLoginError(res);
        } else {
            const { email, password } = req.body;
            const { ok, user } = await getUserByEmail(email);
            if (ok) {
                const match = await comparePassword({ user, password });
                if (match) {
                    signToken(user, res);
                    res.send({ ok: 1 });
                } else {
                    sendLoginError(res);
                }
            } else {
                sendLoginError(res);
            }
        }
    }
);

// create a user
auth.post(
    '/user',
    [
        [
            // username must be an email
            check('email').isEmail().normalizeEmail().custom(isRegistered),
            check('displayname')
                //.isAlphanumeric()
                .isLength({ min: 3 })
                .withMessage(
                    'Please enter a username so we can give you props for your creations. At least 3 characters.'
                ),
            check('password')
                .isLength({ min: 8 })
                .withMessage('Password has to be at least 8 characters.')
        ]
    ],
    async (req, res) => {
        const { email, displayname } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const submissionErrors = errors.array().reduce((map, error) => {
                map[error.param] = error.msg;
                return map;
            }, {});
            return res
                .status(422)
                .json({
                    ok: 0,
                    error: 'validation-error',
                    errors: submissionErrors
                })
                .end();
        }
        const password = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        createUser({
            email,
            displayname,
            password
        })
            .then(async (result) => {
                const { ok, user } = await getUserByEmail(email);
                if (ok) {
                    signToken(user, res);
                }
                return res.send({ ok });
            })
            .then(async (res) => {
                //console.log('Create New User');
                sendMail({
                    to: ['lewis@blnq.co.uk', 'david@blnq.co.uk'],
                    subject: 'A new user signed up',
                    text: `${email} just signed up to blnq`
                });
                //console.log('Create New User Ended');
                return res;
            })
            .catch((err) => {
                console.log('Error creating user', err);
                return res
                    .status(500)
                    .json({ ok: 0, error: 'Something went wrong' })
                    .end();
            });
    }
);

auth.get('/logout/:context?/:blnqName?', (req, res) => {
    const { context, blnqName } = req.params;
    res.clearCookie('jwt');
    if (context && blnqName) {
        res.redirect(`/${context}/${blnqName}`);
    } else {
        res.redirect('/');
    }
});

const signPasswordResetToken = (user) => {
    const token = sign(
        {
            subject: user.id,
            data: {
                displayname: user.displayname,
                id: user.id,
                email: user.email
            }
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    return token;
};

const requestResetPassword = async (user) =>
    new Promise((resolve, reject) => {
        const verificationKey = signPasswordResetToken(user);
        pool.query('UPDATE users SET verificationkey = $2 where email = $1', [
            user.email,
            verificationKey
        ])
            .then((result) => {
                resolve(verificationKey);
            })
            .catch((e) => {
                resolve({ error: e });
            });
    });

auth.post('/password/request-reset', async (req, res) => {
    const { email } = req.body;
    const result = await getUserByEmail(email);

    if (result.ok) {
        const verificationKey = await requestResetPassword(result.user);
        //TODO - figure out a better way of doing these urls and mapping them when we use them in emails
        const url = `${req.protocol}://${req.hostname}${
            (process.env.NODE_ENV !== 'production' &&
                `:${req.app.locals.port}`) ||
            ``
        }/auth/password/reset/${
            result.user.id
        }/${verificationKey}?redirect=/login`;
        await sendPasswordResetMail({
            to: email,
            url
        });
    }
    res.redirect('/check-email');
});

auth.get('/password/reset/:id/:verificationkey', async (req, res) => {
    const { verificationkey, id } = req.params;
    try {
        const result = await getUserById(id);
        if (result.ok) {
            if (verificationkey === result.user.verificationkey) {
                const token = await verify(
                    verificationkey,
                    process.env.JWT_SECRET
                );
                //res.send(passwordResetTpl(result.user));
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    } catch (e) {
        res.redirect('/');
    }
});

const updateUserPassword = async ({ id, verificationkey, password }) =>
    new Promise((resolve, reject) => {
        pool.query(
            "UPDATE users SET password = $2, verificationkey = '' where id = $1 AND verificationkey = $3",
            [id, password, verificationkey]
        )
            .then((result) => {
                resolve();
            })
            .catch((e) => {
                reject({ error: e });
            });
    });

auth.post(
    '/password/reset',
    [
        [
            // username must be an email
            check('email').isEmail().normalizeEmail(),
            check('password')
                .isLength({ min: 8 })
                .withMessage('Password has to be at least 8 characters.')
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const submissionErrors = errors.array().reduce((map, error) => {
                map[error.param] = error.msg;
                return map;
            }, {});
            return res
                .status(422)
                .json({
                    ok: 0,
                    error: 'validation-error',
                    errors: submissionErrors
                })
                .end();
        }
        const { verificationkey, id, email } = req.body;
        const result = await getUserById(id);
        const token = verify(verificationkey, process.env.JWT_SECRET);
        if (
            token &&
            result.ok &&
            verificationkey === result.user.verificationkey
        ) {
            if (email === result.user.email) {
                const password = await bcrypt.hash(
                    req.body.password,
                    SALT_ROUNDS
                );
                await updateUserPassword({ id, verificationkey, password });
                res.send({ ok: -1 });
            }
        } else {
            //no user found return error
            return res.status(401).json({
                ok: 0,
                error: 'token-expired',
                errors: [
                    "Looks like this link has expired :( You'll need to submit a new password reset request to change your password."
                ]
            });
        }
    }
);

module.exports = auth;
