const React = require('react');
import {Dropdown, DropdownButton} from 'react-bootstrap';
import allianceIcon from '../../../resources/static/images/alliance_50.png';
import hordeIcon from '../../../resources/static/images/horde_50.png';

export default class FactionDropdown extends React.Component {
  getIconOrText() {
    const {currentFaction} = this.props;
    if (currentFaction !== 'Alliance' && currentFaction !== 'Horde') {
      return 'Faction';
    }

    const icon = currentFaction === 'Alliance' ? allianceIcon : hordeIcon;

    return <img style={{width: 22}} src={icon} alt={currentFaction}/>
  }

  render() {
    const {currentFaction, style} = this.props;

    let styling = {marginLeft: 10};
    if (style) {
      styling = {...styling, ...style}
    }

    return (
      <DropdownButton variant='info' id="dropdown-item-button"
                      title={this.getIconOrText()}
                      style={styling}>

        <Dropdown.Item as="button" onSelect={() => {this.props.onSelect('Alliance')}}><img src={allianceIcon}/> Alliance</Dropdown.Item>
        <Dropdown.Item as="button" onSelect={() => {this.props.onSelect('Horde')}}><img src={hordeIcon}/> Horde</Dropdown.Item>
      </DropdownButton>
    )
  }
}

