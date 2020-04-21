'use strict';
import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import ItemList from './container/ItemList';
const React = require('react');

class App extends React.Component {
	render() {
		return (
			<ItemList/>
		)
	}
}

export default hot(App);
