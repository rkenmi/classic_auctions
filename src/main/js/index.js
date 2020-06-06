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
import PrivacyPolicy from './container/PrivacyPolicy';
import About from './container/About';
import Footer from './container/Footer';
import ScrollToTop from './scrollToTop'

const store = configureStore();
ReactDOM.render(
  <Provider store={store}>
      <ConnectedRouter history={history}>
        <ScrollToTop>
          <div style={{position: 'relative', minHeight: '85vh'}}>
            <Switch>
              <Route path="/search" exact component={AuctionHouseWrapper} />
              <Route path="/" exact component={Home} />
              <Route path="/privacy" exact component={PrivacyPolicy} />
              <Route path="/about" exact component={About} />
              {/*Fallback route*/}
              <Route component={Error} />
            </Switch>
            <Route component={Footer}/>
          </div>
        </ScrollToTop>
      </ConnectedRouter>
  </Provider>,
  document.getElementById('react')
);

if (module.hot) {
  module.hot.accept();
}

