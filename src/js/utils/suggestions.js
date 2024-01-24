import * as monaco from 'monaco-editor';
import { libraries } from '../../../config/default';
import store, { subscribe } from '../state/store';



// keeping it real simple.
// Snippets are just loaded within the modules scope, we pass the monaco instance in to the register method
// Dispose of them internally within this module too
// at some point this will probably have to get a bit more complex but why optimize prematurely... :)
let currentLibrary = store.state.library;
const suggestionBuilder = (suggestion) => {
    const kind = monaco.languages.CompletionItemKind.Snippet,
        insertTextRules =
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    return { kind, insertTextRules, ...suggestion };
};

let activeSnippetProviders = [];
const registerSnippetProvider = (language, suggestions) => {
    suggestions = [...suggestions.map(suggestionBuilder)];

    const disposer = monaco.languages.registerCompletionItemProvider(language, {
        provideCompletionItems: (model, position) => {
            return {
                suggestions: suggestions.map((s) => {
                    const { kind, insertTextRules, label, insertText } = s;
                    return { kind, insertTextRules, label, insertText };
                })
            };
        }
    });
    activeSnippetProviders.push(disposer);
};

export const dispose = () => {
    activeSnippetProviders.forEach((disposer) => {
        disposer.dispose();
    });
};

export const fetchSnippetsForConfig = async (library) => {
    currentLibrary = library;
    if (!!library && libraries.find((lib) => lib.id === library)) {
        const response = await fetch(`/api/v1/snippets/${library}`);
        const result = await response.json();
        dispose();
        if (result.ok) {
            Object.keys(result.snippets).forEach((lang) => {
                registerSnippetProvider(lang, result.snippets[lang]);
            });
        }
    } else {
        dispose();
    }
};

subscribe('updateDocument', () => {
    if (currentLibrary !== store.state.library) {
        fetchSnippetsForConfig(store.state.library);
    }
});
