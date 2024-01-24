const path = require('path');
const fs = require('fs-extra');
const { Router } = require('express');

const librariesDir = path.resolve(process.cwd(), './config/libraries');
const defaultConfig = require('../../config/default');
const {
    checkAuthenticated,
    optionallyAuthenticated
} = require('../auth/middleware');

const db = require('../db');
/*PG STUFF*/

function generateHeadFile(file) {
    if (file !== '') {
        var headFile = '';
        if (file.substr(file.length - 4).toLowerCase() === '.css') {
            headFile =
                '<link rel="stylesheet" type="text/css" href="' + file + '" />';
        }
        if (file.substr(file.length - 3).toLowerCase() === '.js') {
            headFile = '<script src="' + file + '"></script>';
        }
        return headFile;
    } else {
        return '';
    }
}

const lighthouse = require('lighthouse');
//const ReportGenerator = require('lighthouse/lighthouse-core/report/report-generator');
const ReportGenerator = require('lighthouse/report/generator/report-generator');
const puppeteer = require('puppeteer');

const routes = (app) => {
    app.get('/v/:blnqName', async function (req, res) {
        const protocol =
            process.env.NODE_ENV !== 'production' ? 'http' : 'https';
        const url = protocol + '://' + req.headers.host;
        const { blnqName } = req.params;
        const response = await db.getBlnqContent(blnqName);
        if (typeof response === 'undefined') {
            res.redirect('/404');
        } else {
            const { html, files, displayname, library, module } = response;
            let headFiles = '';

            if (!!library) {
                const libraryFiles = defaultConfig.libraries.find(
                    (lib) => lib.id === library
                ).files;
                for (var i = 0; i < libraryFiles.length; i++) {
                    //THIS SUCKS... CHECKS IF ANY OF THE HEADFILES IN THE LIBRARY GO TO AN ABSOLUTE URL IF SO THEN DONT ADD THE LOCAL ORIGIN
                    let localOrigin = `//${req.hostname}${
                        (process.env.NODE_ENV !== 'production' &&
                            `:${req.app.locals.port}`) ||
                        ``
                    }`;
                    if (
                        libraryFiles[i].indexOf('https://') !== -1 ||
                        libraryFiles[i].indexOf('http://') !== -1 ||
                        libraryFiles[i].indexOf('//') !== -1
                    ) {
                        localOrigin = '';
                    }
                    headFiles += generateHeadFile(
                        localOrigin + libraryFiles[i]
                    );
                }
            }
            if (files) {
                for (var i = 0; i < files.length; i++) {
                    headFiles += generateHeadFile(files[i]);
                }
            }

            res.send(`<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Blnq Studio: ${blnqName}${
                displayname && ` - ${displayname}`
            }</title>
        ${headFiles}
        <link rel="stylesheet" type="text/css" href="/f/${blnqName}.css"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Blnqco" />
        <meta name="twitter:title" content="${
            displayname ? displayname : 'An Untitled Masterpiece'
        }" />
        <meta
            name="twitter:description"
            content="Blnq Studio - Code using HTML, CSS and JavaScript anywhere."
        />
        <meta name="twitter:image" content="${url}/f/${blnqName}.png" />
        <meta property="og:image" content="${url}/f/${blnqName}.png" itemprop="thumbnailUrl" />
        <meta property="og:title" content="${
            displayname ? displayname : 'An Untitled Masterpiece'
        }" />
        <meta property="og:url" content="${url}" />
        <meta property="og:site_name" content="Blnq Studio" />
        <meta
            property="og:description"
            content="Blnq Studio - Code using HTML, CSS and JavaScript anywhere."
        />
	</head>
	<body>
		${html}
		<script ${module && 'type="module"'} src="/f/${blnqName}.js"></script>
	</body>
</html>`);
        }
    });

    app.get('/p/:blnqName', async function (req, res) {
        const { blnqName } = req.params;
        const response = await db.getBlnqContent(blnqName);
        if (typeof response === 'undefined') {
            res.redirect('/404');
        } else {
            const { html, files, displayname, library, module } = response;
            let headFiles = '';

            if (!!library) {
                const libraryFiles = defaultConfig.libraries.find(
                    (lib) => lib.id === library
                ).files;
                for (var i = 0; i < libraryFiles.length; i++) {
                    //THIS SUCKS... CHECKS IF ANY OF THE HEADFILES IN THE LIBRARY GO TO AN ABSOLUTE URL IF SO THEN DONT ADD THE LOCAL ORIGIN
                    let localOrigin = `//${req.hostname}${
                        (process.env.NODE_ENV !== 'production' &&
                            `:${req.app.locals.port}`) ||
                        ``
                    }`;
                    if (
                        libraryFiles[i].indexOf('https://') !== -1 ||
                        libraryFiles[i].indexOf('http://') !== -1 ||
                        libraryFiles[i].indexOf('//') !== -1
                    ) {
                        localOrigin = '';
                    }
                    headFiles += generateHeadFile(
                        localOrigin + libraryFiles[i]
                    );
                }
            }
            if (files) {
                for (var i = 0; i < files.length; i++) {
                    headFiles += generateHeadFile(files[i]);
                }
            }

            res.send(`<!DOCTYPE html>
<html lang="en">
    <head>
    <title>Blnq Studio: ${blnqName}${displayname && ` - ${displayname}`}</title>
    <script>
    window.onerror=function(){return true;};
    window.console.log=function(){}
    window.console.warn=function(){}
    window.console.error=function(){}
    </script>
    ${headFiles}
    <link rel="stylesheet" type="text/css" href="/f/${blnqName}.css"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
	</head>
	<body>
        ${html}
        <script>(function () {
            window.onerror = function (/* message, file, line */) {
              return true;
            };
            if (
              typeof AudioContext != "undefined" ||
              typeof webkitAudioContext != "undefined"
            ) {
              AudioContext = function () {
                return false;
              };
              webkitAudioContext = function () {
                return false;
              };
            }
            if (typeof mozAudioContext != "undefined") {
              mozAudioContext = function () {
                return false;
              };
            }
            if ("speechSynthesis" in window) {
              window.speechSynthesis = {};
            }
            if ("speak" in speechSynthesis) {
              speechSynthesis.speak = function () {
                return false;
              };
            }
            navigator.getUserMedia = function () {};
            navigator.mozGetUserMedia = function () {};
            navigator.webkitGetUserMedia = function () {};
            navigator.mediaDevices.getUserMedia = function () {};
          })();
          </script>
		<script ${module && 'type="module"'}  src="/f/${blnqName}.js"></script>
	</body>
</html>`);
        }
    });

    app.get('/lh/:blnqName', async function (req, res) {
        const { blnqName } = req.params;
        (async () => {
            try {
                const protocol =
                    process.env.NODE_ENV !== 'production' ? 'http' : 'https';
                const url = `${protocol}://${req.headers.host}/v/${blnqName}`;

                const browser = await puppeteer.launch({
                    headless: true,
                    defaultViewport: null
                });
                const { lhr } = await lighthouse(url, {
                    port: new URL(browser.wsEndpoint()).port,
                    onlyCategories: [
                        'accessibility',
                        'performance',
                        'best-practices'
                    ],
                    preset: 'desktop',
                    output: 'json'
                });
                const html = ReportGenerator.generateReport(lhr, 'html');
                res.status(200).send(html);

                var scores = [];
                Object.keys(lhr.categories).forEach(function (key) {
                    var obj = {};
                    obj.category = key;
                    obj.score = lhr.categories[key].score;
                    scores.push(obj);
                });
                await browser.close();
            } catch (e) {
                res.status(200).send('Issue with lighthouse', e);
            }
        })();
    });

    app.get('/takeScreenshot/:blnqName', db.takeScreenshot);

    app.get('/f/:fileName', db.getFile);
    app.get('/avatar/:id', db.getAvatar);
    app.get('/hf/:blnqName/:timestamp', db.getHistoryImage);

    /* API */
    const api = Router();

    api.get('/dashboard/', db.getDashboard);
    api.get('/secret/', db.getSecret);

    api.post('/profile', checkAuthenticated, db.updateProfile);

    api.get('/mydashboard/', optionallyAuthenticated, db.getMyDashboard);
    api.get('/search/:searchString', db.getSearch);
    api.get('/history/:blnqName', db.getHistory);
    api.get('/history/revert/:blnqName/:timestamp', db.revertHistory);

    api.get('/lh/:blnqName', db.doLighthouse);

    api.get(
        '/user-can-modify/:blnqName',
        checkAuthenticated,
        async (req, res) => {
            const { blnqName } = req.params;
            const isPermissioned = await db.isPermissioned(
                blnqName,
                req.user.data
            );
            res.status(isPermissioned ? 200 : 403).send({
                ok: isPermissioned ? 1 : 0
            });
        }
    );

    api.get('/blnqs/:blnqName', optionallyAuthenticated, db.getBlnq);
    api.get(
        '/blnqs/:blnqName/sharing',
        optionallyAuthenticated,
        db.getSharingDetails
    );
    api.post('/blnqs', checkAuthenticated, db.saveBlnq);

    api.get('/delete/:blnqName', checkAuthenticated, db.deleteBlnq);
    api.post('/delete', checkAuthenticated, db.batchDelete);

    api.get('/health', (req, res) => res.status(200).end());

    api.get('/snippets/:library', (req, res) => {
        const { library } = req.params;
        const filepath = path.join(librariesDir, `/${library}/snippets.json`);
        if (fs.existsSync(filepath)) {
            const snippets = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
            res.status(200).json({
                ok: 1,
                snippets
            });
        } else {
            res.status(404).json({ ok: 0 });
        }
        res.end();
    });

    //not needed til we know what we are doing with config
    // api.get("/libraries/", db.getLibraries);
    app.use('/api/v1/', api);
};

module.exports = routes;
