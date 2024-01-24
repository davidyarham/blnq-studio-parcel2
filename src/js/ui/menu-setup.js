import store, { subscribe } from '../state/store';
const dropdownTogglers = [...document.querySelectorAll('.dropdown__toggler')];

export default function dropdownSetup() {
    dropdownTogglers.forEach((dropdownToggler) => {
        dropdownToggler.addEventListener('click', (e) => {
            const current = e.currentTarget.parentNode;
            current.classList.toggle('open');
            document.body.addEventListener('click', (e) => {
                if (!current.contains(e.target)) {
                    current.classList.remove('open');
                }
            });
        });
    });
}

//do not abuse this... wildcard - fires on every event that changes state :)
subscribe('*', () => {
    [...document.querySelectorAll('.dropdown.open')].forEach((dd) =>
        dd.classList.remove('open')
    );
});

const saveButton = document.getElementById('saveButton');

const menuSaveButton = document.getElementById('menuSave');

const menuForkButton = document.getElementById('menuFork');
menuForkButton.addEventListener('click', function (e) {
    var r = confirm('Would you like to fork this Blnq?');
    if (r == true) {
        var forkData = {};
        forkData.html = store.state.html;
        forkData.css = store.state.css;
        forkData.js = store.state.js;
        forkData.json = store.state.json;
        forkData.library = store.state.library;
        forkData.files = store.state.files;
        forkData.displayname = store.state.displayname;
        localStorage.setItem('fork-data', JSON.stringify(forkData));

        window.location = '/e';
    }
});

const menuDeleteButton = document.getElementById('menuDelete');
menuDeleteButton.addEventListener('click', async () => {
    document
        .querySelectorAll('.dropdown.open')
        .forEach((dd) => dd.classList.remove('open'));
    var r = confirm('Would you like to delete this Blnq?');
    if (r == true) {
        const response = await fetch('/api/v1/delete/' + store.state.blnqName);
        const data = await response.json();
        if (data.ok === 1) {
            window.location = '/';
        } else {
            alert(data.error);
        }
    }
});

const lighthouseButton = document.getElementById('lighthouseButton');
lighthouseButton.addEventListener('click', () => {
    var url = document.querySelector('#openWithButton').getAttribute('href');
    window.open('/lh/' + url);
});

const lighthouseScoresButton = document.getElementById(
    'lighthouseScoresButton'
);
lighthouseScoresButton.addEventListener('click', () => {
    var url = document.querySelector('#openWithButton').getAttribute('href');
    window.open('/lh/' + url);
});

subscribe('updateDocument', () => {
    if (store.state.isDirty) {
        saveButton.removeAttribute('disabled');
        saveButton.classList.add('is-dirty');
        menuSaveButton.removeAttribute('disabled');
        [...document.querySelectorAll('.stale')].forEach((stale) =>
            stale.classList.add('on')
        );
    }
});
subscribe('updatePartialState', (state) => {
    if (state.isDirty) {
        saveButton.removeAttribute('disabled');
        saveButton.classList.add('is-dirty');
        menuSaveButton.removeAttribute('disabled');
        [...document.querySelectorAll('.stale')].forEach((stale) =>
            stale.classList.add('on')
        );
    }
});
subscribe('updateEditor', () => {
    saveButton.removeAttribute('disabled');
    saveButton.classList.add('is-dirty');
    menuSaveButton.removeAttribute('disabled');
    [...document.querySelectorAll('.stale')].forEach((stale) =>
        stale.classList.add('on')
    );
});

subscribe('setDirty', () => {
    saveButton.removeAttribute('disabled');
    saveButton.classList.add('is-dirty');
    menuSaveButton.removeAttribute('disabled');
    [...document.querySelectorAll('.stale')].forEach((stale) =>
        stale.classList.add('on')
    );
});

var lhDebounce;

subscribe('savedSuccess', () => {
    if (store.state.hasBeenSaved) {
        saveButton.setAttribute('disabled', true);
        saveButton.classList.remove('is-dirty');
        menuSaveButton.setAttribute('disabled', true);
        menuForkButton.removeAttribute('disabled');
        menuDeleteButton.removeAttribute('disabled');
        lighthouseButton.removeAttribute('disabled');
        [...document.querySelectorAll('.stale')].forEach((stale) =>
            stale.classList.remove('on')
        );
        clearTimeout(lhDebounce);
        lhDebounce = setTimeout(async () => {
            lighthouseScoresButton.classList.add('pulse');
            const response = await fetch('/api/v1/lh/' + store.state.blnqName);
            const data = await response.json();

            if (data.length > 0) {
                var scoreEls = lighthouseScoresButton.querySelectorAll(
                    '.score'
                );

                for (var i = 0; i < scoreEls.length; i++) {
                    var value = parseInt(data[i].score * 100);
                    var arc = value / 100;
                    var arcPct = 352 * arc;

                    scoreEls[i].querySelector('.value').innerHTML = value;
                    scoreEls[i].querySelector(
                        '.lh-gauge-arc'
                    ).style.strokeDasharray = `${arcPct}, 352`;
                    if (value <= 100) {
                        scoreEls[i].setAttribute('data-score', 'high');
                    }
                    if (value < 90) {
                        scoreEls[i].setAttribute('data-score', 'medium');
                    }
                    if (value < 50) {
                        scoreEls[i].setAttribute('data-score', 'low');
                    }
                }
                lighthouseScoresButton.setAttribute(
                    'title',
                    `Performance: ${parseInt(
                        data[0].score * 100
                    )}%, Accessiblity: ${parseInt(
                        data[1].score * 100
                    )}%, Best Practices: ${parseInt(data[2].score * 100)}%`
                );

                lighthouseScoresButton.style.display = 'flex';
                lighthouseScoresButton.classList.remove('pulse');
            }
        }, 1000);
    }
});
