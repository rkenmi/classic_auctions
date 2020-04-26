import {TIME_REMAINING} from '../helpers/constants';

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
          <span className={'money-gold'}>{Math.floor((money / 10000) % 100)}</span>
          : null}
        {money > 99 ?
          <span className={'money-silver'}>{Math.floor((money / 100) % 100)}</span>
          : null}
        <span className={'money-copper'}>{Math.floor(money % 100)}</span>
      </td>
    )
  };

  render() {
    const {rarity, id, itemLvl, itemName, minLvlRequired, bid, buyout, seller, timeRemaining} = this.props.features;

    return (
      <tr>
        <td>
          <a style={{color: '#' + rarity}} href={'https://classicdb.ch/?item=' + id} target={'_blank'} data-wowhead={'item=' + id + '&domain=classic'}>{itemName}</a>
        </td>
        <td>{itemLvl}</td>
        <td>{minLvlRequired}</td>
        {this.renderMoney(bid)}
        {this.renderMoney(buyout)}
        <td>{seller}</td>
        <td>{TIME_REMAINING[timeRemaining-1]}</td>
      </tr>
    )
  }
}

