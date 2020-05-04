'use strict';
import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Container, Dropdown, DropdownButton, Form, FormControl, Modal, Nav, Navbar, Row} from 'react-bootstrap';
import allianceIcon from '../../resources/static/images/alliance_50.png';
import hordeIcon from '../../resources/static/images/horde_50.png';
import {connect} from 'react-redux';
import {setError, setRealms} from '../actions/actions';
import {Desktop, Mobile, Tablet} from '../helpers/mediaTypes';
import Search from './Search';
const React = require('react');
const client = require('../client');

class Home extends React.Component {
  constructor(props) {
  	super(props);
  	this.state = {query: ''};
	}

	componentDidMount() {
		client({method: 'GET', path: '/api/getRealms'}).done(response => {
			this.props.setRealms(response.entity)
		});
	}

	onSearch = () => {
		const {query, currentRealm, currentFaction} = this.state;

		if (query === '') {
			this.props.setError('Error', 'Please enter a search query.');
			return;
		}
		if (currentRealm == null || currentFaction == null) {
			this.props.setError('Error', 'Please specify both Realm and Faction.');
			return;
		}

		const formattedRealm = currentRealm.replace(" ", "");
		this.props.history.push('/search?q=' + this.state.query + '&p=0&realm=' + formattedRealm + '&faction=' + currentFaction);
	};

	handleChange = (event) => {
		// let fieldName = event.target.name;
		let query = event.target.value;
		this.setState({query});
	};

	renderDesktopView = () => {
		const realms = this.props.realms || [];

	  return (
			<Container style={{flex: 1, justifyContent: 'flex-end'}}>
				<Row style={{marginTop: '15%', marginBottom: 30, justifyContent: 'center'}}>
					<h1>{'Classic Auctions'}</h1>
				</Row>
				<Row style={{marginBottom: 20, justifyContent: 'center'}}>
					<Form style={{width: 350}} onSubmit={(e) => {e.preventDefault(); this.onSearch()}}>
						<FormControl type="text" placeholder="Search" onChange={this.handleChange}/>
					</Form>
					<DropdownButton variant='info' id="dropdown-item-button" title={realms.includes(this.state.currentRealm) ? this.state.currentRealm : "Realm"} style={{marginLeft: 10}}>
						{realms.map((realm) => {
							return (
								<Dropdown.Item key={realms.indexOf(realm)} as="button" onSelect={() => {this.setState({currentRealm: realm})}}>{realm}</Dropdown.Item>
							);
						})}
					</DropdownButton>
					<DropdownButton variant='info' id="dropdown-item-button" title={this.state.currentFaction || "Faction"} style={{marginLeft: 10}}>
						<Dropdown.Item as="button" onSelect={() => {this.setState({currentFaction: 'Alliance'})}}><img src={allianceIcon}/> Alliance</Dropdown.Item>
						<Dropdown.Item as="button" onSelect={() => {this.setState({currentFaction: 'Horde'})}}><img src={hordeIcon}/> Horde</Dropdown.Item>
					</DropdownButton>
				</Row>
			</Container>
    )
	};

	renderMobileView = () => {
			return <Search {...this.props} />
	};

	clearError = () => {
		this.props.setError(null, null);
	};

	render() {
		return (
		  <div>
				<Desktop>{this.renderDesktopView()}</Desktop>
				<Tablet>{this.renderMobileView()}</Tablet>
				<Mobile>{this.renderMobileView()}</Mobile>
				<Modal show={!!this.props.errorMessage} onHide={this.clearError}>
					<Modal.Header closeButton>
						<Modal.Body>{this.props.errorMessage}</Modal.Body>
					</Modal.Header>
				</Modal>
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {
		realms: state.pageReducer.realms,
		errorTitle: state.pageReducer.errorTitle,
		errorMessage: state.pageReducer.errorMessage
	}
}

function mapDispatchToProps(dispatch) {
	return {
		setRealms: (realms) => {
			dispatch(setRealms(realms));
		},
		setError: (title, message) => {
			dispatch(setError(title, message));
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(hot(Home));
