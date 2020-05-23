import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import {
	Container,
	Modal,
	Row
} from 'react-bootstrap';
import {connect} from 'react-redux';
import {
	autocomplete,
	getEmptyLabelString,
	keysPressed,
	pickSuggestion,
	searchFromHomePage, searchOnSetRealmAndFaction,
	setCurrentFaction, setCurrentRealm,
	setError,
	setRealms
} from '../actions/actions';
import {Desktop, Mobile, Tablet} from '../helpers/mediaTypes';
import Search from './AuctionHouseWrapper';
const React = require('react');
const client = require('../client');
import AHSearchForm from './AuctionHouseSearch';
import RealmDropdown from './widgets/RealmDropdown';
import {withRouter} from 'react-router-dom';
import {Logo} from '../helpers/domHelpers';
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
					<Logo isHomePage={true}/>
				</Row>
				<Row style={{display: 'flex', justifyContent: 'center', marginBottom: 20}}>
            <RealmDropdown style={{marginRight: 10}}
													 currentRealm={currentRealm}
													 currentFaction={currentFaction}
													 onSelectRealmAndFaction={this.props.setCurrentRealmAndFactionAndSearch}
													 onSelectRealm={this.props.setCurrentRealm}
													 onSelectFaction={this.props.setCurrentFaction}
													 realms={realms}/>
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
		setCurrentRealmAndFactionAndSearch: (realm, faction) => {
			dispatch(searchOnSetRealmAndFaction(realm, faction));
		},
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
			dispatch(searchFromHomePage())
		},
		getEmptyLabelString: () => {
			dispatch(getEmptyLabelString())
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(hot(Home));
