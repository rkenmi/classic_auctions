import React from 'react';
import {useMediaQuery} from 'react-responsive';

export const Logo = (props) => {
  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-device-width: 1224px)'
  })
  const isBigScreen = useMediaQuery({ query: '(min-device-width: 1824px)' })
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
  const isTabletOrMobileDevice = useMediaQuery({
    query: '(max-device-width: 1224px)'
  })
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' })
  const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' })

  if (props.isHomePage === true) {
    return (<h1>Classic <span>AH</span></h1>)
  } else if (isDesktopOrLaptop) {
    return (<h2>Classic <span>AH</span></h2>)
  } else {
    return (<h3>Classic <span>AH</span></h3>)
  }
};

