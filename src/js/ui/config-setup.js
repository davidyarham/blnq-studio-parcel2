import store, { dispatch, subscribe } from '../state/store';
import { libraries } from '../../../config/default';

const extraFileTpl = (value) => `<div class="field field--full">
    <label class="flex-row">
        <input
            type="text"
            placeholder="https://..."
            class="config-extra-file"
            value="${value}"
            autocomplete="nope"
        />
    </label>
    <button class="btn btn--icon config-file-remove">
        <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" fill="currentcolor"/>
        </svg>
    </button>
</div>`;

const userShareTpl = (value) => `<div class="field field--full">
    <label class="flex-row">
        <input
            type="email"
            placeholder="e.g. user@domain.com"
            class="config-user-share"
            value="${value}"
            autocomplete="nope"
        />
    </label>
    <button class="btn btn--icon config-file-remove">
        <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" fill="currentcolor"/>
        </svg>
    </button>
</div>`;

const addExternalFile = () => {
    /*const existingFileInputs = [
        ...document.querySelectorAll('.config-extra-file')
    ];*/
    const nodeToInsert = document
        .createRange()
        .createContextualFragment(extraFileTpl(''));
    $('extraFiles').appendChild(nodeToInsert);
};
const addUserShare = () => {
    /*const existingUserInputs = [
        ...document.querySelectorAll('.config-user-share')
    ];*/
    const nodeToInsert = document
        .createRange()
        .createContextualFragment(userShareTpl(''));
    $('sharedWith').appendChild(nodeToInsert);
};

const $ = (id) => document.getElementById(id);

const setFooterState = (state) => {
    if (state.isPermissioned) {
        $('visibility').style.display = '';
        if (JSON.parse(state.ispublic)) {
            $(
                'visibility'
            ).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
        <path fill="currentcolor" d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
    </svg>
    <span class="inner hide-mobile">Public</span>`;
        } else {
            $(
                'visibility'
            ).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
        <path fill="currentcolor" d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6zM18 20H6V10h12v10z"/>
    </svg><span class="inner hide-mobile">Private</span>`;
        }
    } else {
        $('visibility').style.display = 'none';
    }
};

export default () => {
    const appMain = $('appMain');
    const blnqDisplayname = $('blnqDisplayname');
    const configButton = $('configButton');
    const configModal = $('configModal');
    const closeConfigButton = $('closeConfig');
    const saveConfigButton = $('saveConfig');
    const menuConfig = $('menuConfig');
    const addExternalFileBtn = $('addExternalFile');
    const addSharedUserBtn = $('addSharedUser');
    const cdnjs = $('cdnjs');
    const cdnjsDropdown = $('cdnjsDropdown');
    const cdnjsDropdownBody = $('cdnjsDropdownBody');

    const visPublic = $('visPublic');
    const visPrivate = $('visPrivate');

    const configLibrarySelector = $('configLibraries');

    const activeLibs = {};

    const configLibraryInfo = $('configInfo');

    configLibrarySelector.addEventListener('change', (evt) => {
        var library = evt.currentTarget.value;
        if (library) {
            var foundLib = libraries.find(
                (lib) => lib.id === library && !lib.hidden
            );
            configLibraryInfo.innerHTML = `<div><i>${foundLib.description}</i></div>`;
            if (
                typeof foundLib.urls !== 'undefined' &&
                foundLib.urls.length > 0
            ) {
                for (var i = 0; i < foundLib.urls.length; i++) {
                    var a = document.createElement('a');
                    a.href = foundLib.urls[i];
                    a.innerHTML = foundLib.urls[i];
                    a.setAttribute('target', '_blank');
                    configLibraryInfo.append(a);
                }
            }
        } else {
            configLibraryInfo.innerHTML = '';
        }
    });

    libraries
        .filter((lib) => !lib.hidden)
        .forEach((lib, idx) => {
            activeLibs[lib.id] = lib;
            configLibrarySelector.appendChild(
                document
                    .createRange()
                    .createContextualFragment(
                        `<option value="${lib.id}" ${
                            idx === store.state.library && 'selected'
                        }>${lib.name}</option>`
                    )
            );
        });

    document.addEventListener('click', (e) => {
        if (e.target.matches('.config-file-remove')) {
            e.target.closest('.field').remove();
        }
    });

    $('visibility').addEventListener('click', () => {
        dispatch('showConfig', true);
    });

    setFooterState(store.state);

    const showConfigModal = ({
        showConfig,
        library,
        files,
        displayname,
        sharing,
        ispublic,
        isPermissioned
    }) => {
        configModal.classList[showConfig ? 'add' : 'remove']('show');
        appMain.classList[showConfig ? 'add' : 'remove']('fade');
        if (
            !!library &&
            libraries.find((lib) => lib.id === library && lib.hidden)
        ) {
            configLibrarySelector.setAttribute('disabled', true);
            configLibrarySelector.closest('.section').style.display = 'none';
        }

        if (!!library && activeLibs[library]) {
            configLibrarySelector.querySelector(
                `option[value="${library}"]`
            ).selected = true;
            var foundLib = libraries.find(
                (lib) => lib.id === library && !lib.hidden
            );
            configLibraryInfo.innerHTML = `<div><i>${foundLib.description}</i></div>`;
            if (
                typeof foundLib.urls !== 'undefined' &&
                foundLib.urls.length > 0
            ) {
                for (var i = 0; i < foundLib.urls.length; i++) {
                    var a = document.createElement('a');
                    a.href = foundLib.urls[i];
                    a.innerHTML = foundLib.urls[i];
                    a.setAttribute('target', '_blank');
                    configLibraryInfo.append(a);
                }
            }
        }

        blnqDisplayname.value = displayname;

        visPublic.removeAttribute('checked');
        visPrivate.removeAttribute('checked');
        if (isPermissioned) {
            $('sharing').style.display = '';
            if (JSON.parse(ispublic)) {
                visPublic.setAttribute('checked', 'true');
            } else {
                visPrivate.setAttribute('checked', 'true');
            }
        } else {
            $('sharing').style.display = 'none';
        }

        const extras = $('extraFiles');
        const sharedWith = $('sharedWith');
        extras.innerHTML = '';
        files.forEach((file, idx) => {
            extras.appendChild(
                document
                    .createRange()
                    .createContextualFragment(extraFileTpl(file, idx))
            );
        });
        sharedWith.innerHTML = '';
        sharing.forEach((user) => {
            sharedWith.appendChild(
                document
                    .createRange()
                    .createContextualFragment(userShareTpl(user))
            );
        });

        /*Show a minimum of 5 files*/

        var extraFileEls = document.querySelectorAll('.config-extra-file');
        for (var i = 0; i < 2 - extraFileEls.length; i++) {
            addExternalFile();
        }
    };

    [configButton, menuConfig].forEach((el) =>
        el.addEventListener('click', function () {
            dispatch('showConfig', true);
        })
    );

    closeConfigButton.addEventListener('click', function () {
        dispatch('showConfig', false);
    });

    saveConfigButton.addEventListener('click', function () {
        updateBlnqInfo();
        const files = [...document.querySelectorAll('.config-extra-file')]
            .map((input) => input.value)
            .filter((val) => val.trim() != '');

        const sharing = [...document.querySelectorAll('.config-user-share')]
            .map((input) => input.value)
            .filter((val) => val.trim() != '');
        dispatch('updateDocument', {
            library: configLibrarySelector.value,
            showConfig: false,
            files,
            sharing
        });

        if (visPublic.checked) {
            dispatch('setIsPublic', true);
        } else {
            dispatch('setIsPublic', false);
        }
        setFooterState(store.state);
        dispatch('showConfig', false);
    });
    addExternalFileBtn.addEventListener('click', () => {
        addExternalFile();
        addExternalFileBtn.scrollIntoView();
    });
    addSharedUserBtn.addEventListener('click', () => {
        addUserShare();
    });

    blnqDisplayname.addEventListener('input', (e) => {
        dispatch('setDisplayname', e.target.value);
    });
    blnqDisplayname.addEventListener('change', (e) => {
        dispatch('setDisplayname', e.target.value);
    });

    visPublic.addEventListener('change', () => {
        visPublic.removeAttribute('checked');
        visPrivate.removeAttribute('checked');
        visPublic.setAttribute('checked', 1);
    });
    visPublic.addEventListener('click', () => {
        visPublic.removeAttribute('checked');
        visPrivate.removeAttribute('checked');
        visPublic.setAttribute('checked', 1);
    });

    visPrivate.addEventListener('change', () => {
        visPublic.removeAttribute('checked');
        visPrivate.removeAttribute('checked');
        visPrivate.setAttribute('checked', 1);
    });
    visPrivate.addEventListener('click', () => {
        visPublic.removeAttribute('checked');
        visPrivate.removeAttribute('checked');
        visPrivate.setAttribute('checked', 1);
    });

    subscribe('showConfig', () => {
        showConfigModal(store.state);
    });

    subscribe('updateSharingDetails', (state) => {
        setFooterState(state);
    });

    function updateBlnqInfo() {
        var displayName;
        if (store.state.displayname === '') {
            displayName = '';
        } else {
            displayName = store.state.displayname;
        }

        document.querySelector('#blnqInfo').value = displayName;

        if (displayName !== '') {
            document.querySelector('#htmltitle').textContent =
                displayName + ' - Blnq Studio';
        }
    }

    updateBlnqInfo();

    document.querySelector('#blnqInfo').addEventListener('input', () => {
        store.state.displayname = document.querySelector('#blnqInfo').value;
        dispatch('setDirty');
    });

    var cdnjsDebounce;
    cdnjs.addEventListener('input', () => {
        clearTimeout(cdnjsDebounce);
        cdnjsDropdown.classList.remove('open');
        cdnjsDropdownBody.innerHTML = '';
        cdnjsDebounce = setTimeout(async () => {
            if (cdnjs.value !== '') {
                const response = await fetch(
                    `https://api.cdnjs.com/libraries?search=${cdnjs.value}`
                );
                const data = await response.json();
                var max = 30;
                var count = 0;
                for (var i = 0; i < data.results.length; i++) {
                    count = count + 1;
                    if (count <= max) {
                        var obj = data.results[i];
                        var button = document.createElement('button');
                        button.classList.add('btn');
                        button.classList.add('btn--col');
                        button.setAttribute('data-link', obj.latest);
                        button.innerHTML = `<div class="btn__title">
                        ${obj.name}
                        </div>
                        <div class="btn__subtitle">
                            ${obj.latest}
                        </div>`;
                        button.addEventListener('click', (e) => {
                            cdnjs.value = '';
                            cdnjsDropdownBody.innerHTML = '';
                            cdnjsDropdown.classList.remove('open');
                            var extraFileEls = document.querySelectorAll(
                                '.config-extra-file'
                            );
                            var added = false;
                            for (var i = 0; i < extraFileEls.length; i++) {
                                if (
                                    extraFileEls[i].value === '' &&
                                    added === false
                                ) {
                                    added = true;
                                    extraFileEls[
                                        i
                                    ].value = e.currentTarget.getAttribute(
                                        'data-link'
                                    );
                                }
                            }
                            if (added === false) {
                                addExternalFile();
                                var lastExtraFile = document.querySelectorAll(
                                    '.config-extra-file'
                                )[
                                    document.querySelectorAll(
                                        '.config-extra-file'
                                    ).length - 1
                                ];
                                lastExtraFile.value = e.currentTarget.getAttribute(
                                    'data-link'
                                );
                            }
                        });

                        cdnjsDropdownBody.appendChild(button);
                    }
                }
                cdnjsDropdown.classList.add('open');
            }
        }, 250);
    });
};
