/*
 * action types
 */
import { push } from 'connected-react-router'
import {hideSuggestionItemsTooltip, normalizeNumber, normalizeParam} from '../helpers/searchHelpers';
const client = require('../client');

export const SET_REALMS = 'SET_REALMS';
export const SET_SEARCH_BAR_REF = 'SET_SEARCH_BAR_REF';
export const SET_CURRENT_REALM = 'SET_CURRENT_REALM';
export const SET_CURRENT_FACTION = 'SET_CURRENT_FACTION';
export const SET_ERROR = 'SET_ERROR';
export const TOGGLE_TODO = 'TOGGLE_TODO'
export const LOAD_SPINNER = 'LOAD_SPINNER'
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER'
export const UPDATE_SEARCH_RESULTS = 'UPDATE_SEARCH_RESULTS'
export const UPDATE_SEARCH_SUGGESTIONS = 'UPDATE_SEARCH_SUGGESTIONS'
export const UPDATE_SEARCH_QUERY = 'UPDATE_SEARCH_QUERY'
export const UPDATE_PAGE_NUM = 'UPDATE_PAGE_NUM'
export const MOBILE_NAV_EXPANDED = 'MOBILE_NAV_EXPANDED'

/*
 * other constants
 */

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
};

/*
 * action creators
 */

export function setRealms(realms) {
  return { type: SET_REALMS, realms }
}

export function setCurrentRealm(currentRealm) {
  return { type: SET_CURRENT_REALM, currentRealm }
}

export function setCurrentFaction(currentFaction) {
  return { type: SET_CURRENT_FACTION, currentFaction }
}

export function setError(title, message) {
  return { type: SET_ERROR, title, message }
}

export function setSearchBarRef(ref) {
  return { type: SET_SEARCH_BAR_REF, ref }
}

export function toggleTodo(index) {
  return { type: TOGGLE_TODO, index }
}

export function setMobileNavExpanded(expanded) {
  return { type: MOBILE_NAV_EXPANDED, expanded }
}

export function setVisibilityFilter(filter) {
  return { type: SET_VISIBILITY_FILTER, filter }
}

export function updateSearchResults(results) {
  return { type: UPDATE_SEARCH_RESULTS, results }
}

export function loadSpinner() {
  return { type: LOAD_SPINNER }
}

export function updateSearchSuggestions(suggestions) {
  return { type: UPDATE_SEARCH_SUGGESTIONS, suggestions }
}

export function updateSearchQuery(query) {
  return { type: UPDATE_SEARCH_QUERY, query }
}

export function updatePageNum(page) {
  return { type: UPDATE_PAGE_NUM, page }
}

export function loadFromURL(query, page, currentRealm, currentFaction) {
  return function(dispatch, getState) {
    return Promise.all([
      dispatch(updateSearchQuery(query)),
      dispatch(updatePageNum(page)),
      dispatch(setCurrentRealm(currentRealm)),
      dispatch(setCurrentFaction(currentFaction))
    ]).then(() => {
      // All done
      dispatch(search(page, query, false));
    }, (err) => {
      // Error
      dispatch(setError("Invalid URL", err))
    });
  }
}

function searchIsValid(dispatch, query, currentRealm, currentFaction) {
  if (query === '' || query === undefined) {
    dispatch(setError('Error', 'Please enter a search query'));
    return false;
  } else if (currentRealm == null || currentFaction == null) {
    dispatch(setError('Error', 'Please specify both Realm and Faction.'));
    return false;
  }
  return true;
}

export function searchFromHomePage(overrideQuery=null) {
  return function(dispatch, getState) {
    const {pageReducer} = getState();
    const {currentRealm, currentFaction} = pageReducer;
    const query = overrideQuery === null ? pageReducer.query : overrideQuery;

    if (!searchIsValid(dispatch, query, currentRealm, currentFaction)) {
      return;
    }

    const formattedRealm = currentRealm.replace(" ", "");
    dispatch(push('/search?q=' + query + '&p=0&realm=' + formattedRealm + '&faction=' + currentFaction));
  };
}

export function search(pageNum=0, overrideQuery=null, pushHistory=true)  {
  // We can invert control here by returning a function - the "thunk".
  // When this function is passed to `dispatch`, the thunk middleware will intercept it,
  // and call it with `dispatch` and `getState` as arguments.
  // This gives the thunk function the ability to run some logic, and still interact with the store.
  return function(dispatch, getState) {
    const {pageReducer} = getState();
    const {currentRealm, currentFaction} = pageReducer;
    const query = overrideQuery === null ? pageReducer.query : overrideQuery;

    if (!searchIsValid(dispatch, query, currentRealm, currentFaction)) {
      return;
    }
    const formattedRealm = currentRealm.replace(" ", "");

    if (pushHistory) {
      dispatch(push('/search?q=' + query + '&p=0&realm=' + formattedRealm + '&faction=' + currentFaction));
    }
    dispatch(loadSpinner());
    dispatch(setMobileNavExpanded(false));
    return requestSearch(dispatch, pageNum, query, formattedRealm, currentFaction).then(
      (done) => dispatch(updateSearchResults(done.entity)),
      (error) => dispatch(setError('Search failed', error)),
    );
  };
}

const requestSearch = (dispatch, pageNum=0, query, formattedRealm, currentFaction) => {
  let p = normalizeNumber(pageNum),
    q = normalizeParam(query),
    r = normalizeParam(formattedRealm),
    f = normalizeParam(currentFaction);

  return client({
    method: 'GET',
    path: '/api/search?q=' + q + '&p=' + p + '&realm=' + r + '&faction=' + f
  });
};

export function autocomplete(event) {
  // We can invert control here by returning a function - the "thunk".
  // When this function is passed to `dispatch`, the thunk middleware will intercept it,
  // and call it with `dispatch` and `getState` as arguments.
  // This gives the thunk function the ability to run some logic, and still interact with the store.
  return function(dispatch, getState) {
    const query = event;
    dispatch(updateSearchQuery(query));

    const {pageReducer} = getState();
    const {currentRealm, currentFaction} = pageReducer;
    if (!currentRealm || !currentFaction) {
      return;
    }

    const formattedRealm = currentRealm.replace(" ", "");

    return requestAutoComplete(query, formattedRealm, currentFaction).then(
      (done) => dispatch(updateSearchSuggestions(done.entity)),
      (error) => dispatch(setError('Suggestion fetching failed', error)),
    );
  };
}

const requestAutoComplete = (query, formattedRealm, currentFaction) => {
  const q = normalizeParam(query), r = normalizeParam(formattedRealm), f = normalizeParam(currentFaction);
  return client({
    method: 'GET',
    path: '/api/autocomplete?q=' + q + '&realm=' + r + '&faction=' + f
  });
};

export function pickSuggestion(e, fromHomePage=false) {
  return function(dispatch) {
    if (e.length === 0) {
      return;
    }
    dispatch(updateSearchQuery(e[0].name));

    if (fromHomePage) {
      dispatch(searchFromHomePage(e[0].name));
    } else {
      dispatch(search(0, e[0].name));
    }
  };
}

export function keysPressed(e, isDesktop=true, fromHomePage=false) {
  return function(dispatch, getState) {
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      if (fromHomePage) {
        dispatch(searchFromHomePage());
        return;
      }

      dispatch(search(0, null));
      // Hide suggestion dropdown
      const {visibilityReducer} = getState();
      if (visibilityReducer.searchBarRef) {
        visibilityReducer.searchBarRef.blur();
      }

      if (isDesktop) {
        hideSuggestionItemsTooltip();
      }
    }
  };
}

export function getEmptyLabelString() {
  return function(dispatch, getState) {
    const {pageReducer} = getState();
    if (!pageReducer.currentRealm || !pageReducer.currentFaction) {
      return 'Please select a realm and faction.'
    }
    return 'No matches found.'
  };
}
