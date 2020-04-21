const React = require('react');

export default class Item extends React.Component{
  render() {
    const {rarity, id, itemLvl, itemName, minLvlRequired, bid, buyout, seller, timeRemaining} = this.props.features;

    return (
      <tr>
        <td>
          <a style={{color: '#' + rarity}} href={'https://classicdb.ch/?item=' + id} target={'_blank'} rel={'item=' + id}>{itemName}</a>
        </td>
        <td>{itemLvl}</td>
        <td>{minLvlRequired}</td>
        <td>{bid}</td>
        <td>{buyout}</td>
        <td>{seller}</td>
        <td>{timeRemaining}</td>
      </tr>
    )
  }
}

