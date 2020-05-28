import {Button, DropdownItem, Form, InputGroup} from 'react-bootstrap';
import {
  hintContainer,
  Input,
  Menu,
  menuItemContainer,
  Typeahead,
  TypeaheadInputSingle
} from 'react-bootstrap-typeahead';
import {getColorCode, hideSuggestionItemsTooltip} from '../helpers/searchHelpers';
import {connect} from 'react-redux';
import {setSearchBarRef} from '../actions/actions';
import React from 'react';
import {Desktop, Mobile, Tablet} from '../helpers/mediaTypes';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {TINY_ICON_URL} from '../helpers/endpoints';

class AuctionHouseSearch extends React.Component {

  componentWillUnmount() {
    this.props.setRef(null);
  }

  renderSuggestionRow(result, index) {
    const TypeaheadMenuItem = menuItemContainer(DropdownItem);
    const iconUrl = TINY_ICON_URL + result.icon + '.png';

    return (
      <div key={'search-anchor-' + index}>
        <a data-wh-icon-size="small" data-entity-has-icon={"true"} href={'#'}
           className={'search-anchor'}
           onClick={(e) => {
             e.preventDefault();
             e.currentTarget.dispatchEvent(new MouseEvent("mouseout"))
           }}
           target={'_blank'}
           data-wowhead={'item=' + result.id + '&domain=classic'}
           style={{flex: 1}}>
            <TypeaheadMenuItem as={'span'} bsPrefix='suggestion-dropdown-item'
                               position={index}
                               option={result} active={result.itemName === this.props.query}>
              <div className={'suggestion-search-icon'}
                   style={{display: 'flex', justifyContent: 'space-between', backgroundImage: 'url("'+iconUrl+'")'}}>
                <div>
                  <span style={{color: getColorCode(result.quality)}}>{result.itemName}</span>
                </div>
                <Desktop>
                  <span style={{display: 'flex', color: '#fff', textDecoration: 'none', justifyContent: 'flex-end', alignItems: 'center', fontSize: 10}}>
                    {result.classType}
                  </span>
                </Desktop>
                <Mobile>
                  {null}
                </Mobile>
              </div>
            </TypeaheadMenuItem>
        </a>
      </div>
    );
  }

  getTypeahead() {
    let styling = {flex: 1};

    if (this.props.typeaheadStyle) {
      styling = this.props.typeaheadStyle;
    }

    return (
      <Typeahead
        ref={this.setTypeaheadRef}
        id={'ah-typeahead'}
        renderMenu={(results, menuProps) => (
          <Menu {...menuProps}>{results.map((r, i) => this.renderSuggestionRow(r, i))}</Menu>
        )}
        style={styling}
        defaultInputValue={this.props.query}
        labelKey="name"
        renderInput={(inputProps) => (
          <TypeaheadInputSingle {...inputProps} ref={inputProps.ref} value={this.props.query}/>
        )}
        open={this.shouldOpenSuggestions()}
        options={this.props.options}
        placeholder="Search for an item"
        onInputChange={this.props.onInputChange}
        onChange={this.props.onChange}
        onKeyDown={this.onKeyDown}
      />
    )
  }

  shouldOpenSuggestions = () => {
    // undefined means the Typeahead component controls when to open/close. false means it will never open.
    // Suggestions should never be open if the realm and faction isn't specified
    return this.props.currentRealm && this.props.currentFaction ? undefined : false
  };

  onKeyDown = (e) => {
    hideSuggestionItemsTooltip();
    this.props.onKeyDown(e);
  };

  setTypeaheadRef = (ref) => {
    if (this.props.searchBarRef) {
      return;
    }

    this.props.setRef(ref);
  };

  renderMobileOrTablet() {
    return (
      <InputGroup style={{flex: 1}}>
        {this.getTypeahead()}
        <InputGroup.Append>
          <Button onClick={() => {this.props.onSearch()}}>
            <FontAwesomeIcon icon={faSearch} inverse/>
          </Button>
        </InputGroup.Append>
      </InputGroup>
    )
  }

  render() {
    if (this.props.pureTypeahead) {
      return this.getTypeahead();
    }

    let button = <Button style={{marginLeft: 10}} variant="outline-info"
                         onClick={() => this.props.onSearch()}>Search</Button>;
    if (this.props.useIconAsButton) {
      button = <Button onClick={() => {this.props.onSearch()}}>
          <FontAwesomeIcon icon={faSearch} inverse/>
        </Button>
    }

    let formWidth = {};
    if (this.props.formWidth) {
      formWidth['width'] = this.props.formWidth;
    }

    return (
      <Form inline onSubmit={this.props.onSearch} style={{flex: 1, justifyContent: 'flex-start', ...formWidth}}>
        <Desktop>
          {this.getTypeahead()}
          {button}
        </Desktop>
        <Mobile>
          {this.renderMobileOrTablet()}
        </Mobile>
        <Tablet>
          {this.renderMobileOrTablet()}
        </Tablet>
      </Form>
    )
  }
}

function mapStateToProps(state) {
  return {
    searchBarRef: state.visibilityReducer.searchBarRef,
    query: state.pageReducer.query,
    currentRealm: state.pageReducer.currentRealm,
    currentFaction: state.pageReducer.currentFaction
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setRef: (ref) => {
      dispatch(setSearchBarRef(ref));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuctionHouseSearch);
