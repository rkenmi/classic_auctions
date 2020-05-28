'use strict';
import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Container, Form, FormControl, Navbar, Row} from 'react-bootstrap';
import {Desktop, Mobile, Tablet} from '../helpers/mediaTypes';
const React = require('react');

class Error extends React.Component {
  constructor(props) {
  	super(props);
  	this.state = {query: ''};
	}

	onSearch = () => {
		this.props.history.push('/search?q=' + this.state.query);
	};

	handleChange = (event) => {
		// let fieldName = event.target.name;
		let query = event.target.value;
		this.setState({query});
	};

	render() {
		return (
			<Container style={{paddingTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'space-around'}}>
				<Row style={{marginBottom: 20, justifyContent: 'center'}}>
          <Desktop>
            <h1>{'Page not found!'}</h1>
					</Desktop>
					<Tablet>
						<h1>{'Page not found!'}</h1>
					</Tablet>
          <Mobile>
						<h3>{'Page not found!'}</h3>
					</Mobile>
				</Row>
				<Row style={{marginBottom: 20, justifyContent: 'center'}}>
          <img alt=":(" src={"https://i.kym-cdn.com/entries/icons/original/000/020/131/Spongebob_Lifegard.jpg"} />
				</Row>
			</Container>
		)
	}
}

export default hot(Error);
