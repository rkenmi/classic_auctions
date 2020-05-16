import {Container, Spinner, Table} from 'react-bootstrap';
import Item from '../Item';
import MobileItem from '../MobileItem';
import {Desktop, Mobile, Tablet} from '../../helpers/mediaTypes';

const React = require('react');

export default class AuctionTable extends React.Component {
  getDesktopItems(items) {
    return items.map(features =>
      <Item key={items.indexOf(features)} features={features}/>
    );
  }

  getMobileItems(items) {
    return items.map(features =>
      <MobileItem key={items.indexOf(features)} features={features}/>
    );
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
      return <tr><td colSpan={8} style={{textAlign: 'center'}}>No results</td></tr>
    }

    return (
      <Table responsive striped bordered hover size="xs" variant={"dark"}>
        <tbody>
          <Desktop>
            <tr>
              <th>Qty</th>
              <th>Name</th>
              <th>Req</th>
              <th>Price</th>
              <th>Seller</th>
              <th>Time Left</th>
            </tr>
            {this.getDesktopItems(items.slice(0, 15))}
          </Desktop>
          <Tablet>
            {this.getMobileItems(items.slice(0, 15))}
          </Tablet>
          <Mobile>
            {this.getMobileItems(items.slice(0, 15))}
          </Mobile>
        </tbody>
      </Table>
    )
  }
}

