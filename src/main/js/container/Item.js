import {TIME_REMAINING} from '../helpers/constants';
import {getColorCode} from '../helpers/searchHelpers';

const React = require('react');

export default class Item extends React.Component{
  renderMoney = (money) => {
    // For items with no buyout price
    if (money === '0') {
      return <td/>;
    }

    return (
      <td>
        {money > 9999 ?
          <span className={'money-gold'}>{Math.floor((money / 10000))}</span>
          : null}
        {money > 99 ?
          <span className={'money-silver'}>{Math.floor((money / 100) % 100)}</span>
          : null}
        <span className={'money-copper'}>{Math.floor(money % 100)}</span>
      </td>
    )
  };

  render() {
    const {metaItem, id, itemName, bid, buyout, seller, timeRemaining, quantity} = this.props.features;

    return (
      <tr>
        <td>{quantity}</td>
        <td>
          <a style={{color: getColorCode(metaItem.quality)}} href={'https://classicdb.ch/?item=' + id} target={'_blank'} data-wowhead={'item=' + id + '&domain=classic'}>{itemName}</a>
        </td>
        <td>{metaItem.itemLvl}</td>
        <td>{metaItem.minLvlRequired}</td>
        {this.renderMoney(bid)}
        {this.renderMoney(buyout)}
        <td>{seller}</td>
        <td>{TIME_REMAINING[timeRemaining-1]}</td>
      </tr>
    )
  }
}

