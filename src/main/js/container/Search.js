'use strict';
import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import ItemList from './ItemList';
import {connect} from 'react-redux';
import {setRealms} from '../actions/actions';
const React = require('react');
const client = require('../client');

class Search extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		client({method: 'GET', path: '/api/getRealms'}).done(response => {
		  this.props.setRealms(response.entity)
		});
	}

	render() {
		return (
			<ItemList {...this.props}/>
		)
	}
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    setRealms: (realms) => {
    		dispatch(setRealms(realms));
		}
	}
}


export default connect(mapStateToProps, mapDispatchToProps)(hot(Search));
