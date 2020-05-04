import React from 'react';
import {Provider} from 'react-redux';
import configureStore from './createStore';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route , Switch} from 'react-router-dom'
import Home from './container/Home';
import Search from './container/Search';
import Error from './container/Error';

const store = configureStore();
ReactDOM.render(
  <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/search" exact component={Search} />
          <Route path="/" exact component={Home} />
          {/*Fallback route*/}
          <Route component={Error} />
        </Switch>
      </Router>
  </Provider>,
  document.getElementById('react')
);

if (module.hot) {
  module.hot.accept();
}

