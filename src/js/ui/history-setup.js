import store, { dispatch, subscribe } from '../state/store';

const $ = (id) => document.getElementById(id);

export default () => {
    const appMain = $('appMain');
    const menuHistory = $('menuHistory');
    const historySelect = $('historySelect');
    //const historyImage = $('historyImage');
    const historySpinner = $('historySpinner');
    const historyModal = $('historyModal');
    const closeHistoryButton = $('closeHistory');
    const revertButton = $('historyRevertButton');
    const historyImagesHolder = $('historyImagesHolder');

    if (store.state.hasBeenSaved && store.state.blnqName !== '') {
        menuHistory.removeAttribute('disabled');
    }

    subscribe('savedSuccess', () => {
        menuHistory.removeAttribute('disabled');
    });

    const externalFileInputs = [
        ...document.querySelectorAll('.history-extra-file')
    ];

    const showHistoryModal = ({ showHistory, history, files }) => {
        historyModal.classList[showHistory ? 'add' : 'remove']('show');
        appMain.classList[showHistory ? 'add' : 'remove']('fade');
        if (showHistory) {
            getHistoryItems();
        }
    };

    const getHistoryItems = async () => {
        historySpinner.classList.add('show');
        historySelect.innerHTML = '';
        const response = await fetch('/api/v1/history/' + store.state.blnqName);
        const history = await response.json();
        history.forEach((historyItem) => {
            const option = document.createElement('option');
            const readableTimestamp = new Date(
                parseInt(historyItem)
            ).toUTCString();
            option.innerText = readableTimestamp;
            option.value = historyItem;
            historySelect.append(option);
        });
        getHistoryItem();
        historySelect.addEventListener('change', getHistoryItem);
    };

    const getHistoryItem = async () => {
        historySpinner.classList.add('show');
        const timestamp =
            historySelect.options[historySelect.selectedIndex].value;

        var oldHistoryImage = $('historyImage');
        if (oldHistoryImage !== null) {
            oldHistoryImage.remove();
        }

        const historyImage = document.createElement('img');
        historyImage.id = 'historyImage';

        historyImage.src = '/hf/' + store.state.blnqName + '/' + timestamp;
        historyImage.addEventListener('load', function () {
            historySpinner.classList.remove('show');
        });
        historyImage.addEventListener('error', function () {
            historySpinner.classList.remove('show');
        });

        historyImagesHolder.append(historyImage);
    };

    [revertButton].forEach((el) =>
        el.addEventListener('click', async () => {
            const timestamp =
                historySelect.options[historySelect.selectedIndex].value;
            const response = await fetch(
                '/api/v1/history/revert/' +
                    store.state.blnqName +
                    '/' +
                    timestamp
            );
            const history = await response.json();

            dispatch('updateEditor', {
                html: history[0].html,
                css: history[0].css,
                js: history[0].js,
                json: history[0].json,
            });
            dispatch('showHistory', false);
        })
    );

    [menuHistory].forEach((el) =>
        el.addEventListener('click', function () {
            dispatch('showHistory', true);
        })
    );

    closeHistoryButton.addEventListener('click', function () {
        dispatch('showHistory', false);
    });

    subscribe('showHistory', () => showHistoryModal(store.state));
};
