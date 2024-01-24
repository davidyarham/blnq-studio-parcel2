import store, { dispatch } from '../../state/store';
import quotes from './quotes';

const blnqName = window.location.pathname.split('/')[2];

document.querySelector('.loader__info__text').innerHTML =
    quotes[Math.floor(Math.random() * Math.floor(quotes.length))];

document.querySelector('.loader__img').src =
    blnqName !== undefined ? `../f/${blnqName}.png` : '';

document.querySelector('.loader__img').addEventListener('load', showLoaderInfo);

function showLoaderInfo() {
    document.querySelector('.loader__info').classList.add('show');
}

async function load() {
    const response = await fetch('/api/v1/blnqs/' + blnqName);
    const blnq = await response.json();

    var forkData = localStorage.getItem('fork-data');
    if (forkData !== null) {
        forkData = JSON.parse(forkData);
        blnq.html = forkData.html;
        blnq.css = forkData.css;
        blnq.js = forkData.js;
        blnq.json = forkData.json;
        blnq.config = forkData.config;
        blnq.library = forkData.library;
        blnq.files = forkData.files;
        blnq.displayname = forkData.displayname;
        blnq.isPermissioned = true;
        store.state.isDirty = true;
        localStorage.removeItem('fork-data');
        dispatch('updateEditor');
    }
    if (blnqName) {
        blnq.blnqName = blnqName;
        document.querySelector(
            '#madeby'
        ).innerHTML = `<img src='/avatar/${blnq.userid}'/>${blnq.username}`;
    } else {
        /*blnq.html = '<div><div>1</div></div>';
        blnq.css = 'body{background:red}';
        blnq.js = "console.log('Hey')";
        blnq.json = '[{"name":"David","Age":47}]';*/
        blnq.isPermissioned = true; //Sets to show if its a brand new blnq
    }
    
    if (blnq.lighthouse) {
        var lighthouseJSON = blnq.lighthouse;
        lighthouseJSON = lighthouseJSON.replace(/\\/g, '');
        lighthouseJSON = lighthouseJSON.replace(/\}\"\,\"\{/g, '},{');
        lighthouseJSON = lighthouseJSON.substring(2, lighthouseJSON.length - 2);
        lighthouseJSON = '[' + lighthouseJSON + ']';

        lighthouseJSON = JSON.parse(lighthouseJSON);

        var lighthouseScoresButton = document.querySelector(
            '#lighthouseScoresButton'
        );

        if (lighthouseJSON.length > 0) {
            var scoreEls = lighthouseScoresButton.querySelectorAll('.score');

            for (var i = 0; i < scoreEls.length; i++) {
                var value = parseInt(lighthouseJSON[i].score * 100);
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
                    lighthouseJSON[0].score * 100
                )}%, Accessiblity: ${parseInt(
                    lighthouseJSON[1].score * 100
                )}%, Best Practices: ${parseInt(
                    lighthouseJSON[2].score * 100
                )}%`
            );

            lighthouseScoresButton.style.display = 'flex';
            lighthouseScoresButton.classList.remove('pulse');
        }
    }

    dispatch('loadBlnq', { ...blnq });
}

load();
