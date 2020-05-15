export const normalizeParam = (s) => {
  return s.replace(/[^a-zA-Z\s:\\'"]/gi,'');
};

export const normalizeNumber = (n) => {
  return parseInt(n.toString().replace(/[^0-9]/gi,''));
};


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

