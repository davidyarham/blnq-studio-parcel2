console.log('Running Server.js');

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const apiRoutes = require('./services/api');
const uiRoutes = require('./services/ui');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || '8080';
const es6Renderer = require('express-es6-template-engine');

const csrfMiddleware = csurf({
    cookie: true
});

(async () => {
    if (process.env.NODE_ENV !== 'production') {
        await require('./build.js');
    }
    const auth = require('./services/auth');

    app.use(helmet());
    app.use(cookieParser());

    app.use(bodyParser.json({ limit: '2mb' }));
    app.use(bodyParser.urlencoded({ extended: true }));

    app.engine('html', es6Renderer);
    app.set('views', './');
    app.set('view engine', 'html');

    apiRoutes(app);
    uiRoutes(app);
    app.use('/auth/', auth);

    app.use(csrfMiddleware);
    app.use(function (req, res, next) {
        res.redirect('/404');
        next();
    });

    app.locals.port = port;

    console.log(
        '\x1b[33m%s\x1b[0m',
        '----------------------------------------------------------------------------'
    );
    console.log('');
    console.log(
        '\x1b[33m%s\x1b[0m',
        'Blnq Studio will be available at http://localhost:' +
            port +
            ' once bundling completes'
    );
    console.log('');
    console.log(
        '\x1b[33m%s\x1b[0m',
        '----------------------------------------------------------------------------'
    );

    process.on('SIGINT', () => {
        process.exit();
    });

    process.on('SIGTERM', () => {
        process.exit();
    });
})();

module.exports = app;
