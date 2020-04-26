'use strict';
import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Container, Form, FormControl, Navbar, Row} from 'react-bootstrap';
const React = require('react');

class Home extends React.Component {
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
			<Container style={{marginTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'space-around'}}>
				<Row style={{marginBottom: 20, justifyContent: 'center'}}>
					<h1>{'Classic Auctions'}</h1>
				</Row>
				<Row style={{marginBottom: 20, justifyContent: 'center'}}>
					<Form style={{width: 250}} onSubmit={(e) => {e.preventDefault(); this.onSearch()}}>
						<FormControl type="text" placeholder="Search" onChange={this.handleChange}/>
					</Form>
				</Row>
			</Container>
		)
	}
}

export default hot(Home);
