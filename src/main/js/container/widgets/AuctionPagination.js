
const React = require('react');

import {Dropdown, Pagination} from 'react-bootstrap';

export default class AuctionPagination extends React.Component {
  renderByCondition(condition, dom, failDom=null) {
    return condition ? dom : failDom;
  }

  renderFirstPageLink(page) {
    return this.renderByCondition(page > 0,
      <a className='pagination-item page-link' href={this.props.getPageHref(0)}>
        <span aria-hidden="true">«</span>
        <span className="sr-only">Previous</span>
      </a>,
      <span style={{width: '3em'}}/>
    )
  }

  renderPreviousPageLink(page) {
    return this.renderByCondition(page > 0,
      <a className='pagination-item page-link' href={this.props.getPageHref(page-1)}>
        <span aria-hidden="true">‹</span>
        <span className="sr-only">Previous</span>
      </a>,
      <span style={{width: '3em'}}/>
    )
  }

  renderLastPageLink(page) {
    return this.renderByCondition(page < this.getLastPage(),
      <a className='pagination-item page-link' href={this.props.getPageHref(this.getLastPage())}>
        <span aria-hidden="true">»</span>
        <span className="sr-only">Last</span>
      </a>,
      <span style={{width: '3em'}}/>
    )
  }

  renderNextPageLink(page) {
    return this.renderByCondition(page < this.getLastPage(),
      <a className='pagination-item page-link' href={this.props.getPageHref(page+1)}>
        <span aria-hidden="true">›</span>
        <span className="sr-only">Next</span>
      </a>,
      <span style={{width: '3em'}}/>
    )
  }

  getLastPage = () => {
    return this.props.page + Math.ceil((this.props.count - 1) / 15)
  };

  getPagesRemaining = () => {
    return Math.ceil((this.props.count - 1) / 15);
  };

  render() {
    const {page, items, loading} = this.props;

    if (loading || !items || items.length === 0) {
      return null;
    }

    return (
      <Pagination style={{flex: 1, justifyContent: 'center'}}>
        {this.renderFirstPageLink(page)}
        {this.renderPreviousPageLink(page)}
        {this.renderByCondition(page > 1, <a className='pagination-item page-link' href={this.props.getPageHref(page-2)}>{page - 1}</a>)}
        {this.renderByCondition(page > 0, <a className='pagination-item page-link' href={this.props.getPageHref(page-1)}>{page}</a>)}
        <Pagination.Item className={'pagination-item current'}>{page + 1}</Pagination.Item>
        {this.renderByCondition(this.getPagesRemaining() > 0, <a className='pagination-item page-link' href={this.props.getPageHref(page+1)}>{page+2}</a>)}
        {this.renderByCondition(this.getPagesRemaining() > 1, <a className='pagination-item page-link' href={this.props.getPageHref(page+2)}>{page+3}</a>)}
        {this.renderNextPageLink(page)}
        {this.renderLastPageLink(page)}
      </Pagination>
    )
  }
}

