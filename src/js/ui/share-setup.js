import store, { dispatch, subscribe } from '../state/store';

function copyToClipboard(target) {
    var copyText = target;
    copyText.select();
    document.execCommand('copy');
}

const $ = (id) => document.getElementById(id);

export default () => {
    const appMain = $('appMain');
    const shareButton = $('shareButton');
    const shareModal = $('shareModal');
    const closeShareButton = $('closeShare');
    const linksBody = document.querySelector(
        '#shareModal .section--links .section__body'
    );
    const filesBody = document.querySelector(
        '#shareModal .section--files .section__body'
    );

    if (store.state.hasBeenSaved && store.state.blnqName !== '') {
        shareButton.removeAttribute('disabled');
    }

    subscribe('savedSuccess', () => {
        shareButton.removeAttribute('disabled');
    });

    const externalFileInputs = [
        ...document.querySelectorAll('.history-extra-file')
    ];

    const showHistoryModal = (showHistory) => {
        shareModal.classList[showHistory ? 'add' : 'remove']('show');
        appMain.classList[showHistory ? 'add' : 'remove']('fade');
    };

    const fieldTemplate = (obj) => {
        return `<div class="field field--full flex-row">
        <label>
            <div class="field__label">
                ${obj.title}
            </div>
            <input type="text" readonly value="${obj.url}"/>
            <button class="btn btn--icon share-copy-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
            </button>
        </label>
    </div>`;
    };

    document.addEventListener('click', (e) => {
        if (e.target.matches('.share-copy-button')) {
            copyToClipboard(e.target.closest('.field').querySelector('input'));
        }
    });

    shareButton.addEventListener('click', function () {
        linksBody.innerHTML = '';
        filesBody.innerHTML = '';

        if (navigator.share) {
            try {
                document.querySelector('.sharevia').remove();
            } catch (e) {}
            var shareSection = document.createRange()
                .createContextualFragment(`<section class="section sharevia">
    <h2 class="section__header">Share</h2>
    <div class="section__body">
        <button class="btn btn--setting">Share Via...</button>
    </div>
</section>`);

            shareSection
                .querySelector('button')
                .addEventListener('click', () => {
                    navigator
                        .share({
                            title: store.state.displayname
                                ? store.state.displayname
                                : 'An Untitled Masterpiece',
                            url: `${wl.protocol}//${wl.host}/e/${store.state.blnqName}`
                        })
                        .then(() => {});
                });
            shareModal
                .querySelector('.modal__dialog__body')
                .prepend(shareSection);
        }

        var wl = window.location;
        var links = [
            {
                title: 'Browser View',
                url: `${wl.protocol}//${wl.host}/v/${store.state.blnqName}`,
            },
            {
                title: 'Browser Editor',
                url: `${wl.protocol}//${wl.host}/e/${store.state.blnqName}`,
            }
        ];

        
        for (var i = 0; i < links.length; i++) {
                linksBody.appendChild(
                    document
                        .createRange()
                        .createContextualFragment(fieldTemplate(links[i]))
                );
        }

        var files = [
            {
                title: 'HTML',
                url: `${wl.protocol}//${wl.host}/f/${store.state.blnqName}.html`
            },
            {
                title: 'CSS',
                url: `${wl.protocol}//${wl.host}/f/${store.state.blnqName}.css`
            },
            {
                title: 'JavaScript',
                url: `${wl.protocol}//${wl.host}/f/${store.state.blnqName}.js`
            },
            {
                title: 'JSON',
                url: `${wl.protocol}//${wl.host}/f/${store.state.blnqName}.json`
            }
        ];

        for (var i = 0; i < files.length; i++) {
            filesBody.appendChild(
                document
                    .createRange()
                    .createContextualFragment(fieldTemplate(files[i]))
            );
        }

        showHistoryModal(true);
    });
    closeShareButton.addEventListener('click', function () {
        showHistoryModal(false);
    });
};
