const { Cluster } = require('puppeteer-cluster');

module.exports = (async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 2
    });
    await cluster.task(async ({ page, data: url }) => {
        // make a screenshot
        await page.setViewport({
            width: 800,
            height: 600
        });
        await page.goto(url, { waitUntil: 'load' });
        const screen = await page.screenshot();
        return screen;
    });

    const screenshot = async (url) =>
        new Promise(async (resolve, reject) => {
            try {
                const screen = await cluster.execute(url);
                // respond with image
                resolve(screen);
            } catch (err) {
                // catch error
                reject(err.message);
            }
        });
    return screenshot;
})();
