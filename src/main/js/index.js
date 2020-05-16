import React from 'react';
import {Provider} from 'react-redux';
import configureStore from './createStore';
import ReactDOM from 'react-dom';
import { Route , Switch} from 'react-router-dom'
import Home from './container/Home';
import AuctionHouseWrapper from './container/AuctionHouseWrapper';
import Error from './container/Error';
import { ConnectedRouter } from 'connected-react-router'
import {history} from './createStore';

const store = configureStore();
ReactDOM.render(
  <Provider store={store}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/search" exact component={AuctionHouseWrapper} />
          <Route path="/" exact component={Home} />
          {/*Fallback route*/}
          <Route component={Error} />
        </Switch>
      </ConnectedRouter>
  </Provider>,
  document.getElementById('react')
);

if (module.hot) {
  module.hot.accept();
}

