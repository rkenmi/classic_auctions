'use strict';
import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Container, Form, FormControl, Navbar, Row} from 'react-bootstrap';
import {Logo} from '../helpers/domHelpers';
const React = require('react');

class About extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container style={{color: '#fff', paddingTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'space-evenly'}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <a href={'https://classic-ah.com'}>
            <Logo/>
          </a>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', margin: 10}}>
          <h3>
            <span>{'About'}</span>
          </h3>
        </div>
        <div style={{margin: 30, flex: 1}}>
          <h4 style={{color: 'turquoise'}}>Goal</h4>
          Classic AH is a search engine for auction house data on WoW Classic. The goal of Classic AH is to provide
          near real-time auction house data from the convenience of your desktop, tablet, or mobile phone.

          We are currently only launched for US-West realms. If there is enough interest in this application, then we'll
          consider expanding to US-East, Europe and Oceanic!
        </div>
        <div style={{margin: 30, flex: 1}}>
          <h4 style={{color: 'turquoise'}}>Graph Trends</h4>
          The way the graph data is calculated is very basic. A point on the graph simply shows the timestamp of when the data was scanned,
          the <u>minimum buyout price</u> of that item, and the quantity of the item.
        </div>
        <div style={{margin: 30, flex: 1}}>
          <h4 style={{color: 'turquoise'}}>Donations</h4>
          If you would like to help cover the hosting costs, you can donate here. Otherwise, no biggie!

          <div style={{display: 'flex', justifyContent: 'center', marginTop: 30}}>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
              <input type="hidden" name="cmd" value="_donations" />
              <input type="hidden" name="business" value="NSK3K4THL6YGA" />
              <input type="hidden" name="item_name" value="Hosting costs for auction house!" />
              <input type="hidden" name="currency_code" value="USD" />
              <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
              <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
            </form>
          </div>
        </div>

        <div style={{margin: 30, flex: 1}}>
          <h4 style={{color: 'turquoise'}}>Issues / Feature Requests</h4>
          See a bug on the page? Or maybe you want a new feature to be added? Please email your concerns, inquiries and requests to webm.classic.ah@gmail.com.
        </div>
      </Container>
    )
  }
}

export default hot(About);
