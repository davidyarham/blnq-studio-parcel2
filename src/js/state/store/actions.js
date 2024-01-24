export default {
    showConfig(context, payload) {
        context.commit('showConfig', payload);
    },
    showHistory(context, payload) {
        context.commit('showHistory', payload);
    },
    showPreferences(context, payload) {
        context.commit('showPreferences', payload);
    },
    showSnippet(context, payload) {
        context.commit('showSnippet', payload);
    },
    updateOptions(context, payload) {
        context.commit('updateOptions', payload);
    },
    showModal(context, payload) {
        context.commit('showModal', payload);
    },
    hideModal(context, payload) {
        context.commit('showModal', payload);
    },
    updateDocument(context, payload) {
        context.commit('updateDocument', payload);
    },
    savedSuccess(context, payload) {
        context.commit('savedSuccess', payload);
    },
    fetchSnippets(context, payload) {
        context.commit('fetchSnippets', payload);
    },
    setDisplayname(context, payload) {
        context.commit('setDisplayname', payload);
    },
    setIsPublic(context, payload) {
        context.commit('setIsPublic', payload);
    },
    setIsModule(context, payload) {
        context.commit('setIsModule', payload);
    },
    setLibraryInfo() {
        context.commit('setLibraryInfo', payload);
    },
    loadBlnq(context, payload) {
        context.commit('loadBlnq', payload);
    },
    updateSharingDetails(context, payload) {
        context.commit('updateSharingDetails', payload);
    },
    updateEditor(context, payload) {
        context.commit('updateEditor', payload);
    },
    setDirty(context, payload) {
        context.commit('setDirty', payload);
    },
    updateEditorConfig(context, payload) {
        context.commit('updateEditorConfig', payload);
    },
    updateModelConfig(context, payload) {
        context.commit('updateModelConfig', payload);
    },
    updateDataTab(context, payload) {
        context.commit('updateDataTab', payload);
    },
    userLoggedIn(context, payload) {
        context.commit('userLoggedIn', payload);
    },
    updatePartialState(context, payload) {
        context.commit('updatePartialState', payload);
    }
};
