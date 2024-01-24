import store, { dispatch } from '../../state/store';
import { getCookie } from '../../utils/cookies';
import getSharingDetails from '../reactions/getSharingDetails';
import quotes from './quotes';
import { createLoginModal } from './utils';

let loginModalActive = false;

const showSaver = (quote) => {
    if (quote === 'Toasty') {
        try {
            document.querySelectorAll('#toasty')[0].play();
        } catch (e) {}
        document.querySelector('.toasty').classList.add('saving');
    } else {
        document.querySelector('.saver').classList.add('saving');
    }
    setTimeout(function () {
        document.querySelector('.saver').classList.remove('saving');
        document.querySelector('.toasty').classList.remove('saving');
    }, 900);
};

const notifyInsufficientPrivileges = () => {
    const wantsToFork = confirm(
        'Sorry - you do not have permission to save this Blnq!\n\nWould You like to Fork instead?'
    );
    if (wantsToFork) {
        store.state.isDirty = false;
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
};

async function save() {
    const {
        html,
        css,
        js,
        json,
        library,
        blnqName,
        isDirty,
        files,
        displayname,
        sharing,
        ispublic
    } = store.state;

    if (!isDirty || loginModalActive) {
        return;
    }

    var quote = quotes[Math.floor(Math.random() * Math.floor(quotes.length))];
    document.querySelector('.saver').innerHTML = quote;
    showSaver(quote);

    const data = {
        blnqName,
        html,
        css,
        js,
        json,
        library,
        files,
        displayname,
        sharing,
        ispublic
    };
    const response = await fetch('/api/v1/blnqs', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-CSRF-TOKEN': getCookie('_csrf'),
            'CSRF-Token': getCookie('_csrf')
        }
    });
    switch (response.status) {
        case 200:
            const { blnqName } = await response.json();
            dispatch('savedSuccess', {
                blnqName
            });
            const hash = document.location.hash;
            window.history.pushState(
                {},
                blnqName,
                `/e/${blnqName}${hash ? hash : ''}`
            );
            break;
        case 401:
            !loginModalActive &&
                createLoginModal({
                    done: async () => {
                        loginModalActive = false;
                        const status = await save();
                        if (status === 200) {
                            /*ga.event(
                                'Save',
                                'saved:after_challenged_for_login'
                            );*/
                            getSharingDetails();
                        } else {
                            console.log('faield to save', status);
                            /*ga.event(
                                'Save',
                                'saved:after_challenged_for_login:failed_to_authenticate'
                            );*/
                        }
                    },
                    title: 'You need to Log in or Sign Up to save a Blnq'
                }).catch(() => (loginModalActive = false));
            loginModalActive = true;
            break;
        case 403:
            notifyInsufficientPrivileges();
            break;
    }
    if (response.status === 500) {
        alert('Oooooops! Something Went wrong...');
    }
    return response.status;
}

export default save;
