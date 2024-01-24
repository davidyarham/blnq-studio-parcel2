const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');

const getScores = async (req, blnqName) => {
    try {
        const protocol =
            process.env.NODE_ENV !== 'production' ? 'http' : 'https';

        const url = `${protocol}://${req.hostname}${
            (process.env.NODE_ENV !== 'production' &&
                `:${req.app.locals.port}`) ||
            ``
        }/v/${blnqName}`;

        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null
        });
        const { lhr } = await lighthouse(url, {
            port: new URL(browser.wsEndpoint()).port,
            onlyCategories: ['accessibility', 'performance', 'best-practices'],
            preset: 'desktop',
            output: 'json'
        });
        var scores = [];

        Object.keys(lhr.categories).forEach(function (key) {
            var obj = {};
            obj.category = key;
            obj.score = lhr.categories[key].score;
            scores.push(obj);
        });
        console.log(url, scores);
        await browser.close();
        return scores;
    } catch (e) {
        console.log(e);
        return [];
    }
};

module.exports = getScores;
