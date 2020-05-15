import {connect} from 'react-redux';

const React = require('react');
import {
  Container, DropdownButton,
  Dropdown,
  Nav,
  Navbar,
  Pagination,
  Table, Modal, Spinner
} from 'react-bootstrap';
import Item from './Item';
const qs = require('qs');
import {Desktop, Mobile, Tablet} from '../helpers/mediaTypes';
import {
  autocomplete,
  getEmptyLabelString, keysPressed, pickSuggestion,
  setCurrentFaction,
  setCurrentRealm,
  setError,
  search,
  updateSearchQuery, setMobileNavExpanded, updatePageNum, loadFromURL
} from '../actions/actions';
import AHSearchForm from './AHSearchForm';
import moment from 'moment';
import FactionDropdown from './widgets/FactionDropdown';
import RealmDropdown from './widgets/RealmDropdown';

class ItemList extends React.Component{
  constructor(props) {
    super(props);
    this.state = {};
    // Use URL parameters to perform search
    const query = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).q;
    const page = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).p;
    const currentRealm = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).realm;
    const currentFaction = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).faction;
    this.props.loadFromURLParams(query, page, currentRealm, currentFaction);
  }

  componentDidMount() {
    // if (this.props.query) {
    //   this.props.onSearch();
    //   return;
    // }

    // this.props.onSearch()
  }

  goToPage = (pageNum) => {
    if (pageNum < 0 || pageNum > this.props.page && this.getPagesRemaining() === 0) {
      return;
    }
    this.props.onSearch(pageNum);
  };

  getLastPage = () => {
    return this.props.page + Math.floor((this.props.items.length-1) / 15)
  };

  getPagesRemaining = () => {
    return Math.floor((this.props.items.length-1) / 15);
  };

  getPagesBefore = () => {
    return this.props.page;
  };

  renderPagination = () => {
    const {page} = this.props;


    return (
      <Pagination style={{flex: 1, justifyContent: 'center'}}>
        <Pagination.First className={'pagination-item'} onClick={() => this.goToPage(0)}/>
        <Pagination.Prev className={'pagination-item'} onClick={() => this.goToPage(page-1)}/>
        {page > 1 ?
          <Pagination.Item className={'pagination-item'} onClick={() => this.goToPage(page-2)}>{page - 1}</Pagination.Item>
          : null
        }
        {page > 0 ?
          <Pagination.Item className={'pagination-item'} onClick={() => this.goToPage(page-1)}>{page}</Pagination.Item>
          : null
        }
        <Pagination.Item className={'pagination-item current'}>{page + 1}</Pagination.Item>
        {this.getPagesRemaining() > 0 ?
          <Pagination.Item className={'pagination-item'} onClick={() => this.goToPage(page+1)}>{page+2}</Pagination.Item>
          : null
        }
        {this.getPagesRemaining() > 1 ?
          <Pagination.Item className={'pagination-item'} onClick={() => this.goToPage(page+2)}>{page+3}</Pagination.Item>
          : null
        }
        <Pagination.Next className={'pagination-item'} onClick={() => this.goToPage(page + 1)}/>
        <Pagination.Last className={'pagination-item'} onClick={() => this.goToPage(this.getLastPage())} />
      </Pagination>
    )
  };

  renderDesktopView() {
    const realms = this.props.realms || [];
    const {currentRealm, currentFaction} = this.props;

    return (
      <Navbar variant="dark" style={{display: 'flex'}}>
        <Navbar.Brand href="/">
          <h1>Classic Auctions</h1>
        </Navbar.Brand>
        <Nav style={{flex: 1, justifyContent: 'flex-end'}}>
          <AHSearchForm
            onSearch={this.props.onSearch}
            options={this.props.suggestions.map(m => ({...m, name: m.itemName}))}
            onInputChange={this.props.onHandleAutoComplete}
            onChange={this.props.onPickSuggestion}
            onKeyDown={this.props.onKeyPressed}
          />
          <RealmDropdown currentRealm={currentRealm} onSelect={this.props.setCurrentRealm} realms={realms}/>
          <FactionDropdown currentFaction={currentFaction} onSelect={this.props.setCurrentFaction}/>
        </Nav>
      </Navbar>
    );
  }

  renderMobileView() {
    const realms = this.props.realms || [];
    const {mobileNavExpanded, currentRealm, currentFaction} = this.props;
    return (
      <div style={{display: 'flex', flexDirection: 'column', marginTop: 75}}>
        <Navbar fixed={'top'} style={{display: 'flex'}} bg={'dark'} variant={'dark'} expand={'lg'}
                onToggle={()=> {this.props.setMobileNavExpanded(!mobileNavExpanded)} }
                expanded={this.props.mobileNavExpanded}>
          <Navbar.Brand>
            <h4>Classic Auctions</h4>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse style={{justifyContent: 'center', marginTop: 5}} id="basic-navbar-nav">
            <AHSearchForm
              onSearch={this.props.onSearch}
              options={this.props.suggestions.map(m => ({...m, name: m.itemName}))}
              onInputChange={this.props.onHandleAutoComplete}
              onChange={this.props.onPickSuggestion}
              onKeyDown={(e) => this.props.onKeyPressed(e, false)}
            />
            <div style={{display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'flex-start', marginTop: 10}}>
              <RealmDropdown style={{marginLeft: 0}} currentRealm={currentRealm} onSelect={this.props.setCurrentRealm} realms={realms}/>
              <FactionDropdown currentFaction={currentFaction} onSelect={this.props.setCurrentFaction}/>
            </div>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }

  renderFooter() {
    if (!this.props.items || this.props.items.length === 0) {
      return;
    }

    // ES documents have seconds as timestamp
    const dateStr = moment(new Date(this.props.items[0].timestamp)).fromNow();

    return (
      <div>
        {this.renderPagination()}
        <Container style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 25}}>
          <div style={{color: '#fff', fontSize: 10}}>Last data refresh: {dateStr}</div>
          <div style={{color: '#fff', fontSize: 10}}>Query response time: {this.props.queryMs} ms</div>
        </Container>
      </div>
    )
  }

  clearError = () => {
    this.props.setError(null, null);
  };

  renderTable(items) {
    if (this.props.loading) {
      return (
        <Container style={{flex: 1, display: 'flex', marginTop: 35, justifyContent: 'center'}}>
          <Spinner variant='info' animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </Container>
      )
    }

    if (this.props.hasSearched === false && items.length === 0) {
      return (
        <Container style={{flex: 1, display: 'flex', marginTop: 35, justifyContent: 'center', color: '#fff'}}>
          Welcome! Search for an item in the input box and select your realm/faction to get started.
        </Container>
      )
    }

    const renderResults = () => {
      if (items.length === 0) {
        return <tr><td colSpan={8} style={{textAlign: 'center'}}>No results</td></tr>
      } else {
        return items.slice(0, 15);
      }
    };

    return (
      <Table responsive striped bordered hover size="xs" variant={"dark"}>
        <tbody>
        <tr>
          <th>Qty</th>
          <th>Name</th>
          <th>iLvl</th>
          <th>Req</th>
          <th>Bid</th>
          <th>Buyout</th>
          <th>Seller</th>
          <th>Time Left</th>
        </tr>
        {renderResults()}
        </tbody>
      </Table>
    )
  }

  render() {
    const {loading} = this.props;
    const items = this.props.items.map(features =>
      <Item key={this.props.items.indexOf(features)} features={features}/>
    );

    return (
      <Container style={{display: 'flex', flexDirection: 'column'}}>
        <Desktop>{this.renderDesktopView()}</Desktop>
        <Tablet>{this.renderMobileView()}</Tablet>
        <Mobile>{this.renderMobileView()}</Mobile>
        <Modal show={!!this.props.errorMessage} onHide={this.clearError}>
          <Modal.Header closeButton>
            <Modal.Body>{this.props.errorMessage}</Modal.Body>
          </Modal.Header>
        </Modal>
        {this.renderTable(items)}
        {!loading && items.length > 0 ? this.renderFooter() : null}
      </Container>
    )
  }
}

function mapStateToProps(state) {
  return {
    searchBarRef: state.visibilityReducer.searchBarRef,
    loading: state.pageReducer.loading,
    hasSearched: state.pageReducer.hasSearched,
    queryMs: state.pageReducer.queryMs,
    page: state.pageReducer.page,
    realms: state.pageReducer.realms,
    items: state.pageReducer.items,
    query: state.pageReducer.query,
    suggestions: state.pageReducer.suggestions,
    currentRealm: state.pageReducer.currentRealm,
    currentFaction: state.pageReducer.currentFaction,
    mobileNavExpanded: state.pageReducer.mobileNavExpanded,
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
    getEmptyLabelString: () => {
      dispatch(getEmptyLabelString())
    },
    updateQuery: (q) => {
      dispatch(updateSearchQuery(q))
    },
    updatePageNum: (p) => {
      dispatch(updatePageNum(p))
    },
    onHandleAutoComplete: (evt) => {
      dispatch(autocomplete(evt))
    },
    onPickSuggestion: (evt) => {
      dispatch(pickSuggestion(evt))
    },
    onKeyPressed: (evt, isDesktop=true) => {
      dispatch(keysPressed(evt, isDesktop))
    },
    onSearch: (pageNum, overrideQuery=null) => {
      dispatch(search(pageNum, overrideQuery))
    },
    setMobileNavExpanded: (expanded) => {
      dispatch(setMobileNavExpanded(expanded))
    },
    setError: (title, message) => {
      dispatch(setError(title, message));
    },
    loadFromURLParams: (query, page, currentRealm, currentFaction) => {
      dispatch(loadFromURL(query, page, currentRealm, currentFaction));
    }
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ItemList)
