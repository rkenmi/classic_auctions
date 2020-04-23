'use strict';
import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import ItemList from './ItemList';
const React = require('react');

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {query: ''};
	}

	render() {
		return (
			<ItemList {...this.props}/>
		)
	}
}

export default hot(Search);
