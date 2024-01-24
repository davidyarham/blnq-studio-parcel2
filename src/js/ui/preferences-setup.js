import store, { dispatch, subscribe } from '../state/store';
import openwithSetup from './openwith-setup';
import { createEditorSplitter, setLayout } from './layout-setup';

const $ = (id) => document.getElementById(id);

export default () => {
    const appMain = $('appMain');
    const preferencesModal = $('preferencesModal');
    const menuPreferences = $('menuPreferences');
    const closePreferencesButton = $('closePreferences');
    const closePreferencesButton2 = $('closePreferencesButton');

    const layoutButtons = document.querySelectorAll('.layout-choices button');

    const themeLight = $('themeLight');
    const themeDark = $('themeDark');
    const themeAuto = $('themeAuto');

    const indentationTabs = $('indentationTabs');
    const indentationSpaces = $('indentationSpaces');

    const setLineNumbers = (value) => {
        dispatch('updateEditorConfig', {
            lineNumbers: value
        });
    };

    const setWordWrap = (value) => {
        dispatch('updateEditorConfig', {
            wordWrap: value
        });
    };

    const setFolding = (value) => {
        dispatch('updateEditorConfig', {
            folding: value
        });
    };

    const setMiniMap = (value) => {
        dispatch('updateEditorConfig', {
            minimap: {
                enabled: value
            }
        });
    };

    

    const setDataTab = (value) => {
        dispatch('updateDataTab', {
            showDataTab: value
        });
        createEditorSplitter();
    };

    const setFontLigatures = (value) => {
        dispatch('updateEditorConfig', {
            fontLigatures: value
        });
    };

    const setFont = (value) => {
        dispatch('updateEditorConfig', {
            fontFamily: value
        });
    };
    const setFontSize = (value) => {
        dispatch('updateEditorConfig', {
            fontSize: value
        });
    };

    const setIndentationSize = (value) => {
        if (value) {
            dispatch('updateModelConfig', {
                tabSize: value
            });
        }
    };

    const setIndentation = (value) => {
        var insertSpaces = false;
        if (value === 'tabs') {
            insertSpaces = false;
        }
        if (value === 'spaces') {
            insertSpaces = true;
        }
        dispatch('updateModelConfig', {
            insertSpaces: insertSpaces
        });
    };

    const setTheme = (value) => {
        if (value === 'vs') {
            //THIS IS THE LIGHT THEME
            document
                .querySelector('body')
                .setAttribute('data-theme', 'theme-light');
            var metaThemeColor = document.querySelector(
                'meta[name=theme-color]'
            );
            metaThemeColor.setAttribute('content', '#ffffff');
        }
        if (value === 'vs-dark') {
            document
                .querySelector('body')
                .setAttribute('data-theme', 'theme-dark');
            var metaThemeColor = document.querySelector(
                'meta[name=theme-color]'
            );
            metaThemeColor.setAttribute('content', '#292d3e');
        }
        dispatch('updateEditorConfig', {
            theme: value
        });
    };

    /*Preferences*/
    const lineNumbers = $('pref-lineNumbers');
    const lineNumbersPref = localStorage.getItem('pref-linenumbers');
    if (lineNumbersPref !== null) {
        var pref = localStorage.getItem('pref-linenumbers');
        if (JSON.parse(pref)) {
            lineNumbers.checked = true;
            setLineNumbers(true);
        } else {
            lineNumbers.checked = false;
            setLineNumbers(false);
        }
    }
    lineNumbers.addEventListener('change', function () {
        localStorage.setItem('pref-linenumbers', lineNumbers.checked);
        setLineNumbers(lineNumbers.checked);
    });

    const wordWrap = $('pref-wordWrap');
    const wordWrapPref = localStorage.getItem('pref-wordwrap');
    if (wordWrapPref !== null) {
        var pref = localStorage.getItem('pref-wordwrap');
        if (JSON.parse(pref)) {
            wordWrap.checked = true;
            setWordWrap(true);
        } else {
            wordWrap.checked = false;
            setWordWrap(false);
        }
    }
    wordWrap.addEventListener('change', function () {
        localStorage.setItem('pref-wordwrap', wordWrap.checked);
        setWordWrap(wordWrap.checked);
    });

    const folding = $('pref-folding');
    const foldingPref = localStorage.getItem('pref-folding');
    if (foldingPref !== null) {
        var pref = localStorage.getItem('pref-folding');
        if (JSON.parse(pref)) {
            folding.checked = true;
            setFolding(true);
        } else {
            wordWrap.checked = false;
            setFolding(false);
        }
    }
    folding.addEventListener('change', function () {
        localStorage.setItem('pref-folding', folding.checked);
        setFolding(folding.checked);
    });

    const miniMap = $('pref-miniMap');
    const minimapPref = localStorage.getItem('pref-minimap');
    if (minimapPref !== null) {
        var pref = localStorage.getItem('pref-minimap');
        if (JSON.parse(pref)) {
            miniMap.checked = true;
            setMiniMap(true);
        } else {
            miniMap.checked = false;
            setMiniMap(false);
        }
    }
    miniMap.addEventListener('change', function () {
        localStorage.setItem('pref-minimap', miniMap.checked);
        setMiniMap(miniMap.checked);
    });

    const dataTab = $('pref-datatab');
    const dataTabPref = localStorage.getItem('pref-datatab');
    if (dataTabPref !== null) {
        var pref = localStorage.getItem('pref-datatab');
        if (JSON.parse(pref)) {
            dataTab.checked = true;
            setDataTab(true);
        } else {
            dataTab.checked = false;
            setDataTab(false);
        }
    } else {
        dataTab.checked = false;
        setDataTab(dataTab.checked);
    }
    dataTab.addEventListener('change', function () {
        localStorage.removeItem('editor-layout-sizes');
        localStorage.setItem('pref-datatab', dataTab.checked);
        setDataTab(dataTab.checked);
    });


    

    const fontName = $('pref-fontName');
    const fontNamePref = localStorage.getItem('pref-fontName');
    if (fontNamePref !== null && fontNamePref !== '') {
        var pref = localStorage.getItem('pref-fontName');
        fontName.value = pref;
        setFont(pref);
    }
    fontName.addEventListener('input', function () {
        localStorage.setItem('pref-fontName', fontName.value);
        setFont(fontName.value);
    });

    const fontSize = $('pref-fontSize');
    const fontSizePref = localStorage.getItem('pref-fontSize');
    if (fontSizePref !== null && fontSizePref !== '') {
        var pref = localStorage.getItem('pref-fontSize');
        fontSize.value = pref;
        setFontSize(pref);
    }
    fontSize.addEventListener('input', function () {
        localStorage.setItem('pref-fontSize', fontSize.value);
        setFontSize(fontSize.value);
    });

    const fontLigatures = $('pref-fontLigatures');
    const fontLigaturesPref = localStorage.getItem('pref-fontLigatures');
    if (fontLigaturesPref !== null) {
        var pref = localStorage.getItem('pref-fontLigatures');
        if (JSON.parse(pref)) {
            fontLigatures.checked = true;
            setFontLigatures(true);
        } else {
            fontLigatures.checked = false;
            setFontLigatures(false);
        }
    } else {
        setFontLigatures(fontLigatures.checked);
    }
    fontLigatures.addEventListener('change', function () {
        localStorage.setItem('pref-fontLigatures', fontLigatures.checked);
        setFontLigatures(fontLigatures.checked);
    });

    const indentationSize = $('pref-indentationSize');
    const indentationSizePref = localStorage.getItem('pref-indentationSize');
    if (indentationSizePref !== null && indentationSizePref !== '') {
        var pref = localStorage.getItem('pref-indentationSize');
        indentationSize.value = pref;
        setIndentationSize(pref);
    }
    indentationSize.addEventListener('input', function () {
        localStorage.setItem('pref-indentationSize', indentationSize.value);
        setIndentationSize(indentationSize.value);
    });

    const indentationPref = localStorage.getItem('pref-indentation');
    if (indentationPref !== null) {
        if (indentationPref === 'tabs') {
            indentationTabs.setAttribute('checked', 1);
            setIndentation(indentationPref);
        } else if (indentationPref === 'spaces') {
            indentationSpaces.setAttribute('checked', 1);
            setIndentation(indentationPref);
        }
    } else {
        indentationTabs.setAttribute('checked', 1);
        setIndentation('tabs');
    }

    indentationTabs.addEventListener('change', (e) => {
        indentationSpaces.removeAttribute('checked');
        indentationTabs.setAttribute('checked', 1);
        localStorage.setItem('pref-indentation', 'tabs');
        setIndentation('tabs');
    });
    indentationSpaces.addEventListener('change', (e) => {
        indentationTabs.removeAttribute('checked');
        indentationSpaces.setAttribute('checked', 1);
        localStorage.setItem('pref-indentation', 'spaces');
        setIndentation('spaces');
    });

    /*Events*/
    const themePref = localStorage.getItem('pref-theme');
    if (themePref !== null) {
        if (themePref === 'light') {
            themeLight.setAttribute('checked', 1);
            setTheme('vs');
        } else if (themePref === 'auto') {
            themeAuto.setAttribute('checked', 1);
            if (window.matchMedia) {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    setTheme('vs-dark');
                }
                if (
                    window.matchMedia('(prefers-color-scheme: light)').matches
                ) {
                    setTheme('vs');
                }
            } else {
                setTheme('vs-dark');
            }

            const darkModeMediaQuery = window.matchMedia(
                '(prefers-color-scheme: dark)'
            );
            darkModeMediaQuery.addListener((e) => {
                const darkModeOn = e.matches;

                if (darkModeOn) {
                    setTheme('vs-dark');
                } else {
                    setTheme('vs');
                }
            });
        } else {
            themeDark.setAttribute('checked', 1);
            setTheme('vs-dark');
        }
    } else {
        themeDark.setAttribute('checked', 1);
        localStorage.setItem('pref-theme', 'dark');
        setTheme('vs-dark');
    }

    layoutButtons.forEach((el) => {
        el.addEventListener('click', (e) => {
            var dataLayout = e.currentTarget.getAttribute('data-layout');
            setLayout(dataLayout);
        });
    });

    themeLight.addEventListener('change', (e) => {
        themeDark.removeAttribute('checked');
        themeLight.setAttribute('checked', 1);
        themeAuto.removeAttribute('checked');
        localStorage.setItem('pref-theme', 'light');
        setTheme('vs');
    });
    themeDark.addEventListener('change', (e) => {
        themeLight.removeAttribute('checked');
        themeDark.setAttribute('checked', 1);
        themeAuto.removeAttribute('checked');
        localStorage.setItem('pref-theme', 'dark');
        setTheme('vs-dark');
    });
    themeAuto.addEventListener('change', (e) => {
        themeLight.removeAttribute('checked');
        themeDark.removeAttribute('checked');
        themeAuto.setAttribute('checked', 1);
        localStorage.setItem('pref-theme', 'auto');
        if (window.matchMedia) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('vs-dark');
            }
            if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                setTheme('vs');
            }
            const darkModeMediaQuery = window.matchMedia(
                '(prefers-color-scheme: dark)'
            );
            darkModeMediaQuery.addListener((e) => {
                const darkModeOn = e.matches;

                if (darkModeOn) {
                    setTheme('vs-dark');
                } else {
                    setTheme('vs');
                }
            });
        } else {
            setTheme('vs-dark');
        }
    });

    [menuPreferences].forEach((el) =>
        el.addEventListener('click', function () {
            dispatch('showPreferences', true);
        })
    );

    const showPreferencesModal = ({ showPreferences }) => {
        preferencesModal.classList[showPreferences ? 'add' : 'remove']('show');
        appMain.classList[showPreferences ? 'add' : 'remove']('fade');
    };

    closePreferencesButton.addEventListener('click', function () {
        dispatch('showPreferences', false);
    });
    closePreferencesButton2.addEventListener('click', function () {
        dispatch('showPreferences', false);
    });

    subscribe('showPreferences', () => showPreferencesModal(store.state));
};
