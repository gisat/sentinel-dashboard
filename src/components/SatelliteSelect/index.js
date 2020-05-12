import React, {useRef} from 'react';
import Presentation from './presentation';
import select from '../../context/selectors/';
import {withContext} from '../../context/withContext';

import {
    toggleLayer,
    toggleAcquisitionPlan,
    toggleStatistics,
    updateComponent,
    setNavigatorFromOrbit,
    focusSatellite,
    clearComponent,
} from '../../context/actions';

import {
    updateMapView,
    updateViewHeadingCorrectionByFocusSatellite
} from '../../context/actions/map';

const SetalliteSelect = (props) => {
    const {dispatch, state, maxHeight} = props;

    const satelliteSelectState = select.components.satelliteSelect.getSubstate(state);
    const selectTime = select.rootSelectors.getSelectTime(state);
    const sateliteOptions = select.components.satelliteSelect.getSatelitesSelectOptions(state, selectTime);
    
    const mapViewRef = useRef();
    mapViewRef.current = select.map.getView(state);
    
    const selectTimeRef = useRef();
    selectTimeRef.current = selectTime;

    const onLayerClick = (evt) => {
        dispatch(toggleLayer(evt.currentTarget.dataset.satkey, evt.currentTarget.dataset.id))
    }

    const onAcquisitionPlanClick = (evt) => {
        dispatch(toggleAcquisitionPlan(state, evt.currentTarget.dataset.satkey));
    }

    const onStatisticsClick = (evt) => {
        dispatch(toggleStatistics(state, evt.currentTarget.dataset.satkey));
    }

    const onSatelliteClick = (evt) => {
        const satKey = evt.currentTarget.dataset.satkey;
        const focusedSatellite = select.rootSelectors.getFocusedSatellite(state);
        const mapView = mapViewRef.current;
        const satelliteIsFocused = focusedSatellite === satKey;
        if(satelliteIsFocused) {
            //disable focused satellite
            dispatch(focusSatellite(null))
            let heading = 0 - mapView.headingCorrection;

            dispatch(updateMapView({
                headingCorrection: 0,
                heading,
                roll: 0,
                tilt: 0,
                center: {...mapView.center ,altitude: 0}
            }));
            dispatch(clearComponent('navigatorBackup'));
        } else {
            //set focused satellite
            dispatch(focusSatellite(satKey))
            const orbitInfo = select.data.orbits.getByKey(state, `orbit-${satKey}`);
            const selectTime = selectTimeRef.current;
            dispatch(setNavigatorFromOrbit(selectTime, orbitInfo, mapView, mapView.heading, mapView.roll, mapView.tilt));

            dispatch(updateViewHeadingCorrectionByFocusSatellite());
        }
    }

    const onSatelliteCollapsClick = (evt) => {
        const {state} = props;
        const satelliteSelectState = select.components.satelliteSelect.getSubstate(state);
        if(satelliteSelectState.open) {
            dispatch(updateComponent('satelliteSelect', {open: false}))
        } else {
            dispatch(updateComponent('satelliteSelect', {open: true}))
        }
    }

    return (
        <Presentation 
            options={sateliteOptions}
            open={satelliteSelectState.open}
            onLayerClick={onLayerClick}
            onSatelliteClick={onSatelliteClick}
            onAcquisitionPlanClick={onAcquisitionPlanClick}
            onStatisticsClick={onStatisticsClick}
            onCollapsClick={onSatelliteCollapsClick}
            maxHeight = {maxHeight}
            />
    )
}

export default withContext(SetalliteSelect);