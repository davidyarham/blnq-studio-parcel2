import actions from './actions';
import mutations from './mutations';
import state from './state';
import Store from './store';

const store = new Store({
    actions,
    mutations,
    state
});

export const dispatch = (...args) => store.dispatch(...args);
export const subscribe = (...args) => store.events.subscribe(...args);

export default store;
