import React from 'react';
import Presentation from './presentation';
import {withContext} from '../../context/withContext';
import select from '../../context/selectors/';

import {
    setVisibility,
    setActiveIndexAndUpdateTime,
    updateSearch,
} from '../../context/actions/components/searchToolbar';


const SearchToolbar = ({dispatch, state}) => {
    //info modal state
    // const activeInfoModalKey = select.rootSelectors.getActiveInfoModalKey(state);
    // const activeInfoModal = select.rootSelectors.getInfoModal(state, activeInfoModalKey);
    // const visible = !!activeInfoModalKey && activeInfoModal.type === 'SEARCH';
    // const coordinates = visible ? activeInfoModal.coordinates : null;
    const vertical = select.rootSelectors.getLandscape(state);
    const loading = select.components.searchToolbar.getLoading(state);
    const activeResultIndex = select.components.searchToolbar.getActiveResultIndex(state);
    const lastResultIndex = select.components.searchToolbar.getLastResultIndex(state);
    const geometry = select.components.searchToolbar.getGeometry(state);
    const previousResultIndex = activeResultIndex !== 0 ? activeResultIndex - 1 : null;
    const nextResultIndex = activeResultIndex !== lastResultIndex ? activeResultIndex + 1 : null;
    const activeSatProductsPairs = select.rootSelectors.getActiveSatProductsPairs(state);
    const noProductsActive = activeSatProductsPairs.length === 0;
    const activeProduct =  !noProductsActive ? select.components.searchToolbar.getActiveResult(state) : null;

    const onClose = () => {
        dispatch(setVisibility(false));
        //clear
    }

    const onSearchParamsChanged = () => {
        updateSearch(dispatch, state);
    }

    const onNextResultClick = nextResultIndex !== null ? () => {
        setActiveIndexAndUpdateTime(dispatch, state, nextResultIndex);
    } : null;

    const onPreviousResultClick = previousResultIndex !== null ? () => {
        setActiveIndexAndUpdateTime(dispatch, state, previousResultIndex);
    } : null;
    
    return (
        <Presentation 
            vertical={vertical}
            onClose={onClose}
            displayNoProductsActive={noProductsActive}
            loading={loading}
            activeProduct={activeProduct}
            title={activeSatProductsPairs}
            onNextResultClick={onNextResultClick}
            onPreviousResultClick={onPreviousResultClick}
            activeSatProductsPairs={activeSatProductsPairs}
            onSearchParamsChanged = {onSearchParamsChanged}
            geometry = {geometry}
            />
    )
}

export default withContext(SearchToolbar);