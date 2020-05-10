import {connect} from 'react-redux';

const React = require('react');
import {
  Button,
  Col,
  Container, DropdownButton,
  Dropdown,
  Form,
  FormControl,
  InputGroup,
  Nav,
  Navbar,
  Pagination,
  Row,
  Table, Modal, Spinner
} from 'react-bootstrap';
import Item from './Item';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
const client = require('../client');
const qs = require('qs');
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {Desktop, Mobile, Tablet} from '../helpers/mediaTypes';
import {setCurrentRealm, setError} from '../actions/actions';
import allianceIcon from '../../resources/static/images/alliance_50.png';
import hordeIcon from '../../resources/static/images/horde_50.png';
import {Typeahead} from 'react-bootstrap-typeahead';

class ItemList extends React.Component{
  constructor(props) {
    super(props);
    const query = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).q;
    const page = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).p;
    const currentRealm = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).realm;
    const currentFaction = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).faction;
    this.state = {
      suggestions: [],
      mobileNavExpanded: false,
      hasSearched: false,
      loading: false,
      items: [],
      query: query ? query : '',
      page : page ? page : 0,
      currentRealm,
      currentFaction
    };
  }

  componentDidMount() {
    if (this.state.query) {
      this.onSearch(this.state.page);
    }
  }

  onSearch = (pageNum=0) => {
    const {query, currentRealm, currentFaction} = this.state;

    if (query === '') {
      this.props.setError('Error', 'Please enter a search query.');
      return;
    }
    if (currentRealm == null || currentFaction == null) {
      this.props.setError('Error', 'Please specify both Realm and Faction.');
      return;
    }

    this.setState({mobileNavExpanded: false, loading: true});
    this.performSearch(pageNum);
  };

  performSearch = (pageNum=0) => {
    const {currentRealm, currentFaction} = this.state;

    const formattedRealm = currentRealm.replace(" ", "");

    this.props.history.push('/search?q=' + this.state.query + '&p=' + pageNum + '&realm=' + formattedRealm + '&faction=' + currentFaction);
    client({
      method: 'GET',
      path: '/api/search?q=' + this.state.query + '&p=' + pageNum + '&realm=' + formattedRealm + '&faction=' + currentFaction
    }).done(response => {
      const {items, page, queryMs} = response.entity;
      this.setState({items, page, queryMs, loading: false, hasSearched: true});
    });
  };

  handleChange = (event) => {
    const query = event;
    this.setState({query});

    const {currentRealm, currentFaction} = this.state;
    if (!currentRealm || !currentFaction) {
      return;
    }
    const formattedRealm = currentRealm.replace(" ", "");
    client({
      method: 'GET',
      path: '/api/autocomplete?q=' + this.state.query + '&realm=' + formattedRealm + '&faction=' + currentFaction
    }).done(response => {
      const suggestions = response.entity;
      this.setState({suggestions});
    });
  };

  goToPage = (pageNum) => {
    if (pageNum < 0 || pageNum > this.state.page && this.getPagesRemaining() === 0) {
      return;
    }
    this.performSearch(pageNum);
  };

  getLastPage = () => {
    return this.state.page + Math.floor((this.state.items.length-1) / 15)
  };

  getPagesRemaining = () => {
    return Math.floor((this.state.items.length-1) / 15);
  };

  getPagesBefore = () => {
    return this.state.page;
  };

  renderPagination = () => {
    const {page} = this.state;


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

  onEnterBtnSearch = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      this.onSearch();
    }
  };

  handlePickSuggestion = (e) => {
    this.setState({query: e[0]})
  };

  getEmptyLabelString = () => {
    if (!this.state.currentRealm || !this.state.currentFaction) {
      return 'Please select a realm and faction.'
    }
    return 'No matches found.'
  };

  renderDesktopView() {
    const realms = this.props.realms || [];

    return (
      <Navbar variant="dark" style={{display: 'flex'}}>
        <Navbar.Brand href="/">
          <h1>Classic Auctions</h1>
        </Navbar.Brand>
        <Nav style={{flex: 1, justifyContent: 'flex-end'}}>
          <Form inline onSubmit={(e) => {e.preventDefault(); this.onSearch()}} style={{flex: 1, justifyContent: 'center'}}>
            <Typeahead
              id={'ah-typeahead'}
              style={{flex: 0.75}}
              defaultInputValue={this.state.query}
              labelKey="name"
              emptyLabel={this.getEmptyLabelString()}
              options={this.state.suggestions}
              placeholder="Search for an item"
              onInputChange={this.handleChange}
              onChange={this.handlePickSuggestion}
              onKeyDown={(e) => this.onEnterBtnSearch(e)}
            />
            <Button variant="outline-info" onClick={() => this.onSearch()}>Search</Button>
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
        </Nav>
      </Navbar>
    );
  }

  onMobileSearch = (e) => {
    e.preventDefault();
    this.onSearch();
  };

  renderMobileView() {
    const realms = this.props.realms || [];
    return (
      <div style={{display: 'flex', flexDirection: 'column', marginTop: 75}}>
        <Navbar fixed={'top'} style={{display: 'flex'}} bg={'dark'} variant={'dark'} expand={'lg'}
                onToggle={()=> {this.setState({mobileNavExpanded: !this.state.mobileNavExpanded})} }
                expanded={this.state.mobileNavExpanded}>
          <Navbar.Brand>
            <h4>Classic Auctions</h4>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse style={{justifyContent: 'center', marginTop: 25}} id="basic-navbar-nav">
            <Form inline onSubmit={this.onMobileSearch}>
              <InputGroup style={{flex: 1}}>
                <Typeahead
                  id={'ah-typeahead'}
                  style={{flex: 1, display: 'flex'}}
                  defaultInputValue={this.state.query}
                  bsSize={'lg'}
                  labelKey="name"
                  emptyLabel={this.getEmptyLabelString()}
                  options={this.state.suggestions}
                  placeholder="Search for an item"
                  onInputChange={this.handleChange}
                  onChange={this.handlePickSuggestion}
                  onKeyDown={(e) => this.onEnterBtnSearch(e)}
                />
                <InputGroup.Append>
                  <Button size='lg' onClick={() => {this.onSearch()}}>
                    <FontAwesomeIcon icon={faSearch} inverse/>
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Form>
            <div style={{display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'flex-start', marginTop: 25, marginBottom: 25}}>
              <DropdownButton variant='info' id="dropdown-item-button" title={realms.includes(this.state.currentRealm) ? this.state.currentRealm : "Realm"}>
                {realms.map((realm) => {
                  return (
                    <Dropdown.Item key={realms.indexOf(realm)} as="button" onSelect={() => {this.setState({currentRealm: realm})}}>{realm}</Dropdown.Item>
                  );
                })}
              </DropdownButton>
              <DropdownButton variant='info' id="dropdown-item-button" style={{marginLeft: 15}} title={this.state.currentFaction || "Faction"}>
                <Dropdown.Item as="button" onSelect={() => {this.setState({currentFaction: 'Alliance'})}}><img src={allianceIcon}/> Alliance</Dropdown.Item>
                <Dropdown.Item as="button" onSelect={() => {this.setState({currentFaction: 'Horde'})}}><img src={hordeIcon}/> Horde</Dropdown.Item>
              </DropdownButton>
            </div>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }

  renderFooter() {
    if (!this.state.items || this.state.items.length === 0) {
      return;
    }
    const dateStr = new Date(this.state.items[0].timestamp).toString();

    return (
      <div>
        {this.renderPagination()}
        <Container style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 25}}>
          <div style={{color: '#fff', fontSize: 10}}>Last data refresh: {dateStr}</div>
          <div style={{color: '#fff', fontSize: 10}}>Query response time: {this.state.queryMs} ms</div>
        </Container>
      </div>
    )
  }

  clearError = () => {
    this.props.setError(null, null);
  };

  renderTable(items) {
    if (this.state.loading) {
      return (
        <Container style={{flex: 1, display: 'flex', marginTop: 35, justifyContent: 'center'}}>
          <Spinner variant='info' animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </Container>
      )
    }

    if (this.state.hasSearched === false && items.length === 0) {
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
    const {loading} = this.state;
    const items = this.state.items.map(features =>
      <Item key={this.state.items.indexOf(features)} features={features}/>
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
    realms: state.pageReducer.realms,
    errorTitle: state.pageReducer.errorTitle,
    errorMessage: state.pageReducer.errorMessage
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setCurrentRealm: (realm) => {
      dispatch(setCurrentRealm(realm));
    },
    setError: (title, message) => {
      dispatch(setError(title, message));
    }
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ItemList)
