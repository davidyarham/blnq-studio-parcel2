import debounce from '../../utils/debounce';
import generatePageURL, { getBlobURL } from '../../utils/generatePageUrl';
import inspectorSetup from '../inspector-setup';
import store, { dispatch } from '../../state/store';

const updateDocument = ({
    html,
    css,
    js,
    library,
    json,
    blnqName,
    files,
    hasBeenSaved
}) => {
    return new Promise((resolve) => {
        const newFrame = document.createElement('iframe');
        newFrame.style.display = 'none';

        newFrame.setAttribute('allowfullscreen', 'true');
        newFrame.setAttribute(
            'sandbox',
            'allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts'
        );
        newFrame.setAttribute(
            'allow',
            'geolocation; microphone; camera; midi; accelerometer; gyroscope; payment'
        );
        //newFrame.setAttribute('allow', '');
        newFrame.setAttribute('allowtransparency', 'false');

        const target = document.querySelector('#output');
        target.parentNode.insertBefore(newFrame, target.nextSibling);

        const navigateAwayMessage = () => {
            if (
                !confirm(
                    'Looks like you are about to navigate the preview pane to another URL for this blnq, are you sure you want to do this?'
                )
            ) {
                dispatch('updateDocument', {});
            }
        };

        newFrame.onload = () => {
            newFrame.style.display = '';
            const target = document.querySelector('#output');
            if (target.src) window.URL.revokeObjectURL(target.src);
            target.remove();
            newFrame.id = 'output';
            newFrame.title = 'preview';
            document.querySelector('.loader').style.display = 'none';
            inspectorSetup(newFrame);
            newFrame.onload = navigateAwayMessage;
            resolve();
        };

        const menuForkButton = document.getElementById('menuFork');
        const menuDeleteButton = document.getElementById('menuDelete');

        const lighthouseButton = document.getElementById('lighthouseButton');
        const lighthouseScoresButton = document.getElementById(
            'lighthouseScoresButton'
        );

        if (hasBeenSaved) {
            if (blnqName !== '') {
                menuForkButton.removeAttribute('disabled');
                menuDeleteButton.removeAttribute('disabled');
                lighthouseButton.removeAttribute('disabled');
                lighthouseButton.setAttribute('href', blnqName);
            }
        }

        newFrame.src = generatePageURL({
            html,
            css,
            js,
            json,
            library,
            files,
            blnqName
        });
    });
};
async function deleteBlnq() {
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
}

export const updateCSSInFrame = (newCSS) => {
    const head = document.querySelector('#output').contentDocument.head;
    const replacementTarget = head.querySelector('#cssBlobStamp');
    const newSrc = getBlobURL(newCSS, 'text/css');
    if (replacementTarget) {
        replacementTarget.href = newSrc;
    } else {
        head.appendChild(
            document
                .createRange()
                .createContextualFragment(
                    `<link rel="stylesheet" type="text/css" id="cssBlobStamp" href="${newSrc}" />`
                )
        );
    }
};

export default updateDocument;
