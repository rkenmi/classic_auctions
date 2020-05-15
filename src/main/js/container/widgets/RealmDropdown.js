const React = require('react');
import {Dropdown, DropdownButton} from 'react-bootstrap';

export default class RealmDropdown extends React.Component {
  render() {
    const {realms, currentRealm, style} = this.props;

    let styling = {marginLeft: 10};
    if (style) {
      styling = {...styling, ...style};
    }

    return (
      <DropdownButton variant='info'
                      id="dropdown-item-button"
                      title={realms.includes(currentRealm) ? currentRealm : "Realm"}
                      style={styling}>
        {realms.map((realm) => {
          return (
            <Dropdown.Item
              key={realms.indexOf(realm)} as="button"
              onSelect={() => {this.props.onSelect(realm)}}>{realm}
            </Dropdown.Item>
          );
        })}
      </DropdownButton>
    )
  }
}

