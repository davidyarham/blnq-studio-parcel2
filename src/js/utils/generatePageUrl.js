import defaultConfig from '../../../config/default';
import transform from './babel-config';

export const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type });
    return URL.createObjectURL(blob);
};

const state = {
    css: null,
    data: null,
    js: null
};

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

function revokePreviousGen(state) {
    Object.keys(state).forEach((key) => window.URL.revokeObjectURL(state[key]));
}

const generatePageURL = ({
    html,
    css = '',
    js = '',
    library,
    files,
    json,
    blnqName,
    module
}) => {
    revokePreviousGen(state);

    const dataURL = (state.data = getBlobURL(json, 'text/json'));

    //TODO: HACKED TOGETHER SO I CAN PLAY WITH LESS FOR NOW, SEE JS LIBS I DIDNT KNOW HOW TO INCLUDE...
    //localStorage.setItem('enable-LESS', true);
    /*if (localStorage.getItem('enable-LESS') !== null) {
        document.querySelector('[data-show="CSS"]').innerHTML = 'LESS';
        less.render(css, {}, function(error, output) {
            if (error) {
                console.log('LESS COMPILATION ERROR:', error.message);
            } else {
                css = output.css;
            }
        });
    }*/

    const cssURL = (state.css = getBlobURL(css, 'text/css'));
    const filenamePattern = new RegExp(
        `("|')(\/f\/${blnqName}.json)("|')`,
        'g'
    );

    let loopSafeCode;

    try {
        loopSafeCode = transform(js);
    } catch (e) {
        loopSafeCode = js;
    }
    const jsURL = (state.js = getBlobURL(
        loopSafeCode.replace(filenamePattern, `$1${dataURL}$3`),
        'text/javascript'
    ));
    var headFiles = '';

    if (!!library) {
        const activeLibrary = defaultConfig.libraries.find(
            (lib) => lib.id === library
        );

        if (typeof activeLibrary !== 'undefined') {
            const libraryFiles = activeLibrary.files;
            for (var i = 0; i < libraryFiles.length; i++) {
                //THIS SUCKS... CHECKS IF ANY OF THE HEADFILES IN THE LIBRARY GO TO AN ABSOLUTE URL IF SO THEN DONT ADD THE LOCAL ORIGIN
                var localOrigin = window.location.origin;
                if (
                    libraryFiles[i].indexOf('https://') !== -1 ||
                    libraryFiles[i].indexOf('http://') !== -1 ||
                    libraryFiles[i].indexOf('//') !== -1
                ) {
                    localOrigin = '';
                }
                headFiles += generateHeadFile(localOrigin + libraryFiles[i]);
            }
        }
    }

    if (files) {
        for (var i = 0; i < files.length; i++) {
            headFiles += generateHeadFile(files[i]);
        }
    }

    const source = `<html>
    <head>
    ${headFiles}
    ${
        css &&
        `<link rel="stylesheet" type="text/css" id="cssBlobStamp" href="${cssURL}" />`
    }
        ${
            document.querySelector('#showOutlines').checked
                ? `<style>*,*:before,*:after{outline:1px solid rgba(242, 49, 15, 0.66) !important}</style>`
                : ''
        }
        <script>
            (function() {
                parent.postMessage('clearconsole','*');
                const origLog = console.log;
                console.log = function() {
                    origLog.apply(console,arguments);
                    const newArguments = JSON.parse(JSON.stringify(arguments));
                    parent.postMessage({type:'log',message:newArguments},'*');
                };
                const origInfo = console.info;
                console.info = function() {
                    origInfo.apply(console,arguments);
                    const newArguments = JSON.parse(JSON.stringify(arguments));
                    parent.postMessage({type:'info',message:newArguments},'*');
                };
                const origWarn = console.warn;
                console.warn = function() {
                    origWarn.apply(console,arguments);
                    const newArguments = JSON.parse(JSON.stringify(arguments));
                    parent.postMessage({type:'warn',message:newArguments},'*');
                };
                const origError = console.error;
                console.error = function() {
                    origError.apply(console,arguments);
                    const newArguments = JSON.parse(JSON.stringify(arguments));
                    parent.postMessage({type:'error',message:newArguments},'*');
                };
                window.onerror = function(message,file,line) {
                    const newMessage = JSON.parse(JSON.stringify(message));
                    parent.postMessage({type:'error',message:newMessage,line:line},'*');
                };
                /*NOT SUPPORTED YET*/
                const origTable = console.table;
                console.table = function() {
                    origTable.apply(console,arguments);
                    const newArguments = JSON.parse(JSON.stringify(arguments));
                    parent.postMessage({type:'error',message:'console.table not supported'},'*');
                };
            })();
        </script>
    </head>
    <body>
    ${html || ''}
    ${js && `<script ${module && 'type="module"'} src="${jsURL}"></script>`}
</body>
</html>
    `;

    return getBlobURL(source, 'text/html');
};

export default generatePageURL;
