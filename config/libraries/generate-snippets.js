const fs = require('fs-extra');

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}
function getFiles(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file);
    });
}

const libs = getDirectories(__dirname);
libs.forEach((lib) => {
    if (lib !== '_OLD') {
        try {
            var data = {};
            //console.log(lib);
            const snippetsFolders = getDirectories(
                __dirname + '/' + lib + '/snippets'
            );
            snippetsFolders.forEach((snippetsFolder) => {
                data[snippetsFolder] = [];
                //console.log(lib + ':' + snippetsFolder);
                const snippetFiles = getFiles(
                    __dirname + '/' + lib + '/snippets/' + snippetsFolder
                );
                snippetFiles.forEach((snippetFile) => {
                    //console.log(lib + ':' + snippetsFolder + ':' + snippetFile);
                    var snippetContent = fs.readFileSync(
                        __dirname +
                            '/' +
                            lib +
                            '/snippets/' +
                            snippetsFolder +
                            '/' +
                            snippetFile,
                        'utf8'
                    );
                    var obj = {};
                    obj.label = snippetFile.replace('.snippet', '');
                    obj.insertText = snippetContent;
                    data[snippetsFolder].push(obj);
                });
            });

            fs.writeFileSync(
                __dirname + '/' + lib + '/snippets.json',
                JSON.stringify(data)
            );
            console.log(
                'Snippets File Generated: ' +
                    __dirname +
                    '/' +
                    lib +
                    '/snippets.json'
            );
            console.log(' ');
        } catch (e) {}
    }
});
