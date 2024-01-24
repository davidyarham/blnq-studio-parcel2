import * as monaco from 'monaco-editor';
import store, { dispatch, subscribe } from '../state/store';
import save from '../ui/reactions/save';
import updateDocument, {
    updateCSSInFrame
} from '../ui/reactions/updateDocument';
import load from '../ui/reactions/load';
import debounce from '../utils/debounce';
import { fetchSnippetsForConfig } from '../utils/suggestions';
import prettier from 'prettier/standalone';
import postcss from 'prettier/parser-postcss';
import babel from 'prettier/parser-babel';

const debounceRate = 50;

const formatDocumentButton = document.querySelector('#formatDocument');
const formatDocumentButton1 = document.querySelector('#formatDocument1');

const infoTemplate = function (content) {
    return `<div class="editor__info">${content}</div>`;
};

monaco.languages.registerDocumentFormattingEditProvider('css', {
    async provideDocumentFormattingEdits(model, options, token) {
        const text = prettier.format(model.getValue(), {
            parser: 'css',
            plugins: [postcss],
            useTabs: true,
            tabWidth: 4
        });
        return [
            {
                range: model.getFullModelRange(),
                text
            }
        ];
    }
});
/*
monaco.languages.registerDocumentFormattingEditProvider('javascript', {
    async provideDocumentFormattingEdits(model, options, token) {
        const text = prettier.format(model.getValue(), {
            parser: 'babel',
            plugins: [babel],
            singleQuote: true,
            useTabs: true,
            tabWidth: 4
        });

        return [
            {
                range: model.getFullModelRange(),
                text
            }
        ];
    }
});*/

self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
        if (label === 'json') {
            return '/json.worker.js';
        }
        if (label === 'css') {
            return '/css.worker.js';
        }
        if (label === 'html') {
            return '/html.worker.js';
        }
        if (label === 'typescript' || label === 'javascript') {
            return '/ts.worker.js';
        }
        return '/editor.worker.js';
    }
};

monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false
});

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    typeRoots: ['/node_modules/@types']
});

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    typeRoots: ['/node_modules/@types']
});

const htmlModel = (content = '') => monaco.editor.createModel(content, 'html');

const cssModel = (content = '') => monaco.editor.createModel(content, 'css');

const jsModel = (content = '') =>
    monaco.editor.createModel(content, 'javascript');

const jsonModel = (content = '') => monaco.editor.createModel(content, 'json');

const editorOptions = {
    cursorBlinking: 'smooth',
    cursorStyle: 'line',
    dragAndDrop: true,
    formatOnType: true,
    formatOnPaste: true,
    autoIndent: true,
    scrollBeyondLastLine: true,
    overviewRulerBorder: false,
    overviewRulerLanes: 1,
    smoothScrolling: false,
    fontSize: 12,
    fontWeight: '500',
    renderIndentGuides: true,
    scrollbar: {
        verticalScrollbarSize: 8
    },
    lineNumbers: true,
    wordWrap: true,
    folding: false,
    minimap: {
        enabled: false,
        renderCharacters: false
    },
    extraEditorClassName: 'blnq-editor',
    theme: 'vs-dark',
    scrollbar: {
        useShadows: false,
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 9,
        horizontalScrollbarSize: 9
    },
    hover: { delay: 1500, enabled: true }
};

const createEditor = (options, model, target) =>
    monaco.editor.create(target, {
        ...options,
        model
    });

const showConfig = {
    id: 'blnq_open_configuration',
    label: 'Blnq: Open Configuration',
    keybindings: [
        monaco.KeyMod.chord(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B,
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_C
        )
    ],
    run: (ed) => {
        dispatch('showConfig', true);
    }
};
const showPreferences = {
    id: 'blnq_open_preferences',
    label: 'Blnq: Open Preferences',
    keybindings: [
        monaco.KeyMod.chord(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B,
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_P
        )
    ],
    run: (ed) => {
        dispatch('showPreferences', true);
    }
};

var editors = {};
const getEditor = (editor) => {
    return editors[editor];
};

const getEditors = (editor) => {
    return editors;
};

var htmlVal;
var htmlto;

const editorSetup = ({
    htmlVal = '',
    cssVal = '',
    jsVal = '',
    jsonVal = '',
    blnqName = '',
    config = -1
} = {}) => {
    const html = createEditor(
        {
            ...editorOptions,
            quickSuggestions: true,
            snippetSuggestions: 'top',
            wordBasedSuggestions: true
        },
        htmlModel(htmlVal),
        document.querySelector('#editorHTML .editor__wrapper')
    );
    html.addAction(showConfig);
    html.addAction(showPreferences);
    html.getModel().updateOptions({ insertSpaces: false, tabSize: 4 });

    editors['html'] = html;

    const css = createEditor(
        editorOptions,
        cssModel(cssVal),
        document.querySelector('#editorCSS .editor__wrapper')
    );

    css.addAction(showConfig);
    css.addAction(showPreferences);
    css.getModel().updateOptions({ insertSpaces: false, tabSize: 4 });

    editors['css'] = css;

    const js = createEditor(
        editorOptions,
        jsModel(jsVal),
        document.querySelector('#editorJS .editor__wrapper')
    );
    js.addAction(showConfig);
    js.addAction(showPreferences);
    js.getModel().updateOptions({ insertSpaces: false, tabSize: 4 });

    editors['js'] = js;

    const json = createEditor(
        editorOptions,
        jsonModel(jsonVal),
        document.querySelector('#editorJSON .editor__wrapper')
    );
    json.addAction(showConfig);
    json.addAction(showPreferences);
    json.getModel().updateOptions({ insertSpaces: false, tabSize: 4 });

    editors['json'] = json;

    updateDocument(store.state);

    let eventDisposers = [];

    const unbindEditors = () =>
        eventDisposers.forEach((f) => {
            f.dispose();
        });

    const updateSelection = (row, col) => {
        document.querySelector(
            '#cursorPosition'
        ).innerHTML = `Ln ${row}, Col ${col}`;
    };

    const bindHTML = () => {
        eventDisposers.push(
            html.onDidChangeModelContent(
                debounce(function () {
                    dispatch('updateDocument', { html: html.getValue() });
                    var editorDom = document.querySelector(
                        '[data-name="HTML"]'
                    );
                    /*var val = html.getValue().toLowerCase();

                    try {
                        document;
                        editorDom.querySelector('.editor__info').remove();
                    } catch (e) {}
                    if (
                        val.indexOf('<!doctype') !== -1 ||
                        val.indexOf('<html') !== -1
                    ) {
                        const frag = document
                            .createRange()
                            .createContextualFragment(
                                infoTemplate(
                                    '&lt;body... content goes here, no need to add the surround &lt;!doctype... or &lt;html... elements'
                                )
                            );
                        editorDom.appendChild(frag.firstElementChild);
                    }*/
                }, debounceRate)
            )
        );

        eventDisposers.push(
            html.onDidFocusEditorText((e) => {
                var selection = html.getSelection();
                updateSelection(
                    selection.startLineNumber,
                    selection.startColumn
                );
            })
        );
        eventDisposers.push(
            html.onDidChangeCursorSelection((e) => {
                var selection = e.selection;
                updateSelection(
                    selection.startLineNumber,
                    selection.startColumn
                );
            })
        );
    };

    const bindJS = () => {
        eventDisposers.push(
            js.onDidChangeModelContent(
                debounce(function () {
                    dispatch('updateDocument', { js: js.getValue() });
                }, debounceRate)
            )
        );
        eventDisposers.push(
            js.onDidFocusEditorText((e) => {
                var selection = js.getSelection();
                updateSelection(
                    selection.startLineNumber,
                    selection.startColumn
                );
            })
        );
        eventDisposers.push(
            js.onDidChangeCursorSelection((e) => {
                var selection = e.selection;
                updateSelection(
                    selection.startLineNumber,
                    selection.startColumn
                );
            })
        );
    };

    const bindCSS = () => {
        eventDisposers.push(
            css.onDidChangeModelContent(
                debounce(function () {
                    const cssCode = css.getValue();
                    updateCSSInFrame(cssCode);
                    dispatch('updatePartialState', {
                        css: cssCode,
                        isDirty: true
                    });
                }, debounceRate)
            )
        );
        eventDisposers.push(
            css.onDidFocusEditorText((e) => {
                var selection = css.getSelection();
                updateSelection(
                    selection.startLineNumber,
                    selection.startColumn
                );
            })
        );
        eventDisposers.push(
            css.onDidChangeCursorSelection((e) => {
                var selection = e.selection;
                updateSelection(
                    selection.startLineNumber,
                    selection.startColumn
                );
            })
        );
    };
    const bindJSON = () => {
        eventDisposers.push(
            json.onDidChangeModelContent(
                debounce(function () {
                    dispatch('updateDocument', { json: json.getValue() });
                }, debounceRate)
            )
        );
        eventDisposers.push(
            json.onDidFocusEditorText((e) => {
                var selection = json.getSelection();
                updateSelection(
                    selection.startLineNumber,
                    selection.startColumn
                );
            })
        );
        eventDisposers.push(
            json.onDidChangeCursorSelection((e) => {
                var selection = e.selection;
                updateSelection(
                    selection.startLineNumber,
                    selection.startColumn
                );
            })
        );
    };

    const bindEditors = () => {
        eventDisposers = [];
        bindHTML();
        bindJS();
        bindCSS();
        bindJSON();
    };

    bindEditors();
    //SAVE
    html.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function () {
        save();
    });

    css.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function () {
        save();
    });
    js.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function () {
        save();
    });

    json.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function () {
        save();
    });

    //Menu
    html.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_P, function () {
        html.trigger('', 'editor.action.quickCommand');
    });

    css.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_P, function () {
        css.trigger('', 'editor.action.quickCommand');
    });

    js.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_P, function () {
        js.trigger('', 'editor.action.quickCommand');
    });

    json.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_P, function () {
        json.trigger('', 'editor.action.quickCommand');
    });

    document
        .querySelector('#saveButton')
        .addEventListener('click', function () {
            save();
        });

    document.querySelector('#menuSave').addEventListener('click', function () {
        save();
    });

    const formatFunction = (e) => {
        for (var editor in editors) {
            try {
                editors[editor].getAction('editor.action.formatDocument').run();
            } catch (e) {}
        }
        e.preventDefault();
    };

    formatDocumentButton.addEventListener('mousedown', formatFunction, false);
    formatDocumentButton.addEventListener('touchstart', formatFunction, false);
    formatDocumentButton1.addEventListener('mousedown', formatFunction, false);
    formatDocumentButton1.addEventListener('touchstart', formatFunction, false);

    fetchSnippetsForConfig(config, monaco);

    subscribe(
        'updateDocument',
        debounce(() => {
            updateDocument(store.state);
        }, debounceRate)
    );

    subscribe(
        'updateEditor',
        debounce(() => {
            unbindEditors();
            html.setValue(store.state.html);
            css.setValue(store.state.css);
            js.setValue(store.state.js);
            json.setValue(store.state.json);
            updateDocument(store.state);
            bindEditors();
        }, debounceRate)
    );

    subscribe('updateEditorConfig', (obj) => {
        html.updateOptions(obj);
        css.updateOptions(obj);
        js.updateOptions(obj);
        json.updateOptions(obj);
        if (typeof obj.theme !== 'undefined') {
            monaco.editor.setTheme(obj.theme);
        }
    });

    subscribe('updateModelConfig', (obj) => {
        html.getModel().updateOptions(obj);
        js.getModel().updateOptions(obj);
        json.getModel().updateOptions(obj);
        css.getModel().updateOptions(obj);
    });

    subscribe('updateDataTab', (obj) => {
        var tab = document.querySelector('.btn--tab[data-show="JSON"]');

        if (obj.showDataTab) {
            tab.style.display = 'inline-flex';
        } else {
            tab.style.display = 'none';
        }
    });

    var resizeTimeout;
    window.addEventListener('resize', function () {
        this.clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            html.layout();
            css.layout();
            js.layout();
            json.layout();
        }, 10);
    });
    return {
        js,
        css,
        html,
        json
    };
};

export { editorSetup, getEditor, getEditors };
