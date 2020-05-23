import {Desktop, Mobile, Tablet} from '../../helpers/mediaTypes';

const React = require('react');
import {MISC_URL} from '../../helpers/endpoints';

import {Dropdown} from 'react-bootstrap';
import useMediaQuery from 'react-responsive/src/useMediaQuery';

const ALLIANCE_ICON = MISC_URL + 'alliance_50.png';
const HORDE_ICON = MISC_URL + 'horde_50.png';


export default class RealmDropdown extends React.Component {
  state = {
    submenu: {}
  };

  getTitle() {
    const {realms, currentRealm, currentFaction, style} = this.props;

    let realmDisplay = 'Realm', factionDisplay = null;
    if (realms.includes(currentRealm)) {
      realmDisplay = currentRealm;
    }

    if (['Horde', 'Alliance'].includes(currentFaction)) {
      const icon = currentFaction === 'Alliance' ? ALLIANCE_ICON : HORDE_ICON;
      factionDisplay = <img style={{width: 30}} src={icon} alt={currentFaction}/>
    }

    return (
      <span>
        <span>
          {realmDisplay}
        </span>
        <span style={{marginLeft: 5}}>
          {factionDisplay}
        </span>
      </span>
    )
  }

  renderSubmenu() {
    return (
      <div style={{
        position: 'absolute',
        background: 'white',
        border: '1px black',
        borderRadius: 3,
        left: this.state.submenu.x,
        top: this.state.submenu.y
      }}>
        {this._renderSubmenuItems()}
      </div>
    )
  }

  _renderSubmenuItems() {
    if (!this.state.submenu.show) {
      return;
    }

    return (
      <div>
        <Dropdown.Item as="button" onSelect={() => {this.props.onSelectRealmAndFaction(this.state.realm, 'Alliance');}}> <img src={ALLIANCE_ICON}/></Dropdown.Item>
        <Dropdown.Item as="button" onSelect={() => {this.props.onSelectRealmAndFaction(this.state.realm, 'Horde');}}> <img src={HORDE_ICON}/></Dropdown.Item>
      </div>
    );
  }

  onClick = (event, realm) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    const parentRect = document.getElementById('realmDropdown').getBoundingClientRect();
    const box = document.getElementById('realmDropdownBox').getBoundingClientRect();
    this.setState({
      realm,
      submenu: {
        x: box.width,
        y: rect.top - parentRect.top,
        show: true
      }
    })
  };

  PlatformedMenu = () => {
    const {realms, currentRealm, style} = this.props;

    let styling = {marginLeft: 10};
    if (style) {
      styling = {...styling, ...style};
    }
    const isLowHeight = useMediaQuery({
      query: '(max-device-height: 500px)'
    });

    const dropdownSize = isLowHeight ? 140 : 325;

    return (
      <Dropdown id={'realmDropdown'} style={styling} onToggle={(isOpen) => {if (!isOpen) this.setState({submenu: {show: false}})}}>
        <Dropdown.Toggle variant='info'
                         id="dropdown-item-button"
                         >
          {this.getTitle()}
        </Dropdown.Toggle>
        <Dropdown.Menu id={'realmDropdownBox'} onScroll={() => {this.setState({submenu: {show: false}})}} style={{overflowY: 'auto', maxHeight: dropdownSize}}>
          <Dropdown drop={'right'}>
            {realms.map((realm) => {
              return (
                <Dropdown.Toggle
                  key={'realmDropDown' + realms.indexOf(realm)} title={realm} drop={'right'}
                  onClick={(e) => this.onClick(e, realm)}
                  onSelect={(k, e) => {e.preventDefault(); e.stopPropagation()}}
                  id={'dropdown-button-drop-right'} className={'dropdown-realm'}
                  variant={'realm'}>
                  {realm}
                </Dropdown.Toggle>
              );
            })}
          </Dropdown>
        </Dropdown.Menu>
        {this.renderSubmenu()}
      </Dropdown>
    );
  };


  render() {
    const Menu = this.PlatformedMenu;
    return <Menu/>
  }
}

