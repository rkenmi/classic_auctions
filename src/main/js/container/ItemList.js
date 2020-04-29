import {useMediaQuery} from 'react-responsive';

const React = require('react');
import {
  Button,
  Col,
  Container,
  Form,
  FormControl,
  InputGroup,
  Nav,
  Navbar,
  Pagination,
  Row,
  Table
} from 'react-bootstrap';
import Item from './Item';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
const client = require('../client');
const qs = require('qs');
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {Desktop, Mobile, Tablet} from '../helpers/mediaTypes';

export default class ItemList extends React.Component{
  constructor(props) {
    super(props);
    const query = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).q;
    const page = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).p;
    this.state = {items: [], query: query ? query : '', page : page ? page : 0};
  }

  componentDidMount() {
    if (this.state.query) {
      this.performSearch(this.state.page);
    }
  }

  onSearch = (pageNum=0) => {
    this.performSearch(pageNum);
  };

  performSearch = (pageNum=0) => {
    this.props.history.push('/search?q=' + this.state.query + '&p=' + pageNum);
    client({method: 'GET', path: '/api/search?q=' + this.state.query + '&p=' + pageNum}).done(response => {
      const {items, page, queryMs} = response.entity;
      this.setState({items, page, queryMs});
    });
  };

  handleChange = (event) => {
    // let fieldName = event.target.name;
    let query = event.target.value;
    this.setState({query});
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

  renderDesktopView() {
    return (
      <Navbar variant="dark">
        <Navbar.Brand href="/"><h1>Classic Auctions</h1></Navbar.Brand>
        <Nav className="mr-auto">
        </Nav>
        <Form inline onSubmit={(e) => {e.preventDefault(); this.onSearch()}}>
          <FormControl type="text" placeholder="Search" className="mr-sm-2" onChange={this.handleChange}/>
          <Button variant="outline-info" onClick={() => this.onSearch()}>Search</Button>
        </Form>
      </Navbar>
    );
  }

  renderMobileView() {
    return (
      <Container style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: 25, paddingTop: 25}}>
        <Row>
          <h1>Classic Auctions</h1>
        </Row>
        <Row>
          <Form inline onSubmit={(e) => {e.preventDefault(); this.onSearch()}}>
            <InputGroup className='mb-3'>
              <FormControl type="text" placeholder="Search" className="mr-sm-2" onChange={this.handleChange}/>
              <InputGroup.Append>
                <Button style={{marginLeft: -6}} onClick={() => this.onSearch()}>
                  <FontAwesomeIcon icon={faSearch} inverse/>
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </Form>
        </Row>
      </Container>
    );
  }

  renderFooter() {
    if (!this.state.items || this.state.items.length === 0) {
      return;
    }
    const dataLastUpdated = new Date(this.state.items[0].timestamp).toString();

    return (
      <div>
        {this.renderPagination()}
        <Container style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 25}}>
          <div style={{color: '#fff', fontSize: 10}}>Last data refresh: {dataLastUpdated}</div>
          <div style={{color: '#fff', fontSize: 10}}>Query response time: {this.state.queryMs} ms</div>
        </Container>
      </div>
    )
  }

  render() {
    const {page} = this.state;
    const items = this.state.items.map(features =>
      <Item key={this.state.items.indexOf(features)} features={features}/>
    );
    return (
      <Container style={{display: 'flex', flexDirection: 'column'}}>
        <Desktop>{this.renderDesktopView()}</Desktop>
        <Tablet>{this.renderMobileView()}</Tablet>
        <Mobile>{this.renderMobileView()}</Mobile>
        <Table responsive striped bordered hover size="xs" variant={"dark"}>
          <tbody>
          <tr>
            <th>Qty</th>
            <th>Name</th>
            <th>iLvl</th>
            <th>Repro</th>
            <th>Bid</th>
            <th>Buyout</th>
            <th>Seller</th>
            <th>Time Left</th>
          </tr>
          {items.slice(0, 15)}
          </tbody>
        </Table>
        {items.length > 0 ? this.renderFooter() : null}
      </Container>
    )
  }
}

