/*
 * action types
 */
import { push } from 'connected-react-router'
import {hideSuggestionItemsTooltip, normalizeNumber, normalizeParam, objectFlip} from '../helpers/searchHelpers';
import {SORT_FIELDS, SORT_ORDERS} from '../helpers/constants';
const client = require('../client');

export const SET_REALMS = 'SET_REALMS';
export const SET_SEARCH_BAR_REF = 'SET_SEARCH_BAR_REF';
export const SET_CURRENT_REALM = 'SET_CURRENT_REALM';
export const SET_CURRENT_FACTION = 'SET_CURRENT_FACTION';
export const SET_ERROR = 'SET_ERROR';
export const TOGGLE_TODO = 'TOGGLE_TODO'
export const OPEN_GRAPH_MODAL = 'OPEN_GRAPH_MODAL'
export const HIDE_GRAPH_MODAL = 'HIDE_GRAPH_MODAL'
export const SET_TIMESPAN = 'SET_TIMESPAN'
export const LOAD_SPINNER = 'LOAD_SPINNER'
export const LOAD_GRAPH_SPINNER = 'LOAD_GRAPH_SPINNER'
export const ADD_SORT = 'ADD_SORT';
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER'
export const PICK_SUGGESTION_EVENT = 'PICK_SUGGESTION_EVENT'
export const ENTER_BTN_PRESSED_EVENT = 'ENTER_BTN_PRESSED_EVENT'
export const UPDATE_SEARCH_RESULTS = 'UPDATE_SEARCH_RESULTS'
export const UPDATE_GRAPH_DATA = 'UPDATE_GRAPH_DATA'
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

export function setTimespan(timespan) {
  return { type: SET_TIMESPAN, timespan }
}

export function setError(title, message) {
  return { type: SET_ERROR, title, message }
}

export function addSort(field, order) {
  return { type: ADD_SORT, field, order }
}

export function setSearchBarRef(ref) {
  return { type: SET_SEARCH_BAR_REF, ref }
}

export function toggleTodo(index) {
  return { type: TOGGLE_TODO, index }
}

export function pickSuggestionEvent() {
  // For logging purposes
  return { type: PICK_SUGGESTION_EVENT }
}

export function enterBtnPressedEvent() {
  // For logging purposes
  return { type: ENTER_BTN_PRESSED_EVENT }
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

export function updateGraphData(data) {
  return { type: UPDATE_GRAPH_DATA, data }
}

export function openGraphModal(item) {
  return { type: OPEN_GRAPH_MODAL, item }
}

export function hideGraphModal() {
  return { type: HIDE_GRAPH_MODAL }
}

export function loadSpinner() {
  return { type: LOAD_SPINNER }
}

export function loadGraphSpinner() {
  return { type: LOAD_GRAPH_SPINNER }
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

export function loadFromURL(query, page, currentRealm, currentFaction, sortField=null, sortFieldOrder=null) {
  return function(dispatch, getState) {
    let promises = [
      dispatch(updateSearchQuery(query)),
      dispatch(updatePageNum(page)),
      dispatch(setCurrentRealm(currentRealm)),
      dispatch(setCurrentFaction(currentFaction))
    ];

    if (objectFlip(SORT_FIELDS)[sortField] && objectFlip(SORT_ORDERS)[sortFieldOrder]){
      promises.push(dispatch(addSort(sortField, sortFieldOrder)))
    }

    return Promise.all(promises).then(() => {
      // All done
      dispatch(search(page, query, false));
    }, (err) => {
      // Error
      dispatch(setError("Invalid URL", err))
    });
  }
}

export function searchOnSetSort(field, order) {
  return function(dispatch, getState) {
    return Promise.all([
      dispatch(addSort(field, order)),
    ]).then(() => {
      dispatch(search());
    }, (err) => {
      // Error
      dispatch(setError("Error trying to search after sorting by " +  field + " and order " + order, err))
    });
  }
}


export function searchOnSetRealmAndFaction(currentRealm, currentFaction) {
  return function(dispatch, getState) {
    return Promise.all([
      dispatch(setCurrentRealm(currentRealm)),
      dispatch(setCurrentFaction(currentFaction))
    ]).then(() => {
      const {pageReducer} = getState();
      const {query: q, currentRealm: r, currentFaction: f} = pageReducer;
      // All done
      const isValid = searchIsValid(null, q, r, f);
      if (isValid) {
        dispatch(search(0, q));
      }
    }, (err) => {
      // Error
      dispatch(setError("Error trying to search after picking realm + faction", err))
    });
  }
}

function searchIsValid(dispatch, query, currentRealm, currentFaction) {
  if (query === '' || query === undefined) {
    if (dispatch) {
      dispatch(setError('Error', 'Please enter a search query'));
    }
    return false;
  } else if (currentRealm == null || currentFaction == null) {
    if (dispatch) {
      dispatch(setError('Error', 'Please specify both Realm and Faction.'));
    }
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
    const {currentRealm, currentFaction, sort} = pageReducer;
    const query = overrideQuery === null ? pageReducer.query : overrideQuery;

    if (!searchIsValid(dispatch, query, currentRealm, currentFaction)) {
      return;
    }
    const formattedRealm = currentRealm.replace(" ", "");

    let p = normalizeNumber(pageNum),
      q = normalizeParam(query),
      r = normalizeParam(formattedRealm),
      f = normalizeParam(currentFaction),
      sp = convertSortParamsToURLParams(sort)
    ;

    if (pushHistory) {
      dispatch(push('/search?q=' + q + '&p=' + p + '&realm=' + r + '&faction=' + f + sp))
    }
    dispatch(loadSpinner());
    dispatch(setMobileNavExpanded(false));
    return requestSearch(p, q, r, f, sp).then(
      (done) => dispatch(updateSearchResults(done.entity)),
      (error) => dispatch(setError('Search failed', error)),
    );
  };
}

export function setTimespanOnGraph(timespan, item) {
  return function(dispatch, getState) {
    const {pageReducer} = getState();
    const {currentRealm, currentFaction, sort} = pageReducer;

    if (!searchIsValid(dispatch, 'IGNORE', currentRealm, currentFaction)) {
      return;
    }
    const formattedRealm = currentRealm.replace(" ", "");

    let r = normalizeParam(formattedRealm),
      f = normalizeParam(currentFaction)
    ;

    dispatch(setTimespan(timespan));
    return requestMarketpriceData(timespan, r, f, item.id).then(
      (done) => dispatch(updateGraphData(done.entity)),
      (error) => dispatch(setError('Graph retrieval failed', error)),
    );
  };
}

export function getMarketpriceData(item, timespan=0)  {
  return function(dispatch, getState) {
    const {pageReducer} = getState();
    const {currentRealm, currentFaction, sort} = pageReducer;

    if (!searchIsValid(dispatch, 'IGNORE', currentRealm, currentFaction)) {
      return;
    }
    const formattedRealm = currentRealm.replace(" ", "");

    let r = normalizeParam(formattedRealm),
      f = normalizeParam(currentFaction)
    ;

    dispatch(openGraphModal(item));
    return requestMarketpriceData(timespan, r, f, item.id).then(
      (done) => dispatch(updateGraphData(done.entity)),
      (error) => dispatch(setError('Graph retrieval failed', error)),
    );
  };
}

export function convertSortParamsToURLParams(sortParams) {
  if (Object.keys(sortParams).length === 0) {
    return '';
  }

  let sortFieldParams = [];
  let sortFieldOrderParams = [];

  sortFieldParams.push(`&sortField=${sortParams.field}`);
  sortFieldOrderParams.push(`&sortFieldOrder=${sortParams.order}`);

  return sortFieldParams.join('') + sortFieldOrderParams.join('');
}

const requestSearch = (p=0, q, r, f, sp) => {
  return client({
    method: 'GET',
    path: '/api/search?q=' + q + '&p=' + p + '&realm=' + r + '&faction=' + f + sp
  });
};

const requestMarketpriceData = (timespan=0, r, f, itemId) => {
  return client({
    method: 'GET',
    path: '/api/marketprice?timespan=' + timespan + '&realm=' + r + '&faction=' + f + '&itemId=' + itemId
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
    dispatch(pickSuggestionEvent());
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
      dispatch(enterBtnPressedEvent());

      if (fromHomePage) {
        dispatch(searchFromHomePage());
        return;
      }

      if (isDesktop) {
        hideSuggestionItemsTooltip();
      }

      // Hide suggestion dropdown
      const {visibilityReducer} = getState();
      if (visibilityReducer.searchBarRef) {
        visibilityReducer.searchBarRef.blur();
        if (visibilityReducer.searchBarRef.state.activeItem && visibilityReducer.searchBarRef.state.isFocused) {
          // no-op; let pickSuggestion do the work.
          return;
        }
      }

      dispatch(search(0, null));
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
