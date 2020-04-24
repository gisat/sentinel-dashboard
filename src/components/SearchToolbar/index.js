import React from 'react';
import Presentation from './presentation';
import {withContext} from '../../context/withContext';
import select from '../../context/selectors/';

import {
    setVisibility,
} from '../../context/actions/components/searchToolbar';


const SearchToolbar = ({dispatch, state}) => {
    //info modal state
    // const activeInfoModalKey = select.rootSelectors.getActiveInfoModalKey(state);
    // const activeInfoModal = select.rootSelectors.getInfoModal(state, activeInfoModalKey);
    // const visible = !!activeInfoModalKey && activeInfoModal.type === 'SEARCH';
    // const coordinates = visible ? activeInfoModal.coordinates : null;
    const vertical = select.rootSelectors.getLandscape(state);
    
    const onClose = () => {
        dispatch(setVisibility(false));
    }

    return (
        <Presentation 
            vertical={vertical}
            onClose={onClose}
            />
    )
}

export default withContext(SearchToolbar);