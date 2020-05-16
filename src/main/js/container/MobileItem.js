import {TIME_REMAINING} from '../helpers/constants';
import {getColorCode} from '../helpers/searchHelpers';
import {Desktop, Mobile} from '../helpers/mediaTypes';

const React = require('react');

export default class Item extends React.Component{
  renderMoney = (text, money) => {
    // For items with no buyout price
    if (money === '0') {
      return <td/>;
    }

    return (
      <div style={{display: 'flex'}}>
        <span style={{flex: 1, justifyContent: 'flex-start'}}>
          {text}
        </span>
        <span style={{justifyContent: 'flex-end'}}>
          {money > 9999 ?
            <span className={'money-gold'}>{Math.floor((money / 10000))}</span>
            : null}
          {money > 99 ?
            <span className={'money-silver'}>{Math.floor((money / 100) % 100)}</span>
            : null}
          <span className={'money-copper'}>{Math.floor(money % 100)}</span>
        </span>
      </div>
    )
  };

  renderMoneyColumn = (bid, buyout) => {
    return (
      <div>
        {this.renderMoney('Bid:', bid)}
        {this.renderMoney('Buyout:', buyout)}
      </div>
    )
  };

  render() {
    const {metaItem, id, itemName, bid, buyout, seller, timeRemaining, quantity} = this.props.features;
    const imgHref = 'https://render-classic-us.worldofwarcraft.com/icons/56/' + metaItem.icon + '.jpg';

    return (
      <tr className={'align-middle'}>
        <td className={'align-middle'} style={{height: '100px'}}>
          <div>
            <span style={{display: 'flex', flex: 1}}>
              <a style={{color: getColorCode(metaItem.quality)}} href={'https://classicdb.ch/?item=' + id} target={'_blank'}>
                <span className={'table-row-search-icon'}
                      style={{display: 'flex', justifyContent: 'space-between', backgroundImage: 'url("'+imgHref+'")'}}>
                  <span style={{display: 'flex'}}>
                    <span style={{marginLeft: 50, display: 'flex', alignItems: 'center'}}>
                      {itemName}
                    </span>
                  </span>
                </span>
              </a>
              <span style={{color: '#fff', display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end'}}> x {quantity}</span>
            </span>
            {this.renderMoneyColumn(bid, buyout)}
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <span>Duration: <span style={{fontWeight: 'bold'}}>{TIME_REMAINING[timeRemaining-1]}</span></span>
              <span>Seller: <span style={{fontWeight: 'bold'}}>{seller}</span></span>
            </div>
          </div>
        </td>
      </tr>
    );
  }
}

