import React from 'react';
import Presentation from './presentation';
import select from '../../context/selectors/';
import {withContext} from '../../context/withContext';
import {
    updateActiveLayer,
    updateInfoModal,
    setActiveInfoModal,
    setWwd
} from '../../context/actions';

const WorldWindMap = (props) => {
    const {dispatch, state} = props;

    const onLayerChanged = (layerKey, change) => {
        dispatch(updateActiveLayer(layerKey, change))
    }

    const onProductsClick = (products) => {
        const {state} = props;
        const modalKey = products.join(',');
        const modalState = select.rootSelectors.getInfoModal(state, modalKey)
        const open = modalState && modalState.open ? false : true;
        const modalContent = {
            products,
            open,
        };
        dispatch(updateInfoModal(modalKey, modalContent));
        dispatch(setActiveInfoModal(modalKey));
    }

    const onWwdCreated = (wwd) => {
        dispatch(setWwd(wwd));
    };

    // prevent reloading layers while moving timeline
    const timelineState = select.components.timeline.getSubstate(state);
    const preventReloadLayers = select.rootSelectors.getPreventReloadLayers(state) || timelineState.moving;
    const selectTime = new Date(select.rootSelectors.getSelectTime(state));
    const focusedSatellite = select.rootSelectors.getFocusedSattelite(state);
    const layers = select.rootSelectors.getActiveLayers(state, selectTime);

    return (
        <Presentation 
            time={selectTime}
            layers = {layers}
            focusedSatellite = {focusedSatellite}
            onLayerChanged={onLayerChanged}
            onProductsClick={onProductsClick}
            onWwdCreated={onWwdCreated}
            preventReload={preventReloadLayers}
            />
    )
}

export default withContext(WorldWindMap);