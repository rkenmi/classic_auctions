import { applyMiddleware, createStore } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers/rootReducer';
import { routerMiddleware } from 'connected-react-router'
import {createBrowserHistory} from 'history';

export const history = createBrowserHistory();

export default function configureStore(preloadedState) {
  const middlewares = [thunkMiddleware, routerMiddleware(history)];

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(loggerMiddleware);
  }
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer];
  const composedEnhancers = composeWithDevTools(...enhancers);

  const store = createStore(rootReducer(history), preloadedState, composedEnhancers);

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers/rootReducer', () => store.replaceReducer(rootReducer))
  }
  return store
}