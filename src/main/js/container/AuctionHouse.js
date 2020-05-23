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
import {Desktop, Mobile, Tablet} from '../helpers/mediaTypes';
import {
  autocomplete,
  getEmptyLabelString, keysPressed, pickSuggestion,
  setCurrentFaction,
  setCurrentRealm,
  setError,
  search,
  updateSearchQuery, setMobileNavExpanded, updatePageNum, loadFromURL, searchOnSetRealmAndFaction
} from '../actions/actions';
import AHSearchForm from './AuctionHouseSearch';
import moment from 'moment';
import RealmDropdown from './widgets/RealmDropdown';
import AuctionTable from './widgets/AuctionTable';
import {getParamsFromURL, normalizeParam} from '../helpers/searchHelpers';
import {MISC_URL} from '../helpers/endpoints';
import {Logo} from '../helpers/domHelpers';
const ALLIANCE_ICON = MISC_URL + 'alliance_50.png';
const HORDE_ICON = MISC_URL + 'horde_50.png';

class AuctionHouse extends React.Component{
  constructor(props) {
    super(props);
    this.state = {};
    // Use URL parameters to perform search
    const args = getParamsFromURL(this.props.location.search);
    if (args[0] && args[1] && args[2] && args[3]) {
      this.props.loadFromURLParams(...args);
    }

    // preload assets beforehand
    this._preload();
  }

  _preload() {
    return (
      <span>
        <img src={ALLIANCE_ICON}/>
        <img src={HORDE_ICON}/>
      </span>
    )
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search && this.props.history.action === 'POP') {
      const args = getParamsFromURL(this.props.location.search);
      this.props.updateQuery(args[0]);
      this.props.onHandleAutoComplete(args[0]);
      this.props.loadFromURLParams(...args);
    }
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

  getPageHref = (p) => {
    const {query, currentFaction, currentRealm} = this.props;
    const q = normalizeParam(query), f = normalizeParam(currentFaction), r = normalizeParam(currentRealm).replace(" ", "");
    return '/search?q=' + q + '&p=' + p + '&realm=' + r + '&faction=' + f;
  };

  renderPagination = () => {
    const {page} = this.props;

    return (
      <Pagination style={{flex: 1, justifyContent: 'center'}}>
        <Pagination.First className={'pagination-item'} onClick={() => this.goToPage(0)}/>
        <Pagination.Prev className={'pagination-item'} onClick={() => this.goToPage(page-1)}/>
        {page > 1 ?
              <a className='pagination-item page-link' href={this.getPageHref(page-2)}>
                  {page - 1}
              </a>
          : null
        }
        {page > 0 ?
            <a className='pagination-item page-link' href={this.getPageHref(page-1)}>
              {page}
            </a>
          : null
        }
        <Pagination.Item className={'pagination-item current'}>{page + 1}</Pagination.Item>
        {this.getPagesRemaining() > 0 ?
            <a className='pagination-item page-link' href={this.getPageHref(page+1)}>
              {page+2}
            </a>
          : null
        }
        {this.getPagesRemaining() > 1 ?
            <a className='pagination-item page-link' href={this.getPageHref(page+2)}>
              {page+3}
            </a>
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
      <Navbar variant="dark" style={{display: 'flex', paddingLeft: 0, paddingRight: 0}}>
        <Navbar.Brand href="/">
          <Logo/>
        </Navbar.Brand>
        <Nav style={{flex: 1, justifyContent: 'flex-end'}}>
          <AHSearchForm
            onSearch={this.props.onSearch}
            options={this.props.suggestions.map(m => ({...m, name: m.itemName}))}
            onInputChange={this.props.onHandleAutoComplete}
            onChange={this.props.onPickSuggestion}
            onKeyDown={this.props.onKeyPressed}
          />
          <RealmDropdown currentRealm={currentRealm}
                         currentFaction={currentFaction}
                         onSelectRealmAndFaction={this.props.setCurrentRealmAndFactionAndSearch}
                         onSelectRealm={this.props.setCurrentRealm}
                         onSelectFaction={this.props.setCurrentFaction}
                         realms={realms}/>
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
            <Logo/>
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
            <div style={{display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'flex-start', marginTop: 15, marginBottom: 5}}>
              <RealmDropdown style={{marginLeft: 0}}
                             currentRealm={currentRealm}
                             currentFaction={currentFaction}
                             onSelectRealmAndFaction={this.props.setCurrentRealmAndFactionAndSearch}
                             onSelectRealm={this.props.setCurrentRealm}
                             onSelectFaction={this.props.setCurrentFaction}
                             realms={realms}/>
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

  render() {
    const {loading, items} = this.props;

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
        <AuctionTable hasSearched={this.props.hasSearched} items={items}/>
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
    setCurrentRealmAndFactionAndSearch: (realm, faction) => {
      dispatch(searchOnSetRealmAndFaction(realm, faction));
    },
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


export default connect(mapStateToProps, mapDispatchToProps)(AuctionHouse)
