import React from 'react';
import Presentation from './presentation';
import select from '../../context/selectors/';
import {withContext} from '../../context/withContext';
import {
    updateActiveLayer,
    updateInfoModal,
    setActiveInfoModal,
    setWwd,
    dataUpdateAcquisitionPlan,
    dataAcquisitionPlanSetVisibleCount,
    clearComponent,
    updateComponent,
} from '../../context/actions';

import {
    setView,
} from '../../context/actions/map';

import {setGeometry} from '../../context/actions/components/searchForm/actions';
import selectors from '../../context/selectors/';

const WorldWindMap = (props) => {
    const {dispatch, state} = props;

    const onLayerChanged = (layerKey, change) => {
        if(layerKey && layerKey.layerKey && layerKey.layerKey.indexOf('acquisitionPlans_') === 0) {
            if(change.plans && change.plans.length > 0) {
                change.plans.forEach((url) => {
                    dispatch(dataUpdateAcquisitionPlan(layerKey, change.sat, url, change.update));
                });
            };

            if(change.hasOwnProperty('count')) {
                dispatch(dataAcquisitionPlanSetVisibleCount(change.sat, change.count));
            }
        } else {
            dispatch(updateActiveLayer(layerKey, change))
        }     
    }

    const onProductsClick = (products) => {
        const {state} = props;

        //if search form modal open, then terminate all clicks
        const activeModalKey = select.rootSelectors.getActiveInfoModalKey(state);
        const infoModal = select.rootSelectors.getInfoModal(state, activeModalKey);
        if(infoModal && infoModal.type === 'SEARCH') {
            return;
        }

        const modalKey = products.join(',');
        const modalState = select.rootSelectors.getInfoModal(state, modalKey)
        const open = modalState && modalState.open ? false : true;
        const modalContent = {
            type: 'PRODUCTS',
            products,
            open,
        };
        dispatch(updateInfoModal(modalKey, modalContent));
        dispatch(setActiveInfoModal(modalKey));
    }

    const searchOnCoords = (coordinates) => {
        const {state} = props;
        const modalKey = `${coordinates.longitude}-${coordinates.latitude}`;
        const modalState = select.rootSelectors.getInfoModal(state, modalKey)
        const open = modalState && modalState.open ? false : true;
        const modalContent = {
            type: 'SEARCH',
            coordinates,
            open,
        };

        //clear previous state
        dispatch(clearComponent('search'));

        const geometry = {
            latitude:coordinates.latitude,
            longitude:coordinates.longitude,
            altitude:coordinates.altitude
        }

        dispatch(setGeometry(geometry));
        
        // search catalogue
        // dispatch(searchCatalogue(modalKey, modalContent));

        dispatch(updateInfoModal(modalKey, modalContent));
        dispatch(setActiveInfoModal(modalKey));
        
        dispatch(updateComponent('timeline', {visible: false}));
        dispatch(updateComponent('timeWidget', {visible: false}));
        dispatch(updateComponent('satelliteSelect', {visible: false}));
        
    }

    const onWwdCreated = (wwd) => {
        dispatch(setWwd(wwd));
    };

    // prevent reloading layers while moving timeline
    const timelineState = select.components.timeline.getSubstate(state);
    const preventReloadLayers = select.rootSelectors.getPreventReloadLayers(state) || timelineState.moving;
    const selectTime = new Date(select.rootSelectors.getSelectTime(state));
    const currentTime = new Date(select.rootSelectors.getCurrentTime(state));
    const focusedSatellite = select.rootSelectors.getFocusedSattelite(state);
    const layers = select.rootSelectors.getActiveLayers(state, selectTime);
    const searchLayers = select.components.search.getSearchLayer(state);
    const view = select.map.getView(state);

    const onViewChange = (view) => {
        dispatch(setView(view));
    }

    return (
        <Presentation 
            time={selectTime}
            currentTime={currentTime}
            layers = {layers}
            focusedSatellite = {focusedSatellite}
            onLayerChanged={onLayerChanged}
            onProductsClick={onProductsClick}
            searchOnCoords={searchOnCoords}
            onWwdCreated={onWwdCreated}
            preventReload={preventReloadLayers}
            searchLayers={searchLayers}
            onViewChange={onViewChange}
            view={view}
            />
    )
}

export default withContext(WorldWindMap);