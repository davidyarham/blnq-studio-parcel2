const consoleEl = document.querySelector('#console');
const consoleBody = consoleEl.querySelector('.console__body');
const toggleConsole = consoleEl.querySelector('#toggleConsole');
var maxConsoleItems = 100;
const removeOlderConsoles = function () {
    var logs = consoleBody.querySelectorAll('.console__item');
    if (logs.length > maxConsoleItems) {
        consoleBody.querySelectorAll('.console__item')[0].remove();
    }
};

const addToConsole = function (message, type, line) {
    var consoleItem = document.createElement('div');
    consoleItem.classList.add('console__item');
    consoleItem.classList.add(type);
    consoleItem.innerHTML = `<div class="console__message"></div>`;
    if (typeof message === 'string') {
        var el = document.createElement('div');
        consoleItem.querySelector('.console__message').appendChild(el);
        el.innerHTML = message;
    } else {
        for (var m in message) {
            var messageItem = message[m];
            var el = document.createElement('div');
            el.classList.add('console-type--' + typeof messageItem);
            consoleItem.querySelector('.console__message').appendChild(el);
            if (typeof messageItem === 'object') {
                el.innerHTML = JSON.stringify(messageItem);
            } else {
                el.innerHTML = messageItem;
            }
        }
    }
    if (typeof line !== 'undefined') {
        var lineEl = document.createElement('div');
        lineEl.classList.add('console__linecol');
        lineEl.innerHTML = `Line:${line}`;
        consoleItem.appendChild(lineEl);
    }

    consoleBody.append(consoleItem);
    if (
        consoleBody.scrollHeight -
            consoleBody.offsetHeight -
            consoleBody.scrollTop <
        50
    ) {
        consoleBody.scrollTo(0, consoleBody.scrollHeight);
    }
    removeOlderConsoles();
};

function receiveMessage(event) {
    if (typeof event.data.type !== 'undefined') {
        addToConsole(
            event.data.message,
            event.data.type,
            event.data.line,
            event.data.col
        );
    }

    if (event.data === 'clearconsole') {
        consoleBody.innerHTML = '';
    }
}
export default () => {
    consoleBody.innerHTML = '';
    window.addEventListener('message', receiveMessage, false);
    toggleConsole.addEventListener('click', () => {
        consoleEl.classList.toggle('show');
        localStorage.setItem(
            'pref-console',
            consoleEl.classList.contains('show')
        );
        if (consoleEl.classList.contains('show')) {
            consoleBody.scrollTo(0, consoleBody.scrollHeight);
        }
        setTimeout(function () {
            window.dispatchEvent(new Event('resize'));
        }, 275);
    });

    const consolePref = localStorage.getItem('pref-console');
    if (consolePref !== null) {
        var pref = localStorage.getItem('pref-console');
        if (JSON.parse(pref)) {
            consoleEl.classList.add('show');
        }
    }
};

/*
const consoleEl = parent.document.querySelector('.console');
            consoleEl.classList.add('show');
            consoleEl.innerHTML='';
            
            const addToConsole = function(message,type,file,line,col){
                var consoleItem = document.createElement('div');
                consoleItem.classList.add('console__item');
                consoleItem.classList.add(type);
                consoleItem.innerHTML = message;

                if(typeof line !=='undefined'){
                    consoleItem.innerHTML = consoleItem.innerHTML + ' ' + line + ':' + col;
                }

                consoleEl.append(consoleItem);
                parent.window.dispatchEvent(new Event('resize'));

                if(consoleEl.scrollHeight - consoleEl.offsetHeight - consoleEl.scrollTop < 20){
                    consoleEl.scrollTo(0,consoleEl.scrollHeight);
                }
                removeOlderConsoles(50);
            }
                
            const removeOlderConsoles = function(maxitems){
                var logs = consoleEl.querySelectorAll('.console__item');
                if(logs.length>maxitems){
                    consoleEl.querySelectorAll('.console__item')[0].remove();
                }
            }
            
            var oldLog = console.log;
            console.log = function(message) {
                //addToConsole(message,'log');
                parent.postMessage({type:'log',message:message},'*');
                oldLog.apply(console,arguments);
            };
            var oldWarn = console.warn;
            console.warn = function(message) {
                addToConsole(message,'warn');
                oldWarn.apply(console,arguments);
            };
            var oldError = console.error;
            console.error = function(message) {
                addToConsole(message,'error');
                oldError.apply(console,arguments);
            };
            
            window.onerror = function(message, file, line, col) {
                addToConsole(message,'error',file,line,col);
                removeOlderConsoles(50);
                parent.window.dispatchEvent(new Event('resize'));
            };
            
            */
