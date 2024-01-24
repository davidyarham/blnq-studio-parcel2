import userSetup from './js/ui/user-setup';
import { createLoginModal } from './js/ui/reactions/utils';
import { getCookie } from './js/utils/cookies';
import { dispatch } from './js/state/store';

userSetup();

function LoggedIn() {
    userSetup();
}

document.querySelector('#login').addEventListener('click', function () {
    createLoginModal({ done: LoggedIn });
});

function createCard(obj, allowDelete) {
    //console.log(obj);

    var card = document.createElement('a');
    card.setAttribute('data-id', `${obj.name}`);
    card.classList.add('dash__card');
    card.href = 'e/' + obj.name;
    card.setAttribute('rel', 'ugc');
    card.setAttribute('data-vis', obj.ispublic);
    card.innerHTML = `
    ${
        (allowDelete &&
            `
        <div class="card__visibility">${
            obj.ispublic
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentcolor" d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/></svg> This Blnq is Public'
                : ''
        }</div>
      <label class="card__delete">
      
      <input type="checkbox" value="${obj.name}" class="mark-delete" />
      
      <div class="icon">
        <svg viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" fill="currentcolor"></path>
        </svg>
    </div>
      
      </label>`) ||
        ''
    }
    <div class="card__images">
      <img aria-hidden="true" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiM0MDQ2NjIiIGQ9Ik0wIDBoMjQwdjE4MEgweiIvPjxnIG9wYWNpdHk9Ii4zMyIgZmlsbD0iIzFCMUUyQiI+PHBhdGggZD0iTTkzIDc5LjMzNEw5OS4yMjIgNzNsMTguNjY1IDE5LTE4LjY2NSAxOUw5MyAxMDQuNjY2IDEwNS40NDMgOTIgOTMgNzkuMzM0ek0xNDcuNzUyIDc5LjMzNEwxNDEuNTI5IDczbC0xOC42NjUgMTkgMTguNjY1IDE5IDYuMjIzLTYuMzM0TDEzNS4zMDggOTJsMTIuNDQ0LTEyLjY2NnoiLz48L2c+PC9nPjwvc3ZnPg==" class="card__img--bg"/>
    </div>
    <div class="card__info">
        
        <div class="flex">  
            <div class="card__name">${
                obj.displayname != ''
                    ? obj.displayname
                    : 'An Untitled Masterpiece'
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

function createCards(cardArray, el, allowDelete) {
    var el = document.querySelector(el);
    cardArray.forEach((card) => {
        var newCard = createCard(card, allowDelete);
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
            result = `${Math.floor((difference / 1000 / 60) % 60)} minute${s} `;
        }
    }

    //it has hours
    if ((difference % 1000) * 3600 * 60 > 0) {
        if (Math.floor((difference / 1000 / 60 / 60) % 24) > 0) {
            let s =
                Math.floor((difference / 1000 / 60 / 60) % 24) == 1 ? '' : 's';
            result =
                `${Math.floor((difference / 1000 / 60 / 60) % 24)} hour${s}${
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
    const response = await fetch('/api/v1/mydashboard/');
    const dashboard = await response.json();

    if (typeof dashboard.id === 'undefined') {
        window.location.href = '/dashboard';
    }
    const top = document.querySelector('#top');
    top.innerHTML = '';
    document.querySelector('#shared').innerHTML = '';
    createCards(dashboard.my, '#top', true);
    createCards(dashboard.shared, '#shared');
    const multiDeleteBtn = document.querySelector('#multiDelete');
    top.addEventListener('click', (e) => {
        if (e.target && e.target.matches('input.mark-delete')) {
            e.stopPropagation();
            e.target.closest('.dash__card').classList.toggle('is-selected');
            if (top.querySelector('input.mark-delete:checked')) {
                multiDeleteBtn.removeAttribute('disabled');
                multiDeleteBtn.classList.add('btn--getreadytodelete');
            } else {
                multiDeleteBtn.setAttribute('disabled', true);
                multiDeleteBtn.classList.remove('btn--getreadytodelete');
            }
        }
    });
    multiDeleteBtn.addEventListener('click', async () => {
        const blnqNames = [
            ...top.querySelectorAll('input.mark-delete:checked')
        ].map((chk) => chk.value);
        var r = confirm('Would you like to delete these Blnqs?');
        if (r == true) {
            const response = await fetch('/api/v1/delete', {
                method: 'POST',
                body: JSON.stringify({
                    blnqNames
                }),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCookie('_csrf'),
                    'CSRF-Token': getCookie('_csrf')
                }
            });
            const data = await response.json();
            if (data.ok) {
                window.location.reload();
            } else {
                alert(data.error);
                window.location.reload();
            }
        }
    });
}

loadDashboard();

/*if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/blnq-sw.js').then(() => {});
    });
}*/

window.addEventListener('mousedown', function () {
    document.querySelector('body').classList.remove('kb-focus');
});

window.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
        document.querySelector('body').classList.add('kb-focus');
    }
});

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
}

if (typeof window.fin !== 'undefined') {
    document.querySelectorAll('a[href][target]').forEach((link) => {
        link.addEventListener('click', (e) => {
            fin.System.openUrlWithBrowser(e.currentTarget.href);
            e.preventDefault();
        });
    });
}
