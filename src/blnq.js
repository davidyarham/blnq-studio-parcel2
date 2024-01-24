import './js/ui';
import store from './js/state/store';
import './cc';

//if (typeof fin === 'undefined') {
window.addEventListener('beforeunload', function (e) {
    if (typeof fin === 'undefined') {
        //check store to see if it holds uncsaved changes
        if (!store.state.isDirty) {
            return undefined;
        }
        var confirmationMessage =
            'It looks like you have been editing something. If you leave before saving, your changes will be lost.';
        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
    }
});
//}

function updateOnlineStatus() {
    var onlineStatus = document.querySelector('#onlineStatus');
    if (navigator.onLine) {
        onlineStatus.innerHTML = '';
    } else {
        onlineStatus.innerHTML = 'Offline';
    }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

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
