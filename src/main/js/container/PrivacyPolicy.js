'use strict';
import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Container, Form, FormControl, Jumbotron, Navbar, Row} from 'react-bootstrap';
import {Logo} from '../helpers/domHelpers';
const React = require('react');

class PrivacyPolicy extends React.Component {
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
            <span>{'Privacy Policy'}</span>
          </h3>
        </div>
          <div style={{margin: 30, flex: 1}}>
            <h4 style={{color: 'turquoise'}}>Data Collection</h4>
            We collect access logs, which contains access dates and times, IP addresses and browser information.
            This data is gathered for basic analytics such as traffic peaks and to better understand the access behavior of our visitors.

            We may also collect search query input to understand what the most frequent search terms are and to
            improve the quality of our search engine.
          </div>
          <div style={{margin: 30, flex: 1}}>
            <h4 style={{color: 'turquoise'}}>Personal Information</h4>
            We do not store any user-related data such as cookies or passwords. This website is not intended to handle confidential information.
          </div>
          <div style={{margin: 30, flex: 1}}>
            <h4 style={{color: 'turquoise'}}>Security</h4>
            This website is SSL activated.
          </div>
          <div style={{margin: 30, flex: 1}}>
            <h4 style={{color: 'turquoise'}}>Questions?</h4>
            Feel free to email! webm.classic.ah@gmail.com
          </div>
			</Container>
		)
	}
}

export default hot(PrivacyPolicy);
