import React from 'react';
import PropTypes from "prop-types";
import Icon from '../atoms/Icon';
import { css } from '@emotion/core'
import './style.scss';

const closeIconStyle = {
  width: '1.5rem',
};

const closeStyle = {
  display: 'flex',
  flexFlow: 'column',
  position: 'absolute',
  cursor: 'pointer',
  top: '0px',
  right: '0px',
  fill: 'rgb(226, 236, 249)',
  stroke: 'rgb(226, 236, 249)',
  ':hover:focus': {
      fill: 'rgb(93, 93, 253)',
      stroke: 'rgb(93, 93, 253)',        
  }
}

const SearchToolbarPresentation = (props) => {
    const {onClose, vertical} = props;

    return (<div className={'search-toolbar'}>
            <span onClick={() => {onClose()}} style={closeStyle}>
              <Icon icon={'times'} style={closeIconStyle}/>
            </span>
    </div>)
}

SearchToolbarPresentation.propTypes = {
    vertical:PropTypes.bool,
    onClose:PropTypes.func,
  }

  SearchToolbarPresentation.defaultProps = {
    vertical:false,
    onClose:() => {},
  }

export default SearchToolbarPresentation;