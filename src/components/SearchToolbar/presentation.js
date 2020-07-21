import React, {useEffect} from 'react';
import PropTypes from "prop-types";
import Icon from '../atoms/Icon';
import usePrevious from '../../utils/hooks/usePrevious';
import Button from '../atoms/Button';
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

const getSatPairsInString = (satPairs = []) => {
  return satPairs.map((a) => `${a[0]}-${a[1].join(',')}`).join(',');
}

const SearchToolbarPresentation = (props) => {
    const {onClose, vertical, onPreviousResultClick, onNextResultClick, loading, displayNoProductsActive, activeSatProductsPairs, onSearchParamsChanged, geometry, activeProduct} = props;

    const prevAmount = usePrevious({activeSatProductsPairs, geometry});

    useEffect(() => {
      if(prevAmount) {
        const activeSatProductsPairsSame = (prevAmount.activeSatProductsPairs === activeSatProductsPairs) || (prevAmount.activeSatProductsPairs && getSatPairsInString(prevAmount.activeSatProductsPairs) === (activeSatProductsPairs && getSatPairsInString(activeSatProductsPairs)));
        const geometryChanged = prevAmount.geometry !== geometry;
        if(!activeSatProductsPairsSame || geometryChanged) {
          onSearchParamsChanged();
        }
      }
    });

    return (<div className={'search-toolbar'}>
            { !displayNoProductsActive && loading ? <div>loading</div> : null}
            { displayNoProductsActive ? <div>No products selected</div> : null}
            { !loading && !displayNoProductsActive &&!activeProduct && activeSatProductsPairs ? <div>No data</div> : null}
            {!loading && activeProduct ? 
              <>
                <Button 
                  ghost
                  onClick={() => onPreviousResultClick()}
                  disabled = {onPreviousResultClick === null}
                  >
                    Previous
                </Button>
                <div className={'title'}>
                  {activeProduct.title}
                </div>
                <Button 
                  ghost
                  onClick={() => onNextResultClick()}
                  disabled = {onNextResultClick === null}
                  >
                    next
                </Button>
              </> : null
            }
            <span onClick={() => {onClose()}} style={closeStyle}>
              <Icon icon={'times'} style={closeIconStyle}/>
            </span>
    </div>)
}

SearchToolbarPresentation.propTypes = {
    vertical: PropTypes.bool,
    onClose: PropTypes.func,
    onPreviousResultClick: PropTypes.func,
    onNextResultClick: PropTypes.func,
    loading: PropTypes.bool,
    displayNoProductsActive: PropTypes.bool,
    activeSatProductsPairs: PropTypes.array,
    onSearchParamsChanged: PropTypes.func,
    geometry: PropTypes.object,
    activeProduct: PropTypes.object,
  }

  SearchToolbarPresentation.defaultProps = {
    vertical:false,
    onClose:() => {},
    onPreviousResultClick: () => {},
    onNextResultClick: () => {},
    loading: false,
    displayNoProductsActive: false,
    activeSatProductsPairs: [],
    onSearchParamsChanged: () => {},
    geometry: null,
    activeProduct: null,
  }

export default SearchToolbarPresentation;