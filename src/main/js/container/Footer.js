import {Link} from 'react-router-dom';

const React = require('react');

import {Container, Dropdown} from 'react-bootstrap';
import {useMediaQuery} from 'react-responsive';
import {connect} from 'react-redux';
import { hot } from 'react-hot-loader/root';
import moment from 'moment';

const PageLinks = (props) => {
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-device-width: 1224px)'
  });

  const footerWidth = isDesktopOrLaptop ? '35%' : '100%';

  return (
    <div id={'ah-footer'} style={{
      marginBottom: 5,
      display: 'flex',
      width: footerWidth,
      justifyContent: 'space-evenly',
      color: '#fff',
      fontSize: 11
    }}>
      <Link to={'/'}>Home</Link>
      <Link to={'/about'}>About</Link>
      <Link to={'/privacy'}>Privacy Policy</Link>
      <Link to={'/tos'}>Terms of Service</Link>
    </div>
  )
};

class Footer extends React.Component {
  state = {
    submenu: {}
  };

  render() {
    const {items, queryMs, location} = this.props;

    let dateDom, latencyDom;
    if (items && items.length > 0 && location.pathname === '/search') {
      const dateStr = moment(new Date(items[0].timestamp)).fromNow();
      dateDom = <div style={{color: '#fff', fontSize: 10}}>Last data refresh: {dateStr}</div>;
    }

    if (queryMs && location.pathname === '/search') {
      latencyDom = <div style={{color: '#fff', fontSize: 10}}>Query response time: {queryMs} ms</div>;
    }

    return (
      <Container style={{height: '10vh'}}>
        <Container style={{position: 'absolute', left: 0, right: 0,  bottom: '-5vh', marginBottom: '5vh', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <PageLinks/>
          {dateDom}
          {latencyDom}
        </Container>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    items: state.pageReducer.items,
    queryMs: state.pageReducer.queryMs,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(hot(Footer))
