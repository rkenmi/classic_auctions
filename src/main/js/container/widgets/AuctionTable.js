import {
  Button,
  Dropdown,
  ButtonGroup,
  Container,
  DropdownButton,
  Modal,
  Spinner,
  Table,
  ToggleButton
} from 'react-bootstrap';
import Item from '../Item';
import MobileItem from '../MobileItem';
import {Desktop, Mobile, Tablet} from '../../helpers/mediaTypes';
import {
  Area,
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
import {CustomTooltip} from './graph/GraphTooltip';
import {WowCurrencyTick} from './graph/WoWCurrencyTick';
import {CustomizedAxisTick} from './graph/TimeAxisTick';
const moment = require('moment-timezone');
const React = require('react');

const formatTick = (tick) => moment(tick).format('MM/DD h:mm a');

const TIMESPAN_RADIOS = [
  { name: '12 Hr', value: 0 },
  { name: '1 Wk', value: 1 },
  { name: '1 Mo', value: 2 },
];

export default class AuctionTable extends React.Component {
  _renderGraphComponent(prices, item, timespan) {
    prices = prices.map(p => {
      return {...p, timestamp: moment(p.timestamp).valueOf()}
    });

    let startDate;
    if (timespan === 2) {
      startDate = moment().subtract(1, 'month').valueOf();
    } else if (timespan === 1) {
      startDate = moment().subtract(1, 'week').valueOf();
    } else {
      startDate = moment().subtract(12, 'hours').valueOf();
    }

    return (
      <ResponsiveContainer width={'90%'} height={300}>
        <ComposedChart data={prices}
                       margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="timestamp"
                 type={'number'}
                 scale={'time'}
                 height={60}
                 tick={<CustomizedAxisTick/>}
                 domain={[
                   startDate,
                   moment().valueOf(),
                 ]}
                 tickFormatter={formatTick}/>
          <YAxis dataKey="price" width={75} tick={<WowCurrencyTick/>} />
          <Tooltip content={<CustomTooltip item={item}/>} />
          <Area type="monotone" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  renderGraphModal() {
    const {item, prices, loading, timespan} = this.props.graph;

    const show = item !== null;
    const hide = () => {this.props.onCloseModal()};
    const spinner = <Container style={{display: 'flex', justifyContent: 'center'}}>
      <Spinner variant='info' animation="border" role="status">
        <span className="sr-only">Loading graph...</span>
      </Spinner>
    </Container>;

    return (
      <Modal show={show} onHide={hide}>
        <Modal.Header closeButton>
          <Modal.Title><h4 style={{color: '#000'}}>{item ? item.itemName : null}</h4></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ButtonGroup toggle style={{flex: 1, marginBottom: 15}}>
              {TIMESPAN_RADIOS.map((radio, idx) => (
                <ToggleButton
                  key={idx}
                  type="radio"
                  variant="info"
                  name="radio"
                  value={radio.value}
                  checked={timespan === radio.value}
                  onChange={(e) => this.props.onSetTimespan(parseInt(e.currentTarget.value))}
                >
                  {radio.name}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </div>
          {loading ? spinner : this._renderGraphComponent(prices, item, timespan)}
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
      <Item key={items.indexOf(features)} index={items.indexOf(features)} features={features} onClickGraph={() => this.props.onClickGraph(features)}/>
    );
  }

  getMobileItems(items) {
    return items.map(features =>
      <MobileItem key={items.indexOf(features)} index={items.indexOf(features)} features={features} onClickGraph={() => this.props.onClickGraph(features)}/>
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

    if (!items || this.props.loading) {
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

