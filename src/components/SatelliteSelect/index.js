import React from 'react';
import Presentation from './presentation';
import select from '../../context/selectors/';
import {withContext} from '../../context/withContext';
import {
    toggleLayer,
    toggleAcquisitionPlan,
    updateComponent,
    toggleSatelliteFocus,
} from '../../context/actions';

const SetalliteSelect = (props) => {
    const {dispatch, state, maxHeight} = props;

    const satelliteSelectState = select.components.satelliteSelect.getSubstate(state);
    const selectTime = new Date(select.rootSelectors.getSelectTime(state));
    const sateliteOptions = select.components.satelliteSelect.getSatelitesSelectOptions(state, selectTime);

    const onLayerClick = (evt) => {
        dispatch(toggleLayer(evt.satKey, evt.id))
    }

    const onAcquisitionPlanClick = (satKey) => {
        dispatch(toggleAcquisitionPlan(state, satKey));
    }

    const onSatteliteClick = (satKey) => {
        const {state} = props;
        dispatch(toggleSatelliteFocus(satKey, state))
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
            onSatteliteClick={onSatteliteClick}
            onAcquisitionPlanClick={onAcquisitionPlanClick}
            onCollapsClick={onSatelliteCollapsClick}
            maxHeight = {maxHeight}
            />
    )
}

export default withContext(SetalliteSelect);