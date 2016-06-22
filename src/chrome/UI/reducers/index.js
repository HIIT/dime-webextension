import { combineReducers } from 'redux';

import PageDataReducer from './pageDataReducer'

const rootReducer = combineReducers({
    pageData: PageDataReducer
});

export default rootReducer;

