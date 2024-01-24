console.log('Running Build.js');

require('dotenv').config();
//const Bundler = require('parcel-bundler');
const path = require('path');
const entryFiles = path.join(__dirname, './src/*.html');

const Parcel = require('@parcel/core');
const Bundler = require('@parcel/plugin');

var bundleOptions = {
    scopeHoist: false,
    sourceMap: true,
    sourceMaps: true
};
if (process.env.NODE_ENV === 'production') {
    bundleOptions = {
        scopeHoist: false,
        sourceMap: false,
        sourceMaps: false
    };
}

const bundler = new Parcel.Parcel({ entries: entryFiles });
/*bundler.addAssetType(
    'html',
    require.resolve('./scripts/ignoreHTMLTemplate.js')
);*/

module.exports = (async () => {
    //const bundle = await bundler.bundler();
    console.log('\x1b[33m%s\x1b[0m', 'Bundle Started');
    bundler.watch((err, buildEvent) => {
        //console.log(err, buildEvent);
        if (buildEvent.type === 'buildSuccess') {
            console.log('\x1b[33m%s\x1b[0m', 'Bundler Complete');
        }
        if (buildEvent.type === 'buildFailure') {
            console.log('You Fooked up');
        }
    });
    const bundle = new Bundler.Bundler();

    process.env.NODE_ENV === 'production' && process.exit();
    process.on('SIGINT', () => {
        process.exit();
    });

    process.on('SIGTERM', () => {
        process.exit();
    });
    return bundle;
})();
