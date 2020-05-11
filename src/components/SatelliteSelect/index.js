import React from 'react';
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
import {setView, updateMapView} from '../../context/actions/map';

const SetalliteSelect = (props) => {
    const {dispatch, state, maxHeight} = props;

    const satelliteSelectState = select.components.satelliteSelect.getSubstate(state);
    const selectTime = select.rootSelectors.getSelectTime(state);
    const sateliteOptions = select.components.satelliteSelect.getSatelitesSelectOptions(state, selectTime);

    const onLayerClick = (evt) => {
        dispatch(toggleLayer(evt.satKey, evt.id))
    }

    const onAcquisitionPlanClick = (satKey) => {
        const {state} = props;
        dispatch(toggleAcquisitionPlan(state, satKey));
    }

    const onStatisticsClick = (satKey) => {
        const {state} = props;
        dispatch(toggleStatistics(state, satKey));
    }

    const onSatelliteClick = (satKey) => {
        const {state} = props;
        const focusedSatellite = select.rootSelectors.getFocusedSatellite(state);
        const satelliteIsFocused = focusedSatellite === satKey;
        if(satelliteIsFocused) {
            //disable focused satellite
            dispatch(focusSatellite(null))
            //TODO - dont set prev navigator, but respect current
            const prevNavigator = select.components.navigatorBackup.getSubstate(state);
            dispatch(updateMapView({headingCorrection: 0}));
            dispatch(setView(prevNavigator));
            dispatch(clearComponent('navigatorBackup'));
        } else {
            //set focused satellite
            const navigator = select.map.getView(state);
            //save current view
            dispatch(updateComponent('navigatorBackup', {...navigator, center: {...navigator.center}}));
            dispatch(focusSatellite(satKey))
            const orbitInfo = select.data.orbits.getByKey(state, `orbit-${satKey}`);
            const selectTime = select.rootSelectors.getSelectTime(state);
            const mapView = select.map.getView(state);
            dispatch(setNavigatorFromOrbit(selectTime, orbitInfo, mapView));
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