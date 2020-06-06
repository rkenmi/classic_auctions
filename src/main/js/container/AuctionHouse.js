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
  getEmptyLabelString,
  keysPressed,
  pickSuggestion,
  setCurrentFaction,
  setCurrentRealm,
  setError,
  search,
  updateSearchQuery,
  setMobileNavExpanded,
  updatePageNum,
  loadFromURL,
  searchOnSetRealmAndFaction,
  searchOnSetSort,
  convertSortParamsToURLParams, getMarketpriceData, hideGraphModal, setTimespan, setTimespanOnGraph
} from '../actions/actions';
import AHSearchForm from './AuctionHouseSearch';
import moment from 'moment';
import RealmDropdown from './widgets/RealmDropdown';
import AuctionTable from './widgets/AuctionTable';
import {capitalizeWord, getParamsFromURL, normalizeParam} from '../helpers/searchHelpers';
import {MISC_URL} from '../helpers/endpoints';
import {Logo} from '../helpers/domHelpers';
import {SORT_FIELDS, SORT_FIELDS_DISPLAY_NAMES, SORT_ORDERS} from '../helpers/constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowDown, faArrowUp} from '@fortawesome/free-solid-svg-icons';
import AuctionPagination from './widgets/AuctionPagination';
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
    return this.props.page + Math.ceil((this.props.count - 1) / 15)
  };

  getPagesRemaining = () => {
    return Math.ceil((this.props.count - 1) / 15);
  };

  renderByCondition(condition, dom, failDom=null) {
    return condition ? dom : failDom;
  }

  renderFirstPageLink(page) {
    return this.renderByCondition(page > 0,
      <a className='pagination-item page-link' href={this.getPageHref(0)}>
        <span aria-hidden="true">«</span>
        <span className="sr-only">Previous</span>
      </a>,
      <span style={{width: '3em'}}/>
    )
  }

  renderPreviousPageLink(page) {
    return this.renderByCondition(page > 0,
      <a className='pagination-item page-link' href={this.getPageHref(page-1)}>
          <span aria-hidden="true">‹</span>
          <span className="sr-only">Previous</span>
      </a>,
      <span style={{width: '3em'}}/>
    )
  }

  renderLastPageLink(page) {
    return this.renderByCondition(page < this.getLastPage(),
      <a className='pagination-item page-link' href={this.getPageHref(this.getLastPage())}>
        <span aria-hidden="true">»</span>
        <span className="sr-only">Last</span>
      </a>,
      <span style={{width: '3em'}}/>
    )
  }

  renderNextPageLink(page) {
    return this.renderByCondition(page < this.getLastPage(),
      <a className='pagination-item page-link' href={this.getPageHref(page+1)}>
        <span aria-hidden="true">›</span>
        <span className="sr-only">Next</span>
      </a>,
      <span style={{width: '3em'}}/>
    )
  }

  getMobileSortedDropdownTitle() {
    const sort = this.props.sort;
    let fieldName = sort.field ? capitalizeWord(sort.field) : 'Order by';

    let SortIcon;
    if (sort.order === SORT_ORDERS.ASCENDING) {
      SortIcon = <FontAwesomeIcon style={{width: 20}} color={'blue'} icon={faArrowUp}/>
    } else if (sort.order ===SORT_ORDERS.DESCENDING) {
      SortIcon = <FontAwesomeIcon style={{width: 20}} color={'red'} icon={faArrowDown}/>
    } else {
      SortIcon = <span style={{width: 20}}/>;
    }

    return (
      <span>{fieldName} {SortIcon}</span>
    )
  }

  getPageHref(p) {
    const {query, currentFaction, currentRealm, sort} = this.props;
    const q = normalizeParam(query), f = normalizeParam(currentFaction), r = normalizeParam(currentRealm).replace(" ", "");
    const sp = convertSortParamsToURLParams(sort);
    return '/search?q=' + q + '&p=' + p + '&realm=' + r + '&faction=' + f + sp;
  };


  renderPagination = () => {
    const {page} = this.props;

    return (
      <Pagination style={{flex: 1, justifyContent: 'center'}}>
        {this.renderFirstPageLink(page)}
        {this.renderPreviousPageLink(page)}
        {this.renderByCondition(page > 1, <a className='pagination-item page-link' href={this.getPageHref(page-2)}>{page - 1}</a>)}
        {this.renderByCondition(page > 0, <a className='pagination-item page-link' href={this.getPageHref(page-1)}>{page}</a>)}
        <Pagination.Item className={'pagination-item current'}>{page + 1}</Pagination.Item>
        {this.renderByCondition(this.getPagesRemaining() > 0, <a className='pagination-item page-link' href={this.getPageHref(page+1)}>{page+2}</a>)}
        {this.renderByCondition(this.getPagesRemaining() > 1, <a className='pagination-item page-link' href={this.getPageHref(page+2)}>{page+3}</a>)}
        {this.renderNextPageLink(page)}
        {this.renderLastPageLink(page)}
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
        <Navbar ref={(ref) => {this.navbarRef = ref}} fixed={'top'} style={{display: 'flex'}} bg={'dark'} variant={'dark'} expand={'lg'}
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
              <DropdownButton
                style={{display: 'flex', marginLeft: 15}}
                id={'MobileSortDD'}
                variant={'info'}
                title={this.getMobileSortedDropdownTitle()}
              >
                <Dropdown.Header>Order by</Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.QUANTITY, SORT_ORDERS.ASCENDING)}>Quantity: Low to High</Dropdown.Item>
                <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.QUANTITY, SORT_ORDERS.DESCENDING)}>Quantity: High to Low</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.BUYOUT, SORT_ORDERS.ASCENDING)}>Buyout: Low to High</Dropdown.Item>
                <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.BID, SORT_ORDERS.ASCENDING)} eventKey="2">Bid: Low to High</Dropdown.Item>
                <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.BUYOUT, SORT_ORDERS.DESCENDING)}>Buyout: High to Low</Dropdown.Item>
                <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.BID, SORT_ORDERS.DESCENDING)}>Bid: High to Low</Dropdown.Item>
              </DropdownButton>
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

    return (
      <div>
        {this.renderPagination()}
      </div>
    )
  }

  clearError = () => {
    this.props.setError(null, null);
  };

  render() {
    const {loading, items, page, count, graph} = this.props;

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
        <AuctionTable
          loading={loading}
          page={page}
          hasSearched={this.props.hasSearched}
          items={items}
          onSetTimespan={this.props.onSetTimespan}
          graph={graph}
          onClickGraph={this.props.clickGraph}
          onCloseModal={this.props.hideGraph}
          sortFilter={this.props.sort}
          searchOnSort={this.props.searchOnSort}
        />
        <AuctionPagination count={count} items={items} loading={loading} page={page} getPageHref={this.getPageHref.bind(this)}/>
      </Container>
    )
  }
}

function mapStateToProps(state) {
  return {
    searchBarRef: state.visibilityReducer.searchBarRef,
    loading: state.pageReducer.loading,
    graph: state.pageReducer.graph,
    hasSearched: state.pageReducer.hasSearched,
    queryMs: state.pageReducer.queryMs,
    sort: state.pageReducer.sort,
    page: state.pageReducer.page,
    realms: state.pageReducer.realms,
    items: state.pageReducer.items,
    count: state.pageReducer.count,
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
    searchOnSort: (field, order) => {
      dispatch(searchOnSetSort(field, order));
    },
    clickGraph: (item, timestamp) => {
      dispatch(getMarketpriceData(item, 0));
    },
    hideGraph: () => {
      dispatch(hideGraphModal());
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
    onSetTimespan: (timespan, item) => {
      dispatch(setTimespanOnGraph(timespan, item));
    },
    setError: (title, message) => {
      dispatch(setError(title, message));
    },
    loadFromURLParams: (query, page, currentRealm, currentFaction, sortField, sortFieldOrder) => {
      dispatch(loadFromURL(query, page, currentRealm, currentFaction, sortField, sortFieldOrder));
    }
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(AuctionHouse)
