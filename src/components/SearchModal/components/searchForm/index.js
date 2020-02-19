import React from 'react';
import Presentation from './presentation';
import select from '../../../../context/selectors/';
import {withContext} from '../../../../context/withContext';
import {
    loadLatestProducts,
    setSearchResults,
    setActiveResultIndex
} from '../../../../context/actions/components/searchForm/actions';

const SetalliteSelect = (props) => {
    const {dispatch, state} = props;

    const activeInfoModalKey = select.rootSelectors.getActiveInfoModalKey(state);
    const activeInfoModal = select.rootSelectors.getInfoModal(state, activeInfoModalKey);
    const visible = !!activeInfoModalKey && activeInfoModal.type === 'SEARCH';
    const coordinates = visible ? activeInfoModal.coordinates : null;
    const satellites = select.data.satellites.getSubstate(state);

    const searchCoords = async(satelliteId, productId) => {
        // setLoading(false);
        try {
            const shortName = `${satelliteId[0].toUpperCase()}-${satelliteId.substring(1,3).toUpperCase()}`;
            const results = await loadLatestProducts(shortName, [productId]);
            dispatch(setSearchResults(results))
            if(results && results.length > 0) {
                dispatch(setActiveResultIndex(0))
            }
        } catch (e) {
            // setError(e.message || 'Unexpected error');
        }
        // setLoading(false);
    };


    return (
        <Presentation 
            coordinates={coordinates}
            satellites={satellites}
            search={searchCoords}
            />
    )
}

export default withContext(SetalliteSelect);