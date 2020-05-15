'use strict';
import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import {
	Container,
	Dropdown,
	DropdownButton,
	Modal,
	Row
} from 'react-bootstrap';
import allianceIcon from '../../resources/static/images/alliance_50.png';
import hordeIcon from '../../resources/static/images/horde_50.png';
import {connect} from 'react-redux';
import {
	autocomplete,
	getEmptyLabelString,
	keysPressed,
	pickSuggestion,
	search,
	setCurrentFaction, setCurrentRealm,
	setError,
	setRealms
} from '../actions/actions';
import {Desktop, Mobile, Tablet} from '../helpers/mediaTypes';
import Search from './Search';
const React = require('react');
const client = require('../client');
import AHSearchForm from './AHSearchForm';
import RealmDropdown from './widgets/RealmDropdown';
import FactionDropdown from './widgets/FactionDropdown';
class Home extends React.Component {
  constructor(props) {
  	super(props);
  	this.state = {
  		query: '',
			suggestions: [],
			isLoadingSuggestions: false,
			openSuggestionsMenu: false,
  	};
	}

	componentDidMount() {
		client({method: 'GET', path: '/api/getRealms'}).done(response => {
			this.props.setRealms(response.entity)
		});
	}

	renderDesktopView = () => {
		const realms = this.props.realms || [];
		const {currentRealm, currentFaction} = this.props;

	  return (
			<Container style={{flex: 1, justifyContent: 'flex-end'}}>
				<Row style={{marginTop: '15%', marginBottom: 30, justifyContent: 'center'}}>
					<h1>{'Classic Auctions'}</h1>
				</Row>
				<Row style={{display: 'flex', justifyContent: 'center', marginBottom: 20}}>
            <RealmDropdown currentRealm={currentRealm} onSelect={this.props.setCurrentRealm} realms={realms}/>
            <FactionDropdown style={{marginRight: 10}} currentFaction={currentFaction} onSelect={this.props.setCurrentFaction}/>
						<AHSearchForm
							onSearch={this.props.onSearchFromHome}
							onChange={this.props.onPickSuggestionFromHome}
							onKeyDown={this.props.onKeyPressedFromHome}
							options={this.props.suggestions.map(m => ({...m, name: m.itemName}))}
							onInputChange={this.props.onHandleAutoComplete}
							typeaheadStyle={{flex: 1}}
						/>
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
		query: state.pageReducer.query,
		suggestions: state.pageReducer.suggestions,
		currentRealm: state.pageReducer.currentRealm,
		currentFaction: state.pageReducer.currentFaction,
		errorTitle: state.pageReducer.errorTitle,
		errorMessage: state.pageReducer.errorMessage
	}
}

function mapDispatchToProps(dispatch) {
	return {
		setCurrentRealm: (realm) => {
			dispatch(setCurrentRealm(realm));
		},
		setCurrentFaction: (faction) => {
			dispatch(setCurrentFaction(faction));
		},
		setRealms: (realms) => {
			dispatch(setRealms(realms));
		},
		setError: (title, message) => {
			dispatch(setError(title, message));
		},
		onHandleAutoComplete: (evt) => {
			dispatch(autocomplete(evt))
		},
		onPickSuggestionFromHome: (evt) => {
			dispatch(pickSuggestion(evt, true))
		},
		onKeyPressedFromHome: (evt) => {
			dispatch(keysPressed(evt, true, true))
		},
		onSearchFromHome: (pageNum) => {
			dispatch(search(pageNum, null, true))
		},
		getEmptyLabelString: () => {
			dispatch(getEmptyLabelString())
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(hot(Home));
