import {Button, Dropdown, ButtonGroup, Container, DropdownButton, Modal, Spinner, Table} from 'react-bootstrap';
import Item from '../Item';
import MobileItem from '../MobileItem';
import {Desktop, Mobile, Tablet} from '../../helpers/mediaTypes';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowDown, faArrowUp} from '@fortawesome/free-solid-svg-icons';
import {SORT_FIELDS, SORT_FIELDS_DISPLAY_NAMES, SORT_ORDERS} from '../../helpers/constants';

const React = require('react');

export default class AuctionTable extends React.Component {
  state = {
    graph: {}
  };

  onClickGraph = (features) => {
    this.setState({
      graph: {
        show: true,
        itemId: features.id,
        itemName: features.itemName
      }
    })
  };

  _render12HourView() {
    return (
      <ResponsiveContainer width={'90%'} height={300}>
        <ComposedChart data={dummyData}
                       margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="scannedAt" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="quantity" barSize={Math.max(...dummyData.map((o) => o.quantity))} fill="#413ea0" />
          <Line type="monotone" dataKey="marketValue" stroke="#ff7300" />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  renderGraphModal() {
    const {show, itemId, itemName} = this.state.graph;

    const hide = () => {this.setState({graph: {show: false}})};
    return (
      <Modal show={show} onHide={hide}>
        <Modal.Header closeButton>
          <Modal.Title><h4 style={{color: '#000'}}>{itemName} (DEMO - Not working)</h4></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this._render12HourView()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="info" onClick={hide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  getDesktopItems(items) {
    return items.map(features =>
      <Item key={items.indexOf(features)} index={items.indexOf(features)} features={features} onClickGraph={this.onClickGraph.bind(this, features)}/>
    );
  }

  getMobileItems(items) {
    return items.map(features =>
      <MobileItem key={items.indexOf(features)} index={items.indexOf(features)} features={features} onClickGraph={this.onClickGraph.bind(this, features)}/>
    );
  }

  getColumnHeaderSortedTitle(field) {
    const sort = this.props.sortFilter;
    const matches = sort.field === field || (field === 'price' && ['bid', 'buyout'].includes(sort.field));
    let fieldName = SORT_FIELDS_DISPLAY_NAMES[field];
    if (sort.field && matches) {
      fieldName = SORT_FIELDS_DISPLAY_NAMES[sort.field];
    }

    let SortIcon;
    if (sort.order === SORT_ORDERS.ASCENDING && matches) {
      SortIcon = <FontAwesomeIcon style={{width: 20}} color={'turquoise'} icon={faArrowUp}/>
    } else if (sort.order ===SORT_ORDERS.DESCENDING && matches) {
      SortIcon = <FontAwesomeIcon style={{width: 20}} color={'turquoise'} icon={faArrowDown}/>
    } else {
      SortIcon = <span style={{width: 20}}/>;
    }

    return (
      <span>{fieldName} {SortIcon}</span>
    )
  }

  render() {
    let {items} = this.props;

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
    } else if (items.length === 0) {
      return (
        <Container style={{flex: 1, flexDirection: 'column', display: 'flex', marginTop: 35, alignItems: 'center', color: '#fff'}}>
          <img className={'img-responsive'} style={{borderRadius: 5, marginBottom: 30, width: 400}} alt={'Try a different query, will ya?'} src={'https://i.kym-cdn.com/photos/images/newsfeed/001/398/839/b4d.jpg'}/>
          <h4>
            No results! Try another query.
          </h4>
        </Container>
      )
    }

    return (
      <div>
        <Desktop>
          <Table responsive striped bordered hover size="xs" variant={"dark"}>
            <tbody>
            {this.renderGraphModal()}
            <tr>
              <th style={{width: '5%', alignItems: 'center'}}>
                <DropdownButton
                  style={{display: 'flex'}}
                  bsPrefix={'invis'}
                  size={'sm'}
                  id={'QtyDD'}
                  variant={'info'}
                  title={this.getColumnHeaderSortedTitle(SORT_FIELDS.QUANTITY)}
                >
                  <Dropdown.Header>Order by</Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.QUANTITY, SORT_ORDERS.ASCENDING)}>Low to High</Dropdown.Item>
                  <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.QUANTITY, SORT_ORDERS.DESCENDING)}>High to Low</Dropdown.Item>
                </DropdownButton>
              </th>
              <th style={{width: '30%'}}>Name</th>
              <th style={{width: '5%'}}>Req</th>
              <th style={{width: '30%', justifyContent: 'space-between', alignItems: 'center'}}>
                <DropdownButton
                  style={{display: 'flex'}}
                  bsPrefix={'invis'}
                  size={'sm'}
                  id={`PriceDD`}
                  variant={'info'}
                  title={this.getColumnHeaderSortedTitle(SORT_FIELDS.PRICE)}>
                  <Dropdown.Header>Order by</Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.BUYOUT, SORT_ORDERS.ASCENDING)}>Buyout: Low to High</Dropdown.Item>
                  <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.BID, SORT_ORDERS.ASCENDING)} eventKey="2">Bid: Low to High</Dropdown.Item>
                  <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.BUYOUT, SORT_ORDERS.DESCENDING)}>Buyout: High to Low</Dropdown.Item>
                  <Dropdown.Item onClick={() => this.props.searchOnSort(SORT_FIELDS.BID, SORT_ORDERS.DESCENDING)}>Bid: High to Low</Dropdown.Item>
                </DropdownButton>
              </th>
              <th style={{width: '20%'}}>Seller</th>
              <th style={{width: '10%'}}>Time Left</th>
            </tr>
            {this.getDesktopItems(items.slice(0, 15))}
            </tbody>
          </Table>
        </Desktop>
        <Mobile>
          <div style={{color: '#fff', marginBottom: 10}}>
            {this.renderGraphModal()}
            <div style={{backgroundColor: '#343a40'}}>
              {this.getMobileItems(items.slice(0, 15))}
            </div>
          </div>
        </Mobile>
        <Tablet>
          <div style={{color: '#fff', marginBottom: 10}}>
            <div style={{height: 25}}/>
            {this.renderGraphModal()}
            <div style={{backgroundColor: '#343a40'}}>
              {this.getMobileItems(items.slice(0, 15))}
            </div>
          </div>
        </Tablet>
      </div>
    )
  }
}

const dummyData = [
  {
    "marketValue": 320,
    "minBuyout": 320,
    "quantity": 149,
    "scannedAt": "2020-05-22T17:54:13.000Z"
  },
  {
    "marketValue": 313,
    "minBuyout": 308,
    "quantity": 180,
    "scannedAt": "2020-05-22T18:43:22.000Z"
  },
  {
    "marketValue": 232,
    "minBuyout": 223,
    "quantity": 433,
    "scannedAt": "2020-05-22T21:06:34.000Z"
  },
  {
    "marketValue": 181,
    "minBuyout": 100,
    "quantity": 511,
    "scannedAt": "2020-05-22T23:43:53.000Z"
  },
  {
    "marketValue": 89,
    "minBuyout": 75,
    "quantity": 793,
    "scannedAt": "2020-05-23T02:49:12.000Z"
  },
  {
    "marketValue": 90,
    "minBuyout": 65,
    "quantity": 778,
    "scannedAt": "2020-05-23T05:13:29.000Z"
  },
  {
    "marketValue": 92,
    "minBuyout": 60,
    "quantity": 718,
    "scannedAt": "2020-05-23T08:40:43.000Z"
  },
  {
    "marketValue": 148,
    "minBuyout": 64,
    "quantity": 538,
    "scannedAt": "2020-05-23T13:20:35.000Z"
  },
  {
    "marketValue": 71,
    "minBuyout": 63,
    "quantity": 660,
    "scannedAt": "2020-05-23T16:10:15.000Z"
  },
  {
    "marketValue": 71,
    "minBuyout": 63,
    "quantity": 759,
    "scannedAt": "2020-05-23T17:44:21.000Z"
  }
];
