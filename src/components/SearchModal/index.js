import React from 'react';
import Presentation from './presentation';
import {withContext} from '../../context/withContext';
import {getProductByKey} from '../../components/WorldWindMap/layers';
// import Icon from '../Icon';
import {
    updateInfoModal,
    setActiveInfoModal,
} from '../../context/actions';
import select from '../../context/selectors/';


// ReactModal.setAppElement('#root');

const ProductsModal = (props) => {
    // const {modalKey, isOpen, content, onClose, header} = props;
    const {dispatch, state} = props;
    
    //info modal state
    const activeInfoModalKey = select.rootSelectors.getActiveInfoModalKey(state);
    const activeInfoModal = select.rootSelectors.getInfoModal(state, activeInfoModalKey);
    const visible = !!activeInfoModalKey && activeInfoModal.type === 'SEARCH';
    const coordinates = visible ? activeInfoModal.coordinates : null;
    const onInfoModalClose = () => {
        dispatch(updateInfoModal(activeInfoModalKey, {open: false}));
        dispatch(setActiveInfoModal(null));
    }

    return (
        visible ? <Presentation 
            visible={visible}
            onClose={onInfoModalClose}
            // showProducts={activeInfoModal.products}
            coordinates={coordinates}
            modalKey={activeInfoModalKey}
            /> : null
    )
}

export default withContext(ProductsModal);