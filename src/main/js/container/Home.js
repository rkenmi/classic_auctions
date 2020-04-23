'use strict';
import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Container, Form, FormControl, Row} from 'react-bootstrap';
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
			<Container style={{marginTop: '10%'}}>
        <Row style={{display: 'flex', justifyContent: 'center'}}>
					<h1>{'Classic Auctions'}</h1>
				</Row>
				<Container style={{display: 'flex', width: '50%', justifyContent: 'center'}}>
					<Form style={{marginTop: '5%', width: '500px'}} onSubmit={(e) => {e.preventDefault(); this.onSearch()}}>
						<FormControl type="text" placeholder="Search" className="mb-3" onChange={this.handleChange}/>
					</Form>
				</Container>
			</Container>
		)
	}
}

export default hot(Home);
