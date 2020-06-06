import React, {PureComponent} from 'react';
import moment from 'moment';

export class CustomizedAxisTick extends PureComponent {

  format12Hr(tick) {
    return moment(tick).format('h:mm a')
  }

  format1Wk(tick) {
    return moment(tick).format('MMM Do')
  }

  render() {
    const {
      x, y, stroke, payload, timespan
    } = this.props;

    let format = timespan === 0 ? this.format12Hr : this.format1Wk;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-25)">
          {format(payload.value)}
        </text>
      </g>
    );
  }
}

