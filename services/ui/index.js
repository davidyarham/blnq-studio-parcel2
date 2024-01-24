const express = require('express');

const { isBlnq, getDisplayName } = require('../db');
const routes = (app) => {
    //this has to be the first route or it won't redirect
    app.get('/', (req, res) => {
        res.redirect('/dashboard'); //If root is navigated too go to dashboard
    });
    app.use('/', express.static('dist')); //Main Dir, where all teh CSS JS files etc live
    app.use('/e/:blnqName?', async (req, res, next) => {
        if (req.params.blnqName) {
            const exists = await isBlnq(req.params.blnqName);
            if (!exists) {
                res.redirect('/e');
            } else {
                next();
            }
        } else {
            next();
        }
    });
    app.get('/e/:blnqName?', async (req, res) => {
        var displayName = await getDisplayName(req.params.blnqName);
        if (typeof displayName !== 'undefined') {
            displayName = displayName.displayname;
        } else {
            displayName = 'An Untitled Masterpiece';
        }
        var blnqImage = req.params.blnqName
            ? 'https://studio.blnq.io/f/' + req.params.blnqName + '.png'
            : 'https://studio.blnq.io/icon-mobile@512w.png';
        res.render('dist/editor.html', {
            locals: { blnqImage: blnqImage, blnqDisplayName: displayName }
        });
    });
    app.use('/config', express.static('config')); //Config Dir
    app.use('/blnqs', express.static('blnqs')); //Blnq Dir, used for images on dashboard
    app.use('/manifest', express.static('assets/manifest'));
    app.use('/files', express.static('files'));
    app.use('/assets', express.static('assets'));
    app.use('/video', express.static('videos'));
    app.use('/login', express.static('dist/login.html'));
    app.use('/signup', express.static('dist/signup.html'));
    app.use('/legal', express.static('dist/legal.html'));
    app.use('/node_modules', express.static('node_modules')); //node_modules
    app.use('/dashboard', express.static('dist/dashboard.html')); //Show Dashboard
    app.use('/secret', express.static('dist/secret.html'));
    app.use('/mydashboard', express.static('dist/mydashboard.html'));
    //Password reset routes
    app.use('/check-email', express.static('dist/check-email.html'));
    app.use(
        '/password-reset-request',
        express.static('dist/password-reset-request.html')
    );

    app.use('/404', express.static('dist/404.html'));
};

module.exports = routes;
