import React from 'react';
import Presentation from './presentation';
import select from '../../../../context/selectors/';
import {withContext} from '../../../../context/withContext';
import {
    searchProducts,
} from '../../../../context/actions';

const SetalliteSelect = (props) => {
    const {dispatch, state} = props;

    const activeInfoModalKey = select.rootSelectors.getActiveInfoModalKey(state);
    const activeInfoModal = select.rootSelectors.getInfoModal(state, activeInfoModalKey);
    const visible = !!activeInfoModalKey && activeInfoModal.type === 'SEARCH';
    const coordinates = visible ? activeInfoModal.coordinates : null;
    const satellites = select.data.satellites.getSubstate(state);
    const search = (satelliteId, productId) => dispatch(searchProducts(satelliteId, productId));
    return (
        <Presentation 
            coordinates={coordinates}
            satellites={satellites}
            search={search}
            />
    )
}

export default withContext(SetalliteSelect);