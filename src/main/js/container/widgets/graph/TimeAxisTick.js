import React, {PureComponent} from 'react';
import moment from 'moment';

export class CustomizedAxisTick extends PureComponent {

  format(tick) {
    return moment(tick).format('h:mm a')
  }

  render() {
    const {
      x, y, stroke, payload,
    } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-25)">
          {this.format(payload.value)}
        </text>
      </g>
    );
  }
}

