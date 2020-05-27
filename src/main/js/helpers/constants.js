export const constants = {

};

export const TIME_REMAINING = ['Short', 'Medium', 'Long', 'Very Long'];

export const SORT_FIELDS = {
  BID: 'bid',
  BUYOUT: 'buyout',
  QUANTITY: 'quantity',
  PRICE: 'price',  // TODO: remove this
};

export const SORT_FIELDS_DISPLAY_NAMES = {
  [SORT_FIELDS.QUANTITY]: 'Qty',
  [SORT_FIELDS.BUYOUT]: 'Buyout',
  [SORT_FIELDS.BID]: 'Bid',
  [SORT_FIELDS.PRICE]: 'Price',  // TODO: remove this
};

export const SORT_ORDERS = {
  NONE: 0,
  DESCENDING: 1,
  ASCENDING: 2,
};