import React from 'react';
import Presentation from './presentation';
import select from '../../../../context/selectors/';
import {withContext} from '../../../../context/withContext';
import {
    loadLatestProducts,
    setSearchResults,
    setActiveResultIndex
} from '../../../../context/actions/components/searchForm/actions';

const getPreviousIndex = (curIndex, minIndex = 0) => {
    if(Number.isInteger(curIndex) && curIndex - 1 >= minIndex) {
        return curIndex - 1;
    } else {
        return null;
    }
}

const getNextIndex = (curIndex, maxIndex) => {
    if(Number.isInteger(curIndex) && curIndex + 1 <= maxIndex) {
        return curIndex + 1;
    } else {
        return null;
    }
}

const SetalliteSelect = (props) => {
    const {dispatch, state} = props;

    const activeInfoModalKey = select.rootSelectors.getActiveInfoModalKey(state);
    const activeInfoModal = select.rootSelectors.getInfoModal(state, activeInfoModalKey);
    const visible = !!activeInfoModalKey && activeInfoModal.type === 'SEARCH';
    const coordinates = visible ? activeInfoModal.coordinates : null;
    const satellites = select.data.satellites.getSubstate(state);
    const results = select.components.search.getResults(state) || [];
    const activeResultIndex = select.components.search.getActiveResultIndex(state);
    const result = (Number.isInteger(activeResultIndex) && results[activeResultIndex]) || null;
    const nextResultIndex = getNextIndex(activeResultIndex, results.length);
    const previousResultIndex = getPreviousIndex(activeResultIndex);
    
    const searchCoords = async(satelliteId, productId, location) => {
        // setLoading(false);
        try {
            const shortName = `${satelliteId[0].toUpperCase()}-${satelliteId.substring(1,3).toUpperCase()}`;
            const results = await loadLatestProducts(shortName, [productId], location);
            dispatch(setSearchResults(results))
            if(results && results.length > 0) {
                dispatch(setActiveResultIndex(0))
            }
        } catch (e) {
            // setError(e.message || 'Unexpected error');
        }
        // setLoading(false);
    };

    const changeActiveResultIndex = (index) => dispatch(setActiveResultIndex(index));


    return (
        <Presentation 
            coordinates={coordinates}
            satellites={satellites}
            search={searchCoords}
            activeResultIndex={activeResultIndex}
            nextResultIndex={nextResultIndex}
            previousResultIndex={previousResultIndex}
            changeActiveResultIndex={changeActiveResultIndex}
            result={result}
            />
    )
}

export default withContext(SetalliteSelect);