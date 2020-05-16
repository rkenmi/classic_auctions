const qs = require('qs');

export const normalizeParam = (s) => {
  return s.replace(/[^a-zA-Z\s:\\'"]/gi,'');
};

export const normalizeNumber = (n) => {
  const num =  parseInt(n.toString().replace(/[^0-9]/gi,''));
  return num >= 0 ? num : 0;
};

export function getParamsFromURL(search) {
  const query = qs.parse(search, { ignoreQueryPrefix: true }).q;
  const page = qs.parse(search, { ignoreQueryPrefix: true }).p;
  const currentRealm = qs.parse(search, { ignoreQueryPrefix: true }).realm;
  const currentFaction = qs.parse(search, { ignoreQueryPrefix: true }).faction;

  return [query, page, currentRealm, currentFaction];
}

export function hideSuggestionItemsTooltip() {
  // Remove tooltip if the tooltip is currently hovering
  const anchors = document.getElementsByClassName('search-anchor');
  Array.from(anchors).forEach((elem) => {
    elem.dispatchEvent(new MouseEvent("mouseout"));
  });
}

export const getColorCode = (quality) => {
  switch(quality) {
    case 'Poor': {
      return '#9d9d9d';
    }
    case 'Common': {
      return '#ffffff';
    }
    case 'Uncommon': {
      return '#1eff00';
    }
    case 'Rare': {
      return '#0070dd';
    }
    case 'Epic': {
      return '#a335ee';
    }
    case 'Legendary': {
      return '#ff8000';
    }
  }
};

