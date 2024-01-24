const path = require('path');
const crypto = require('crypto');
const fs = require('fs-extra');
const ssCluster = require('../puppeteer/screenshot-cluster');
const lhTest = require('../puppeteer/lighthouse');
const { sendMail } = require('../blnq-mailer');
const { sendSharerEmail } = require('../blnq-mailer');

const { Pool } = require('pg');

const pgName = process.env.PG_NAME;
const pgHost = process.env.PG_HOST;
const pgUser = process.env.PG_USER;
const pgPassword = process.env.PG_PWD;
const useSSL = process.env.PG_SSL;

function rando() {
    return crypto.randomBytes(3).toString('hex');
}

function diff(arr1, arr2) {
    return arr1.filter(function (val) {
        return !arr2.some(function (val2) {
            return val == val2;
        });
    });
}

const sslConfig = {
    ssl: {
        rejectUnauthorized: false
    }
};

const pgConfig = {
    database: pgName,
    host: pgHost,
    user: pgUser,
    password: pgPassword
};

const connectionPool = new Pool({
    ...pgConfig,
    ...(useSSL == 'true' && sslConfig)
});

const pool = {
    query: (text, params) => {
        const start = Date.now();
        return connectionPool
            .query(text, params)
            .then((result) => {
                const duration = Date.now() - start;
                // uncomment this if you want to log execution times
                // console.log(
                //     `Query: ${text} with parameters: ${params.join(
                //         ','
                //     )} took ${duration}ms `
                // );
                return result;
            })
            .catch((e) => {
                console.log(e);
                return e;
            });
    }
};

const doScreenshotAndHistory = async ({
    url,
    blnqName,
    updated,
    html,
    css,
    js,
    json,
    config,
    library,
    files
}) => {
    const screenshot = await ssCluster;
    const png = await screenshot(url);

    pool.query('UPDATE blnqs SET png = $2, updated = $3 WHERE name=$1', [
        blnqName,
        png,
        updated
    ]).then((result) => {
        pool.query(
            'INSERT INTO blnqs_history (name, html, css, js, json, png, config, updated, files, library) VALUES($1, $2, $3, $4, $5,$6,$7,$8,$9,$10)',
            [
                blnqName,
                html,
                css,
                js,
                json,
                png,
                config,
                updated,
                files,
                library
            ]
        );
    });
};

const doLighthouse = async (request, response) => {
    let { blnqName } = request.params;
    const getScores = await lhTest;
    const scores = await getScores(request, blnqName);
    if (scores.length !== 0) {
        pool.query('UPDATE blnqs SET lighthouse = $2 WHERE name=$1', [
            blnqName,
            scores
        ]);
    }
    response.send(scores);
};

//GET
const getSearch = async (request, response) => {
    //for now its super simple but need to convert to this..
    //https://www.compose.com/articles/mastering-postgresql-tools-full-text-search-and-phrase-search/

    const { searchString } = request.params;

    const result = await pool.query(
        `SELECT b.displayname, b.name, b.views, b.user_id, b.updated, u.displayname username FROM blnqs as b
        INNER JOIN users as u ON b.user_id = u.id
        WHERE (b.displayname ILIKE $1 
        OR u.displayName ILIKE $1)
        AND b.active = true AND b.ispublic = true
        ORDER BY b.updated desc, b.views desc, b.displayName, name LIMIT 50`,
        ['%' + searchString + '%']
    );

    response.send(result.rows);
};

const getDashboard = async (request, response) => {
    const dashboard = { top: [], latest: [] };
    //TOP
    var topResult = await pool.query(
        `SELECT
	b.displayname,
	b.name,
	b.views,
	b.user_id,
	b.updated,
	u.displayname username,
	b.views / EXTRACT(epoch FROM age(now(), TIMESTAMP 'epoch' + b.updated * INTERVAL '1 millisecond') / 3600) weight,
	age(now(), TIMESTAMP 'epoch' + b.updated * INTERVAL '1 millisecond')
	age
FROM
	blnqs AS b
	INNER JOIN users AS u ON b.user_id = u.id
WHERE
	b.views >= 0
	AND(((b.html <> '') IS TRUE)
	OR((b.css <> '') IS TRUE)
	OR((b.js <> '') IS TRUE))
	AND b.active = TRUE
    AND b.ispublic = TRUE
    AND b.displayname <>''
ORDER BY
	(b.views / EXTRACT(epoch FROM age(now(), TIMESTAMP 'epoch' + b.updated * INTERVAL '1 millisecond') / 3600))
	DESC,
	b.updated DESC,
	b.displayName,
	b.name
LIMIT 10`
    );
    dashboard.top = topResult.rows;

    //latest
    var latestResult = await pool.query(
        `SELECT
        b.displayname,
        b.name,
        b.views,
        b.user_id,
        b.updated,
        u.displayname username
    FROM
        blnqs AS b
        INNER JOIN users AS u ON b.user_id = u.id
    WHERE
        b.active = TRUE
        AND b.ispublic = TRUE
        AND b.displayname <>''
        AND(((b.html <> '') IS TRUE)
        OR((b.css <> '') IS TRUE)
        OR((b.js <> '') IS TRUE))
        AND name NOT IN(
            SELECT
                b.name FROM blnqs AS b
            WHERE
                b.views >= 0
                AND(((b.html <> '') IS TRUE)
            OR((b.css <> '') IS TRUE)
        OR((b.js <> '') IS TRUE))
    AND b.active = TRUE
    AND b.ispublic = TRUE
    ORDER BY
        (b.views / EXTRACT(epoch FROM age(now(), TIMESTAMP 'epoch' + b.updated * INTERVAL '1 millisecond') / 3600))
        DESC, b.updated DESC, b.displayName, b.name
    LIMIT 10)
    ORDER BY
        b.updated DESC,
        b.views DESC,
        b.displayName,
        name
    LIMIT 30
        `
    );
    dashboard.latest = latestResult.rows;

    response.send(dashboard);
};
const getSecret = async (request, response) => {
    //TODO: SImple to start with will extend later on with search etc...
    const dashboard = { top: [], latest: [] };

    //TOP
    var topResult = await pool.query(
        `SELECT
	b.displayname,
	b.name,
	b.views,
	b.user_id,
	b.updated,
	u.displayname username,
	b.views / EXTRACT(epoch FROM age(now(), TIMESTAMP 'epoch' + b.updated * INTERVAL '1 millisecond') / 3600) weight,
	age(now(), TIMESTAMP 'epoch' + b.updated * INTERVAL '1 millisecond')
	age
FROM
	blnqs AS b
	INNER JOIN users AS u ON b.user_id = u.id
ORDER BY
	(b.views / EXTRACT(epoch FROM age(now(), TIMESTAMP 'epoch' + b.updated * INTERVAL '1 millisecond') / 3600))
	DESC,
	b.updated DESC,
	b.displayName,
	b.name
LIMIT 10`
    );
    dashboard.top = topResult.rows;

    //latest
    var latestResult = await pool.query(
        `SELECT
        b.displayname,
        b.name,
        b.views,
        b.user_id,
        b.updated,
        u.displayname username
    FROM
        blnqs AS b
        INNER JOIN users AS u ON b.user_id = u.id
    WHERE
        b.active = TRUE
        AND name NOT IN(
            SELECT
                b.name FROM blnqs AS b
            WHERE
    b.active = TRUE
    ORDER BY
        (b.views / EXTRACT(epoch FROM age(now(), TIMESTAMP 'epoch' + b.updated * INTERVAL '1 millisecond') / 3600))
        DESC, b.updated DESC, b.displayName, b.name
    LIMIT 10)
    ORDER BY
        b.updated DESC,
        b.views DESC,
        b.displayName,
        name
    LIMIT 500
        `
    );
    dashboard.latest = latestResult.rows;

    response.send(dashboard);
};

const getMyDashboard = async (request, response) => {
    //TODO: SImple to start with will extend later on with search etc...

    const user = request.user;

    const dashboard = { my: [], shared: [] };

    //TOP
    if (typeof user !== 'undefined') {
        dashboard.id = user.data.id;
        var myResult = await pool.query(
            `SELECT b.displayname, b.name, b.views, b.user_id, b.updated, b.ispublic, u.displayname username FROM blnqs as b
        INNER JOIN users as u ON b.user_id = u.id
        WHERE b.active = true and b.user_id = $1 
        ORDER BY b.updated desc, b.displayName`,
            [user.data.id]
        );
        dashboard.my = myResult.rows;

        var sharedResult = await pool.query(
            `SELECT b.displayname, b.name, b.views, b.user_id, b.updated,b.ispublic, u.displayname username FROM blnqs as b
        INNER JOIN users as u ON b.user_id = u.id
        WHERE b.active = true and b.sharing::text ILIKE $1
        ORDER BY b.updated desc, b.displayName`,
            ['%' + user.data.email + '%']
        );
        dashboard.shared = sharedResult.rows;
    }

    response.send(dashboard);
};

const getBlnq = async (request, response) => {
    // i dont like that i've set the config to -1 as it evaluate to true but until we do proper config it works
    const { blnqName } = request.params;
    //console.log(blnqName);
    if (blnqName !== null) {
        increaseViews(blnqName);
    }
    let showSharingDetails = false;
    const user = request.user;
    if (user) {
        showSharingDetails = await isPermissioned(blnqName, user.data);
    }
    pool.query(
        `SELECT
        b.html,
        b.css,
        b.js,
        b.json,
        b.config,
        b.library,
        b.files,
        b.module,
        b.displayname,
        b.ispublic,
        b.sharing,
        b.lighthouse,
        u.id as userid,
        u.displayname as username
    FROM
        blnqs as b
        INNER JOIN users as u ON b.user_id = u.id
    WHERE
        name = $1`,
        [blnqName]
    ).then((result) => {
        if (result.rows.length === 1) {
            const data = result.rows[0];
            //if no permission to modify do not allow them to view sharing details
            if (!showSharingDetails) {
                delete data.sharing;
                delete data.ispublic;
                data.isPermissioned = false;
            } else {
                data.isPermissioned = true;
            }
            response.status(200).send({ ...data, hasBeenSaved: true });
        } else {
            //Need to send defaults back unless we detect in the UI
            response.status(200).send({
                html: '',
                css: '',
                js: '',
                json: '',
                config: -1,
                library: '',
                ispublic: true,
                module: false,
                files: [],
                sharing: [],
                isPermissioned: false
            });
        }
    });
};

const getSharingDetails = async (request, response = { send: () => {} }) =>
    new Promise(async (resolve) => {
        const { blnqName } = request.params;
        const user = request.user;
        let canModify = false;
        if (user) {
            canModify = await isPermissioned(blnqName, user.data);
        }
        if (canModify) {
            pool.query('SELECT ispublic, sharing FROM blnqs WHERE name = $1', [
                blnqName
            ]).then((result) => {
                const data = result.rows[0];
                response && response.send({ ...data, isPermissioned: true });
                resolve(data);
            });
        } else {
            const data = {
                sharing: [],
                isPermissioned: false,
                ispublic: false
            };
            response && response.send(data);
            resolve(data);
        }
    });

const getBlnqContent = async (blnqName) => {
    const result = await pool.query(
        'SELECT html, config, library, files, displayname, module FROM blnqs WHERE name = $1',
        [blnqName]
    );
    return result.rows[0];
};

const getFile = async (request, response) => {
    const { fileName } = request.params;
    const blnqName = path.parse(fileName).name;
    const ext = path.parse(fileName).ext.replace('.', '');

    if (ext.length > 0) {
        //NEED LITTLE BOBBY TABLES FIX HERE....
        const result = await pool.query(
            'SELECT updated, ' +
                ext +
                ' as data FROM blnqs WHERE name = $1 AND active=true',
            [blnqName]
        );
        //this was throwing for some reason added a check for result.rows
        if (result.rows && result.rows.length === 1) {
            var resultRow = result.rows[0];
            if (ext === 'html') {
                response.set('content-type', 'text/html');
            }
            if (ext === 'css') {
                response.set('content-type', 'text/css');
            }
            if (ext === 'js') {
                response.set('content-type', 'text/javascript');
            }
            if (ext === 'json') {
                response.set('content-type', 'application/json');
            }
            if (ext === 'png') {
                response.set('content-type', 'image/png');
            }
            response.status(200).send(resultRow.data);
        } else {
            response.sendStatus(404);
        }
    } else {
        response.sendStatus(404);
    }
    response.end();
};

const getAvatar = async (request, response) => {
    const { id } = request.params;
    const result = await pool.query('SELECT avatar FROM users WHERE id = $1', [
        id
    ]);
    if (result.rows && result.rows.length === 1) {
        var resultRow = result.rows[0];
        response.set('content-type', 'image/png');
        if (resultRow.avatar !== null) {
            response.status(200).send(resultRow.avatar);
        } else {
            var defaultAvatar = fs.readFileSync(
                __dirname + '/../../assets/images/default-avatar.png'
            );
            response.status(200).send(defaultAvatar);
        }
    } else {
        response.sendStatus(404);
    }
    response.end();
};

const updateProfile = async (request, response) => {
    var avatar = request.body.avatar;
    avatar = avatar.replace('data:image/png;base64,', '');
    pool.query("UPDATE users SET avatar = decode($2,'base64') WHERE id=$1", [
        request.user.data.id,
        avatar
    ]).then((result) => {
        response.status(200).send();
    });
};

const isBlnq = async (name) => {
    const result = await pool.query('select 1 from blnqs where name = $1', [
        name
    ]);
    return result.rows[0];
};

const getDisplayName = async (name) => {
    const result = await pool.query(
        'select displayname from blnqs where name = $1',
        [name]
    );
    return result.rows[0];
};

async function createNewBlnq() {
    let blnqName = rando();
    const exists = await isBlnq(blnqName);
    if (!exists) {
        sendMail({
            to: ['lewis@blnq.co.uk', 'david@blnq.co.uk'],
            subject: 'A new blnq emerges',
            text: `https://studio.blnq.io/e/${blnqName} has been created`
        });
        return blnqName;
    } else {
        return createNewBlnq();
    }
}

const getHistory = (request, response) => {
    const { blnqName } = request.params;
    pool.query(
        'SELECT updated FROM blnqs_history WHERE name = $1 ORDER BY updated desc LIMIT 200',
        [blnqName]
    ).then((result) => {
        var updatedArray = [];
        result.rows.forEach((row) => {
            updatedArray.push(row.updated);
        });
        response.status(200).send(updatedArray);
    });
};
/*Mat do get HistoryFile instead but for now...*/

const takeScreenshot = async (request, response) => {
    let { blnqName } = request.params;
    const url = `${request.protocol}://${request.hostname}${
        (process.env.NODE_ENV !== 'production' &&
            `:${request.app.locals.port}`) ||
        ``
    }/v/${blnqName}`;
    const screenshot = await ssCluster;
    const png = await screenshot(url);

    pool.query('UPDATE blnqs SET png = $2 WHERE name=$1', [blnqName, png]).then(
        (result) => {
            response.status(200).send('Screenshot Taken from ' + url);
        }
    );
};
const getHistoryImage = async (request, response) => {
    const { blnqName, timestamp } = request.params;

    if (typeof blnqName !== 'undefined' && typeof timestamp !== 'undefined') {
        const result = await pool.query(
            'SELECT png as data from blnqs_history WHERE name=$1 AND updated=$2',
            [blnqName, timestamp]
        );

        if (result.rows.length === 1) {
            var resultRow = result.rows[0];
            response.set('content-type', 'image/png');
            response.status(200).send(resultRow.data);
        } else {
            console.log('backup does not exist');
            response.sendStatus(404);
        }
    }
};

const revertHistory = async (request, response) => {
    const { blnqName, timestamp } = request.params;
    pool.query(
        'SELECT html,css,js,json,module FROM blnqs_history WHERE name = $1 and updated = $2',
        [blnqName, timestamp]
    ).then((result) => response.status(200).send(result.rows));
};

const sendAuthFailure = (response) =>
    response
        .status(403)
        .send({ ok: 0, error: 'User does not have permission to save' })
        .end();

// TODO - this method is getting a bit complicated probably needs a refactor at some point
const saveBlnq = async (request, response) => {
    let {
        blnqName,
        html,
        css,
        js,
        json,
        config,
        files,
        sharing,
        displayname,
        ispublic,
        library
    } = request.body;

    const updated = Date.now();
    const exists = blnqName && (await isBlnq(blnqName));
    if (!request.user) {
        return sendAuthFailure(response);
    }

    let user_id = request.user.subject;

    if (!exists) {
        //There is no blnq - create one but don't save it yet
        blnqName = await createNewBlnq();
    } else {
        const result = await isPermissioned(blnqName, request.user.data);

        if (!result) {
            return sendAuthFailure(response);
        } else {
            user_id = result.user_id;
        }
    }

    const url = `${request.protocol}://${request.hostname}${
        (process.env.NODE_ENV !== 'production' &&
            `:${request.app.locals.port}`) ||
        ``
    }/v/${blnqName}`;

    const emailUrl = `${request.protocol}://${request.hostname}${
        (process.env.NODE_ENV !== 'production' &&
            `:${request.app.locals.port}`) ||
        ``
    }/e/${blnqName}`;

    const currentSharingDetails = await getSharingDetails({
        params: { blnqName },
        user: request.user
    });

    const newCollaborators = diff(sharing, currentSharingDetails.sharing);

    newCollaborators.length &&
        sendSharerEmail({
            to: newCollaborators,
            url: emailUrl,
            user: request.user.data.displayname
        });

    pool.query(
        `INSERT INTO blnqs (name, html, css, js, json, config, updated, files, displayname, user_id, sharing, ispublic, library) VALUES($1, $2, $3, $4, $5, $6, $7, $8,$9, $10, $11, $12, $13) 
        ON CONFLICT (NAME) 
        DO UPDATE SET (html, css, js, json, config, updated, files, displayname, user_id, sharing, ispublic, library) = ($2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
            blnqName,
            html,
            css,
            js,
            json,
            config,
            updated,
            files,
            displayname,
            user_id,
            sharing,
            ispublic,
            library
        ]
    )
        .then((result) => {
            response.send({ blnqName }).end();
        })
        .catch((e) => response.sendStatus(500).end());

    doScreenshotAndHistory({
        url,
        blnqName,
        updated,
        html,
        css,
        js,
        json,
        config,
        library,
        updated,
        files
    });
};
// need to fix this it only works if we can guarantee user id is always > than 0
//
const isPermissioned = async (name, user) => {
    const result = await pool.query(
        'Select user_id from blnqs where name = $1 AND (user_id = $2 OR $3 = ANY(sharing))',
        [name, user.id, user.email]
    );
    return result.rows[0];
};

const deleteBlnq = async (request, response) => {
    let user_id = request.user.subject;
    let blnqName = request.params.blnqName;
    const result = await pool.query(
        'UPDATE blnqs set active = false WHERE name = $1 AND user_id=$2',
        [blnqName, user_id]
    );
    var data = {
        ok: 0,
        error:
            'You do not have permission to delete this blnq. only the owner of this blnq has the ability to delete'
    };
    if (result.rowCount > 0) {
        data = { ok: 1 };
    }
    response.status(200).send(data).end();
};

const batchDelete = async (request, response) => {
    let user_id = request.user.subject;
    let blnqNames = request.body.blnqNames;
    const result = await pool.query(
        'UPDATE blnqs set active = false WHERE name = ANY ($1)  AND user_id=$2',
        [blnqNames, user_id]
    );
    var data = {
        ok: 0,
        error:
            'You do not have permission to delete one or more of the selected blnqs.'
    };
    if (blnqNames.length && result.rowCount === blnqNames.length) {
        data = { ok: 1 };
    }
    response.status(200).send(data).end();
};

const increaseViews = (name) => {
    const result = pool.query(
        'UPDATE blnqs set views = views + 1 WHERE active=true AND ispublic=true AND name = $1',
        [name]
    );
};

module.exports = {
    getDashboard,
    getSecret,
    getMyDashboard,
    getSearch,
    getBlnq,
    saveBlnq,
    isBlnq,
    getDisplayName,
    getSharingDetails,
    getBlnqContent,
    increaseViews,
    getFile,
    getAvatar,
    getHistory,
    getHistoryImage,
    revertHistory,
    isPermissioned,
    deleteBlnq,
    batchDelete,
    pool,
    takeScreenshot,
    updateProfile,
    doLighthouse
};
