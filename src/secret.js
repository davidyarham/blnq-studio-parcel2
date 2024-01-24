import './cc';
import userSetup from './js/ui/user-setup';
import { createLoginModal } from './js/ui/reactions/utils';
import { dispatch } from './js/state/store';

userSetup();

function LoggedIn() {
    userSetup();
}

document.querySelector('#login').addEventListener('click', function () {
    createLoginModal({
        done: LoggedIn
    });
});

function createCard(obj) {
    var card = document.createElement('a');
    card.setAttribute('data-id', `${obj.name}`);
    card.classList.add('dash__card');
    card.href = 'e/' + obj.name;
    card.setAttribute('rel', 'ugc');
    card.innerHTML = `
    <div class="card__images">
      <img aria-hidden="true" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiM0MDQ2NjIiIGQ9Ik0wIDBoMjQwdjE4MEgweiIvPjxnIG9wYWNpdHk9Ii4zMyIgZmlsbD0iIzFCMUUyQiI+PHBhdGggZD0iTTkzIDc5LjMzNEw5OS4yMjIgNzNsMTguNjY1IDE5LTE4LjY2NSAxOUw5MyAxMDQuNjY2IDEwNS40NDMgOTIgOTMgNzkuMzM0ek0xNDcuNzUyIDc5LjMzNEwxNDEuNTI5IDczbC0xOC42NjUgMTkgMTguNjY1IDE5IDYuMjIzLTYuMzM0TDEzNS4zMDggOTJsMTIuNDQ0LTEyLjY2NnoiLz48L2c+PC9nPjwvc3ZnPg==" class="card__img--bg"/>
    </div>
    <div class="card__info">
    
    <img class="avatar-img" src="/avatar/${
        obj.user_id
    }" onload="this.style.display='block'"/>
    
    <div class="flex">  
        <div class="card__name">${
            obj.displayname != '' ? obj.displayname : 'An Untitled Masterpiece'
        }</div>
        <div class="card__author">${obj.username}</div>
    </div>
    
    <div class="card__meta">
        <div class="card__views">
            <svg width="16" height="10">
                <g fill="none" fill-rule="evenodd">
                    <path d="M0-3h16v16H0z"></path>
                    <path d="M8 0C4.667 0 1.82 2.073.667 5c1.153 2.927 4 5 7.333 5s6.18-2.073 7.333-5c-1.153-2.927-4-5-7.333-5zm0 8.333a3.335 3.335 0 0 1 0-6.666 3.335 3.335 0 0 1 0 6.666zM8 3c-1.107 0-2 .893-2 2s.893 2 2 2 2-.893 2-2-.893-2-2-2z" class="fill"></path>
                </g>
            </svg>
            <span>${obj.views}</span>
        </div>
        <div class="card__updated">
            <svg width="16" height="24" viewBox="0 0 24 24">
                <path class="fill" d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>
            <span>${time2TimeAgo(obj.updated)}</span>
        </div>
      </div>
    </div>`;
    var img = document.createElement('img');
    img.setAttribute('alt', '');
    img.src = `f/${obj.name}.png`;
    img.classList.add('card__img');

    img.setAttribute('loading', 'lazy');
    card.querySelector('.card__images').append(img);

    card.addEventListener('mouseenter', (e) => {
        var blnqName = e.currentTarget.getAttribute('data-id');
        try {
            var iframes = document.querySelectorAll('.card__images iframe');
            if (iframes.length > 0) {
                [...iframes].forEach((iFrame) => {
                    iFrame.remove();
                });
            }
        } catch (e) {}

        var iframe = document.createElement('iframe');
        iframe.src = `p/${blnqName}`;
        iframe.setAttribute('scrolling', 'no');
        iframe.classList.add('card__iframe');
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute(
            'sandbox',
            'allow-scripts allow-pointer-lock allow-same-origin allow-presentation'
        );
        iframe.setAttribute('tabindex', '-1');
        iframe.addEventListener('load', (e) => {
            e.currentTarget.classList.add('show');
        });
        card.querySelector('.card__images').append(iframe);
    });
    card.addEventListener('mouseleave', () => {
        try {
            var iframes = document.querySelectorAll('.card__images iframe');
            if (iframes.length > 0) {
                [...iframes].forEach((iFrame) => {
                    iFrame.remove();
                });
            }
        } catch (e) {}
    });

    //card.querySelector('.card__images').append(iframe);

    return card;
}

var cardZIndex = 0;

function createCards(cardArray, el) {
    var el = document.querySelector(el);
    cardArray.forEach((card) => {
        var newCard = createCard(card);
        el.append(newCard);
        newCard.addEventListener('mouseover', function (e) {
            cardZIndex = cardZIndex + 1;
            e.currentTarget.style.zIndex = cardZIndex;
        });
    });
}

function time2TimeAgo(someDateInThePast) {
    var result = '';
    var difference = Date.now() - someDateInThePast;

    if (difference < 59 * 1000) {
        return 'Just now';
    } else if (difference < 90 * 1000) {
        return 'Moments ago';
    }

    //it has minutes
    if ((difference % 1000) * 3600 > 0) {
        if (Math.floor((difference / 1000 / 60) % 60) > 0) {
            let s = Math.floor((difference / 1000 / 60) % 60) == 1 ? '' : 's';
            result = `${Math.floor((difference / 1000 / 60) % 60)} min${s} `;
        }
    }

    //it has hours
    if ((difference % 1000) * 3600 * 60 > 0) {
        if (Math.floor((difference / 1000 / 60 / 60) % 24) > 0) {
            let s =
                Math.floor((difference / 1000 / 60 / 60) % 24) == 1 ? '' : 's';
            result =
                `${Math.floor((difference / 1000 / 60 / 60) % 24)} hr${s}${
                    result == '' ? '' : ','
                } ` + result;
        }
    }

    //it has days
    if ((difference % 1000) * 3600 * 60 * 24 > 0) {
        if (Math.floor(difference / 1000 / 60 / 60 / 24) > 0) {
            if (Math.floor(difference / 1000 / 60 / 60 / 24) > 1) {
                result = `${Math.floor(
                    difference / 1000 / 60 / 60 / 24
                )} days `;
            }
        }
    }

    return result + 'ago';
}

async function loadDashboard() {
    const response = await fetch('/api/v1/secret/');
    const dashboard = await response.json();

    document.querySelector('#top').innerHTML = '';
    document.querySelector('#latest').innerHTML = '';
    createCards(dashboard.top, '#top');
    createCards(dashboard.latest, '#latest');
}

loadDashboard();

/*if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/blnq-sw.js').then(() => {});
    });
}*/

var searchDebounce;

document.querySelector('#search').addEventListener('input', (e) => {
    clearTimeout(searchDebounce);

    history.pushState(
        { page: 'dashboard' },
        'Blnq Studio',
        '?q=' + e.target.value
    );

    searchDebounce = setTimeout(function () {
        search();
    }, 500);
});

function search() {
    var searchString = document.querySelector('#search').value;
    if (searchString === '') {
        document.querySelector('.search-holder').classList.remove('show');
        document.querySelector('#searchResults').innerHTML = '';
    } else {
        loadSearch();
    }
}

async function loadSearch() {
    var searchString = document.querySelector('#search').value;
    document.querySelector('.search-holder h2').innerHTML =
        'Results for "' + searchString + '"';
    document.querySelector('.search-holder').classList.add('show');
    document.querySelector('#searchResults').innerHTML = '';
    const response = await fetch('/api/v1/search/' + searchString);
    const search = await response.json();

    createCards(search, '#searchResults');

    setTimeout(function () {
        var searchArea = document
            .querySelector('.search-holder')
            .getBoundingClientRect();

        var scrollTo =
            searchArea.top +
            document.querySelector('.app__body').scrollTop -
            50;
        //console.log(scrollTo);

        document.querySelector('.app__body').scrollTo({
            top: scrollTo,
            behavior: 'smooth'
        });
    }, 500);
}

window.addEventListener('mousedown', function () {
    document.querySelector('body').classList.remove('kb-focus');
});

window.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
        document.querySelector('body').classList.add('kb-focus');
    }
});

let urlSearchParams = new URL(document.location).searchParams;
var paramsSearchString = urlSearchParams.get('q');
if (paramsSearchString !== null) {
    document.querySelector('#search').value = paramsSearchString;
    search();
}

const themePref = localStorage.getItem('pref-theme');
if (themePref !== null) {
    if (themePref === 'light') {
        document
            .querySelector('body')
            .setAttribute('data-theme', 'theme-light');
        document
            .querySelector('html')
            .setAttribute('data-theme', 'theme-light');

        var metaThemeColor = document.querySelector('meta[name=theme-color]');
        metaThemeColor.setAttribute('content', '#ffffff');
    } else if (themePref === 'auto') {
        if (window.matchMedia) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document
                    .querySelector('body')
                    .setAttribute('data-theme', 'theme-dark');
                var metaThemeColor = document.querySelector(
                    'meta[name=theme-color]'
                );
                metaThemeColor.setAttribute('content', '#292d3e');
            }
            if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                document
                    .querySelector('body')
                    .setAttribute('data-theme', 'theme-light');
                var metaThemeColor = document.querySelector(
                    'meta[name=theme-color]'
                );
                metaThemeColor.setAttribute('content', '#ffffff');
            }
        } else {
            document
                .querySelector('body')
                .setAttribute('data-theme', 'theme-dark');
            var metaThemeColor = document.querySelector(
                'meta[name=theme-color]'
            );
            metaThemeColor.setAttribute('content', '#292d3e');
        }

        const darkModeMediaQuery = window.matchMedia(
            '(prefers-color-scheme: dark)'
        );
        darkModeMediaQuery.addListener((e) => {
            const darkModeOn = e.matches;

            if (darkModeOn) {
                document
                    .querySelector('body')
                    .setAttribute('data-theme', 'theme-dark');
                var metaThemeColor = document.querySelector(
                    'meta[name=theme-color]'
                );
                metaThemeColor.setAttribute('content', '#292d3e');
            } else {
                document
                    .querySelector('body')
                    .setAttribute('data-theme', 'theme-light');
                var metaThemeColor = document.querySelector(
                    'meta[name=theme-color]'
                );
                metaThemeColor.setAttribute('content', '#ffffff');
            }
        });
    } else {
        document.querySelector('body').setAttribute('data-theme', 'theme-dark');
        var metaThemeColor = document.querySelector('meta[name=theme-color]');
        metaThemeColor.setAttribute('content', '#292d3e');
    }
} else {
    document.querySelector('body').setAttribute('data-theme', 'theme-dark');
    var metaThemeColor = document.querySelector('meta[name=theme-color]');
    metaThemeColor.setAttribute('content', '#292d3e');
}

const osFramePref = localStorage.getItem('pref-osframe');
if (osFramePref !== null) {
    var pref = localStorage.getItem('pref-osframe');
    if (JSON.parse(pref)) {
        dispatch('updateOSFrame', {
            showOSFrame: true
        });
    } else {
        dispatch('updateOSFrame', {
            showOSFrame: false
        });
    }
} else {
    dispatch('updateOSFrame', {
        showOSFrame: true
    });
}

if (typeof window.fin !== 'undefined') {
    document.querySelectorAll('a[href][target]').forEach((link) => {
        link.addEventListener('click', (e) => {
            fin.System.openUrlWithBrowser(e.currentTarget.href);
            e.preventDefault();
        });
    });
}
