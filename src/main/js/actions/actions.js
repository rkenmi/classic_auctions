/*
 * action types
 */

export const SET_REALMS = 'SET_REALMS';
export const SET_CURRENT_REALM = 'SET_CURRENT_REALM';
export const SET_ERROR = 'SET_ERROR';
export const TOGGLE_TODO = 'TOGGLE_TODO'
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER'

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

export function setError(title, message) {
  return { type: SET_ERROR, title, message }
}

export function toggleTodo(index) {
  return { type: TOGGLE_TODO, index }
}

export function setVisibilityFilter(filter) {
  return { type: SET_VISIBILITY_FILTER, filter }
}