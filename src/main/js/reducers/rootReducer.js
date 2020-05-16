import { combineReducers } from 'redux'
import {
  ADD_TODO,
  TOGGLE_TODO,
  SET_VISIBILITY_FILTER,
  VisibilityFilters,
  SET_REALMS,
  SET_ERROR,
  SET_SEARCH_BAR_REF,
  UPDATE_SEARCH_RESULTS,
  UPDATE_SEARCH_SUGGESTIONS,
  UPDATE_SEARCH_QUERY, SET_CURRENT_REALM, SET_CURRENT_FACTION, LOAD_SPINNER, MOBILE_NAV_EXPANDED, UPDATE_PAGE_NUM
} from '../actions/actions'
const { SHOW_ALL } = VisibilityFilters;
import { connectRouter } from 'connected-react-router'

function visibilityReducer(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter;
    case SET_SEARCH_BAR_REF:
      return {
        ...state,
        searchBarRef: action.ref
      };
    default:
      return state
  }
}

function pageReducer(state = {suggestions: [], items: [], hasSearched: false, query: '', loading: false, mobileNavExpanded: false}, action) {
  switch (action.type) {
    case SET_REALMS:
      return {
        ...state,
        realms: action.realms
      };
    case UPDATE_SEARCH_RESULTS:
      const {items, page, queryMs} = action.results;
      return {
        ...state,
        items,
        page,
        queryMs,
        loading: false,
        hasSearched: true
      };
    case UPDATE_SEARCH_SUGGESTIONS:
      return {
        ...state,
        suggestions: action.suggestions
      };
    case UPDATE_SEARCH_QUERY:
      return {
        ...state,
        query: action.query
      };
    case SET_CURRENT_REALM:
      return {
        ...state,
        currentRealm: action.currentRealm
      };
    case SET_CURRENT_FACTION:
      return {
        ...state,
        currentFaction: action.currentFaction
      };
    case UPDATE_PAGE_NUM:
      return {
        ...state,
        page: action.page
      };
    case LOAD_SPINNER:
      return {
        ...state,
        loading: true,
      };
    case TOGGLE_TODO:
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: !todo.completed
          })
        }
        return todo
      });
    case MOBILE_NAV_EXPANDED:
      return {
        ...state,
        mobileNavExpanded: action.expanded,
      };
    case SET_ERROR:
      return {
        ...state,
        errorTitle: action.title,
        errorMessage: action.message
      };
    default:
      return state
  }
}

const rootReducer = (history) => combineReducers({
  router: connectRouter(history),
  pageReducer,
  visibilityReducer
});

export default rootReducer;