import { combineReducers } from 'redux'
import {
  ADD_TODO,
  TOGGLE_TODO,
  SET_VISIBILITY_FILTER,
  VisibilityFilters, SET_REALMS, SET_ERROR
} from '../actions/actions'
const { SHOW_ALL } = VisibilityFilters;

function visibilityReducer(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter;
    default:
      return state
  }
}

function pageReducer(state = [], action) {
  switch (action.type) {
    case SET_REALMS:
      return {
        ...state,
        realms: action.realms
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

const rootReducer = combineReducers({
  pageReducer,
  visibilityReducer
});

export default rootReducer;