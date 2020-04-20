'use strict';
import { hot } from 'react-hot-loader/root';

import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Container, Form, FormControl, Nav, Navbar, Pagination, Table} from 'react-bootstrap';
const React = require('react');
const client = require('./client');

class App extends React.Component {
	render() {
		return (
			<ItemList/>
		)
	}
}

class ItemList extends React.Component{
	constructor(props) {
		super(props);
		this.state = {items: [], query: '', page: 0};
	}

	onSearch = (pageNum=0) => {
		client({method: 'GET', path: '/api/search?q=' + this.state.query + '&p=' + pageNum}).done(response => {
			this.setState({items: response.entity.items, page: response.entity.page});
		});
	};

	handleChange = (event) => {
		// let fieldName = event.target.name;
		let query = event.target.value;
		this.setState({query});
	};

	goToPage = (pageNum) => {
	  this.onSearch(pageNum);
	};

	getLastPage = () => {
		return this.state.page + (this.state.items.length / 15)
	};

	getPagesRemaining = () => {
		return this.state.items.length / 15;
	};

	getPagesBefore = () => {
		return this.state.page;
	};

	renderPagination = () => {
		const {page} = this.state;

		if (page == null) {
			return;
		}

		return (
			<Pagination>
				<Pagination.First onClick={() => this.goToPage(0)}/>
        <Pagination.Prev disabled={this.getPagesBefore() < 1} onClick={() => this.goToPage(page-1)}/>
				{this.getPagesBefore() >= 1 ?
					<Pagination.Ellipsis/> : null
				}
				{this.getPagesBefore() >= 2 ?
					<Pagination.Item onClick={() => this.goToPage(page-2)}>{page - 1}</Pagination.Item>
					: null}
				{this.getPagesBefore() >= 1 ?
					<Pagination.Item onClick={() => this.goToPage(page-1)}>{page}</Pagination.Item>
					: null}
				<Pagination.Item active>{page + 1}</Pagination.Item>

				{this.getPagesRemaining() >= 1 ?
					<Pagination.Item onClick={() => this.goToPage(page + 1)}>{page + 2}</Pagination.Item>
					: null}
				{this.getPagesRemaining() >= 2 ?
					<Pagination.Item onClick={() => this.goToPage(page + 2)}>{page + 3}</Pagination.Item>
					: null}
        <Pagination.Ellipsis/>
        <Pagination.Next disabled={this.getPagesRemaining() < 1} onClick={() => this.goToPage(page + 1)}/>
				<Pagination.Last onClick={() => this.goToPage(this.getLastPage())} />
			</Pagination>
		)
	};

	render() {
		const items = this.state.items.map(features =>
			<Item key={this.state.items.indexOf(features)} features={features}/>
		);
		return (
		  <Container>
				<Navbar bg="dark" variant="dark">
					<Navbar.Brand href="#home">Classic Auctions</Navbar.Brand>
					<Nav className="mr-auto">
						<Nav.Link href="#home">Home</Nav.Link>
						<Nav.Link href="#features">Features</Nav.Link>
						<Nav.Link href="#pricing">Pricing</Nav.Link>
					</Nav>
					<Form inline onSubmit={(e) => {e.preventDefault(); this.onSearch()}}>
						<FormControl type="text" placeholder="Search" className="mr-sm-2" onChange={this.handleChange}/>
						<Button variant="outline-info" onClick={this.onSearch}>Search</Button>
					</Form>
				</Navbar>
        <Table striped bordered hover size="sm" variant={"dark"}>
          <tbody>
            <tr>
              <th>Item Name</th>
              <th>Item Lvl</th>
              <th>Minimum Lvl</th>
              <th>Bid</th>
              <th>Buyout</th>
              <th>Seller</th>
              <th>Time Remaining</th>
            </tr>
            {items.slice(0, 15)}
          </tbody>
        </Table>
        {this.renderPagination()}
			</Container>
		)
	}
}

class Item extends React.Component{
	itemColor = (rarityNum) => {
		// "1eff00", 2,
		// 	"0070dd", 3,
		// 	"a335ee", 4
		switch (rarityNum) {
			case 1: {
				return '#ffffff';
			}
			case 2: {
				return '#1eff00';
			}
			case 3: {
				return '#0070dd';
			}
			case 4: {
				return '#a335ee';
			}
		}
	};

	render() {
		const {rarity, id, itemLvl, itemName, minLvlRequired, bid, buyout, seller, timeRemaining} = this.props.features;

		return (
			<tr>
				<td>
          <a style={{color: this.itemColor(rarity)}} href={'https://classicdb.ch/?item=' + id} target={'_blank'} rel={'item=' + id}>{itemName}</a>
				</td>
				<td>{itemLvl}</td>
				<td>{minLvlRequired}</td>
				<td>{bid}</td>
				<td>{buyout}</td>
				<td>{seller}</td>
				<td>{timeRemaining}</td>
			</tr>
		)
	}
}

export default hot(App);
