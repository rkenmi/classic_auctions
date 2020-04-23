import React from 'react';
import {Provider} from 'react-redux';
import configureStore from './createStore';
const ReactDOM = require('react-dom');
import { BrowserRouter as Router, Route , Switch} from 'react-router-dom'
import Home from './container/Home';
import Search from './container/Search';

const store = configureStore();
ReactDOM.render(
  <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/search" component={Search} />
          <Route path="/" component={Home} />
        </Switch>
      </Router>
  </Provider>,
  document.getElementById('react')
);

if (module.hot) {
  module.hot.accept();
}

