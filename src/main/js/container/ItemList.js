import {useMediaQuery} from 'react-responsive';

const React = require('react');
import {Button, Col, Container, Form, FormControl, Nav, Navbar, Pagination, Row, Table} from 'react-bootstrap';
import Item from './Item';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
const client = require('../client');
const qs = require('qs');
import {faSearch} from '@fortawesome/free-solid-svg-icons';

const Desktop = ({ children }) => {
  const isDesktop = useMediaQuery({ minWidth: 992 });
  return isDesktop ? children : null
};

const Tablet = ({ children }) => {
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });
  return isTablet ? children : null
};
const Mobile = ({ children }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  return isMobile ? children : null
};

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
      const {items, page} = response.entity;
      this.setState({items, page});
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
      <Navbar bg="dark" variant="dark">
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
      <Container style={{paddingBottom: 50, paddingTop: 50}}>
        <Row style={{flex: 1, justifyContent: 'center'}}>
          <h1>Classic Auctions</h1>
        </Row>
        <Row style={{flex: 1, justifyContent: 'center'}}>
          <Form inline onSubmit={(e) => {e.preventDefault(); this.onSearch()}}>
            <FormControl type="text" placeholder="Search" onChange={this.handleChange}/>
            <Button style={{marginLeft: -1}} onClick={() => this.onSearch()}>
              <FontAwesomeIcon icon={faSearch} inverse/>
            </Button>
          </Form>
        </Row>
      </Container>
    );
  }

  render() {
    const {page} = this.state;
    const items = this.state.items.map(features =>
      <Item key={this.state.items.indexOf(features)} features={features}/>
    );
    return (
      <Container style={{minWidth: 550, borderRadius: 15, border: '1px solid gray', backgroundColor: '#343a40'}}>
        <Desktop>{this.renderDesktopView()}</Desktop>
        <Tablet>{this.renderMobileView()}</Tablet>
        <Mobile>{this.renderMobileView()}</Mobile>
        <Table striped bordered hover size="sm" variant={"dark"}>
          <tbody>
          <tr>
            <th>Item Name</th>
            <th>Item Lvl</th>
            <th>Req</th>
            <th>Bid</th>
            <th>Buyout</th>
            <th>Seller</th>
            <th>Time Remaining</th>
          </tr>
          {items.slice(0, 15)}
          </tbody>
        </Table>
        {this.renderPagination()}
      </Container>
    )
  }
}

