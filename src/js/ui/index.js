import store, { subscribe } from '../state/store';
import { editorSetup } from './editor-setup';
import iframeSetup from './iframe-setup';
import configSetup from './config-setup';
import historySetup from './history-setup';
import shareSetup from './share-setup';
import preferencesSetup from './preferences-setup';
import tabSetup from './tab-setup';
import menuSetup from './menu-setup';
import { layoutSetup } from './layout-setup';
import zoomSetup from './zoom-setup';
import openWithSetup from './openwith-setup';
import userSetup from './user-setup';
import consoleSetup from './console-setup';
import getSharingDetails from '../ui/reactions/getSharingDetails';

import { createLoginModal } from '../ui/reactions/utils';

function LoggedIn() {
    userSetup();
    getSharingDetails();
}

document.querySelector('#login').addEventListener('click', function () {
    createLoginModal({ done: LoggedIn });
});

iframeSetup();
//wait for loadBlnq event before we init the editors
subscribe('loadBlnq', () => {
    //openWithSetup();
    const editors = editorSetup({
        htmlVal: store.state.html,
        cssVal: store.state.css,
        jsVal: store.state.js,
        jsonVal: store.state.json,
        blnqName: store.state.blnqName,
        config: store.state.config
    });
    consoleSetup();
    menuSetup();
    configSetup();
    historySetup();
    shareSetup();
    preferencesSetup();
    zoomSetup();
    tabSetup(editors);
    userSetup();
    openWithSetup();
    layoutSetup();
});
