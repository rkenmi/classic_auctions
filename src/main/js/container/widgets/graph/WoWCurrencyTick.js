import {MISC_URL} from '../../../helpers/endpoints';
import React, {PureComponent} from 'react';

const MONEY_GOLD = MISC_URL + 'money_gold.gif';
const MONEY_SILVER = MISC_URL + 'money_silver.gif';
const MONEY_COPPER = MISC_URL + 'money_copper.gif';

export class WowCurrencyTick extends PureComponent {

  render() {
    const {
      payload, x, y
    } = this.props;

    let textOffset = -20;
    let imageOffset = -15;
    const value = payload.value;

    let valueTxt = '', ico;

    let axisRow = [];

    valueTxt = Math.floor(value % 100);
    if (valueTxt !== 0) {
      ico = MONEY_COPPER;
      axisRow.push({valueTxt, ico});
    }

    if (value > 99) {
      valueTxt = Math.floor((value / 100) % 100);
      if (valueTxt !== 0) {
        ico = MONEY_SILVER;
        axisRow.push({valueTxt, ico});
      }
    }

    if (value > 9999) {
      valueTxt = Math.floor(value / 10000);
      if (valueTxt !== 0) {
        ico = MONEY_GOLD;
        axisRow.push({valueTxt, ico});
      }
    }
    axisRow = axisRow.slice(axisRow.length - 2, axisRow.length).map((moneySlot, i) => {
      if (i === 1) {
        if (`${axisRow[0].valueTxt}`.length === 2) {
          textOffset -= 40;
          imageOffset -= 40;
        }  else if (`${axisRow[0].valueTxt}`.length === 1)  {
          textOffset -= 20;
          imageOffset -= 20;
        } else {
          textOffset -= 10;
          imageOffset -= 10;
        }
      }

      return (
        <g>
          <text x={x} y={y} dx={textOffset} fill='#666' text-anchor="end">
            {`${moneySlot.valueTxt}`}
          </text>
          <image href={moneySlot.ico} x={x + imageOffset} y={y-10} height="13px" width="13px" fill="#666" />
        </g>
      );
    });

    return <g>
      {axisRow}
    </g>
  }
}

