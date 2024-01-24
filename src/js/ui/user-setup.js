import showProfile from './profile.js';
import store, { subscribe, dispatch } from '../state/store';

const userDetails = document.getElementById('userDetails');

const modalTpl = function ({ user, blnqName }) {
    const contextPath = window.location.pathname.split('/')[1];
    return `<div class="dropdown">
    <button class="btn dropdown__toggler">
        <img class="avatar-img" src="/avatar/${
            store.state.user.id
        }" onload="this.style.display='block'"/>
        <span class="hide-mobile inner user-name-span">${
            user.displayname.split(' ')[0]
        }</span>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            style="position:relative;top:1px;"
        >
            <path
                fill="currentcolor"
                d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
            />
        </svg>
    </button>
    <div class="dropdown__body" style="right:10px;min-width:0;">
        <a href='/mydashboard' class="btn" id="mydashboard">
            <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentcolor" d="M11 9h2v2h-2zm-2 2h2v2H9zm4 0h2v2h-2zm2-2h2v2h-2zM7 9h2v2H7zm12-6H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm2-7h-2v2h2v2h-2v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2h2v-2H5V5h14v6z"/>
            </svg>
            <div class="btn__title">Your Dashboard</div>
        </a>
        <button class="btn" id="myprofile">
            <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentcolor" d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z"/>
            </svg>
            <div class="btn__title">Your Avatar</div>
        </button>
        <a class="btn" href="/auth/logout${
            contextPath && blnqName && `/${contextPath}/${blnqName}`
        }">
            <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentcolor" d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
            </svg>
            <div class="btn__title">Logout</div>
        </a>
    </div>
</div>`;
};

const userSetup = () => {
    if (store.state.user) {
        const frag = document
            .createRange()
            .createContextualFragment(modalTpl(store.state));
        userDetails.innerHTML = '';
        const dropdown = userDetails.appendChild(frag.firstElementChild);
        dropdown
            .querySelector('.dropdown__toggler')
            .addEventListener('click', (e) => {
                const current = e.currentTarget.parentNode;
                current.classList.toggle('open');
                document.body.addEventListener('click', (e) => {
                    if (!current.contains(e.target)) {
                        current.classList.remove('open');
                    }
                });
            });
        dropdown
            .querySelector('#myprofile')
            .addEventListener('click', function () {
                showProfile();
            });
    }
};
function LoggedIn() {
    userSetup();
}

export const fetchUser = async () => {
    const response = await fetch('/auth/user');
    const { ok, user } = await response.json();
    if (ok) {
        dispatch('userLoggedIn', user);
    }
    return ok;
};

subscribe('userLoggedIn', (obj) => {
    userSetup();
});

export default async function () {
    return fetchUser();
}
