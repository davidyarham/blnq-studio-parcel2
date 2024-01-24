const hash = document.location.hash.split('&')[0];
const activeTab =
    hash &&
    hash.substr(1) &&
    document.querySelector(`.btn--tab[data-show=${hash.substr(1)}]`);

const tabSetup = (editors) => {
    const editorRoots = [...document.querySelectorAll('.editor')];

    const tabs = [...document.querySelectorAll('.btn--tab')];

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const attr = tab.getAttribute('data-show');

            document.location.hash = tab.getAttribute('data-show');
            tabs.forEach((tab) => tab.classList.remove('active'));
            tab.classList.add('active');
            editorRoots.forEach((editor) => editor.classList.remove('show'));
            if (attr) {
                document.getElementById(`editor${attr}`).classList.add('show');
                //console.log(editors[attr.toLowerCase()]);
                if (typeof editors[attr.toLowerCase()] !== 'undefined') {
                    editors[attr.toLowerCase()].layout();
                    editors[attr.toLowerCase()].focus();
                }
            }
        });
    });
    if (activeTab) {
        activeTab && activeTab.click();
    } else {
        editors['html'].focus();
    }
};

export default tabSetup;
