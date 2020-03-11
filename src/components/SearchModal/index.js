import React from 'react';
import Presentation from './presentation';
import {withContext} from '../../context/withContext';
import {getProductByKey} from '../../components/WorldWindMap/layers';
// import Icon from '../Icon';
import {
    updateInfoModal,
    setActiveInfoModal,
} from '../../context/actions';

import {
    resetSearchComponent,
} from '../../context/actions/components/searchForm/actions';

import select from '../../context/selectors/';


// ReactModal.setAppElement('#root');

const SearchModal = ({dispatch, state}) => {
    //info modal state
    const activeInfoModalKey = select.rootSelectors.getActiveInfoModalKey(state);
    const activeInfoModal = select.rootSelectors.getInfoModal(state, activeInfoModalKey);
    const visible = !!activeInfoModalKey && activeInfoModal.type === 'SEARCH';
    const coordinates = visible ? activeInfoModal.coordinates : null;
    const vertical = select.rootSelectors.getLandscape(state);
    const onInfoModalClose = () => {
        dispatch(updateInfoModal(activeInfoModalKey, {open: false}));
        dispatch(setActiveInfoModal(null));
        resetSearchComponent(dispatch);

    }

    return (
        visible ? <Presentation 
            visible={visible}
            vertical={vertical}
            onClose={onInfoModalClose}
            coordinates={coordinates}
            modalKey={activeInfoModalKey}
            /> : null
    )
}

export default withContext(SearchModal);