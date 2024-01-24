export default {
    showConfig(state, payload) {
        state.showConfig = payload;
        return state;
    },
    showHistory(state, payload) {
        state.showHistory = payload;
        return state;
    },
    showPreferences(state, payload) {
        state.showPreferences = payload;
        return state;
    },
    showSnippet(state, payload) {
        state.showSnippet = payload;
        return state;
    },
    updateOptions(state) {
        return state;
    },
    showModal(state) {
        return state;
    },
    hideModal(state) {
        return state;
    },
    updateDocument(state, payload) {
        let isDirtyVar = true;
        if (typeof payload !== 'undefined') {
            if (typeof payload.isDirty !== 'undefined') {
                isDirtyVar = payload.isDirty;
            }
        }
        return {
            ...state,
            ...payload,
            isDirty: isDirtyVar
        };
    },
    savedSuccess(state, payload) {
        state.isDirty = false;
        state.hasBeenSaved = true;
        state.blnqName = payload.blnqName;
        return state;
    },
    fetchSnippets(state) {
        return state;
    },
    setDisplayname(state, payload) {
        state.displayname = payload;
        return state;
    },
    setIsPublic(state, payload) {
        state.ispublic = payload;
        return state;
    },
    setIsModule(state, payload) {
        state.module = payload;
        return state;
    },
    setLibraryInfo() {
        return state;
    },
    loadBlnq(state, payload) {
        return { ...state, ...payload, hasLoaded: true };
    },
    updateEditor(state, payload) {
        state.isDirty = true;
        for (var prop in payload) {
            state[prop] = payload[prop] || '';
        }
        return state;
    },
    setDirty(state) {
        state.isDirty = true;
        return state;
    },
    updateEditorConfig(state, payload) {
        return payload;
    },
    updateModelConfig(state, payload) {
        return payload;
    },
    updateDataTab(state, payload) {
        return payload;
    },
    updateSharingDetails(state, payload) {
        state = { ...state, ...payload };
        return state;
    },
    userLoggedIn(state, payload) {
        state.user = payload;
        return state;
    },
    updatePartialState(state, payload) {
        for (var key in payload) {
            state[key] = payload[key];
        }
        return state;
    }
};
