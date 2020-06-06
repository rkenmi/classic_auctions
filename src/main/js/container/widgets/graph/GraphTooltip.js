import React from 'react';
import moment from 'moment';

const renderMoney = (money) => {
  // For items with no buyout price
  if (money == '0') {
    return <span style={{border: 0}}/>;
  }

  return (
    <span style={{display: 'inline'}}>
        <span style={{justifyContent: 'flex-end'}}>
          {money > 9999 ?
            <span className={'money-gold'}>{Math.floor((money / 10000))}</span>
            : null}
          {money > 99 ?
            <span className={'money-silver'}>{Math.floor((money / 100) % 100)}</span>
            : null}
          <span className={'money-copper'}>{Math.floor(money % 100)}</span>
        </span>
      </span>
  )
};

export const CustomTooltip = (props) => {
  const { active, payload, label, item}  = props;

  const maxStack = item ? item.metaItem.maxStack : null;

  const formatTick = (tick) => moment(tick).format('M/D h:mm a');
  if (active) {
    const items = props.payload;
    if (!items || items.length === 0) {
      return null;
    }

    const quantity = items[0].payload.quantity;
    return (
      <div style={{backgroundColor: '#777', borderRadius: 3, padding: 10, paddingBottom: 1, color: 'white'}}>
        <p className="label" style={{fontWeight: 500}}>{`${formatTick(label)}`}
        </p>
        <div>
          <span style={{color: 'lightblue'}}><strong>Buy:</strong> {renderMoney(payload[0].value)} </span>
          {maxStack > 1 ?
            <div style={{color: '#F08080'}}><strong>Buy ({maxStack}x):</strong> {renderMoney(payload[0].value * maxStack)} </div>
            : null
          }
        </div>
        <p style={{color: 'lightgreen'}}>
          <strong>Qty:</strong> {quantity}
        </p>
      </div>
    );
  }

  return null;
};

