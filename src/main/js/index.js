import App from './App';
import React from 'react';
const ReactDOM = require('react-dom');

ReactDOM.render(
  <App/>,
  document.getElementById('react')
);

if (module.hot) {
  module.hot.accept();
}

