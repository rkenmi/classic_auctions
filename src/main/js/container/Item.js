import {TIME_REMAINING} from '../helpers/constants';
import {getColorCode} from '../helpers/searchHelpers';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChartBar} from '@fortawesome/free-solid-svg-icons';
import {Button} from 'react-bootstrap';

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
      <td className={'align-middle'}>
        {this.renderMoney('Bid:', bid)}
        {this.renderMoney('Buyout:', buyout)}
      </td>
    )
  };

  renderGraphColumn = () => {
    return (
      <td className={'align-middle'}>
        <div style={{display: 'flex'}}>
          <Button size='sm' variant={'outline-info'} onClick={this.props.onClickGraph}>
            <FontAwesomeIcon icon={faChartBar} />
          </Button>
        </div>
      </td>
    )
  };

  render() {
    const {metaItem, id, itemName, bid, buyout, seller, timeRemaining, quantity} = this.props.features;
    const imgHref = 'https://render-classic-us.worldofwarcraft.com/icons/56/' + metaItem.icon + '.jpg';

    return (
      <tr className={'align-middle'}>
        <td className={'align-middle'}>{quantity}</td>
        <td className={'align-middle'} style={{ height: '75px'}}>
          <a style={{color: getColorCode(metaItem.quality)}} href={'https://classicdb.ch/?item=' + id} target={'_blank'} data-wowhead={'item=' + id + '&domain=classic'}>
            <span className={'table-row-search-icon'}
                  style={{display: 'flex', justifyContent: 'space-between', backgroundImage: 'url("'+imgHref+'")'}}>
              <span style={{display: 'flex'}}>
                <span style={{marginLeft: 50, display: 'flex', alignItems: 'center'}}>
                  {itemName}
                </span>
              </span>
            </span>
          </a>
        </td>
        <td className={'align-middle'}>{metaItem.minLvlRequired}</td>
        {this.renderMoneyColumn(bid, buyout)}
        <td className={'align-middle'}>{seller}</td>
        <td className={'align-middle'}>{TIME_REMAINING[timeRemaining-1]}</td>
        {this.renderGraphColumn()}
      </tr>
    );
  }
}

