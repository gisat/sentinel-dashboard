import React from 'react';
import Presentation from './presentation';
import select from '../../context/selectors/';
import {withContext} from '../../context/withContext';
import {convertToUTC} from '../../utils/date';
import {LEVELS} from '../TimeLine';
import moment from 'moment';
import {
    setPreventReloadLayers,
    updateComponent,
    scrollToTime,
    changeSelectTime,
    stopFollowNow,
    stopTimer,
} from '../../context/actions';


import period from '../../utils/period'
import {getNowUTCString} from '../../utils/date'

const now = moment(getNowUTCString());
const start = now.clone().subtract(1, 'w');
const end = now.clone().add(1, 'w');
const initialTimelinePeriod = period(`${start.format('YYYY-MM-DD')}/${end.format('YYYY-MM-DD')}`);
const strInitialTimelinePeriod = {
	start: initialTimelinePeriod.start.toDate().toUTCString(),
	end: initialTimelinePeriod.end.toDate().toUTCString(),
}


const MapsTimeline = (props) => {
    const {dispatch, state} = props;

	const vertical = select.rootSelectors.getLandscape(state);
	const periodLimit = select.rootSelectors.getPeriodLimit(state);
	const timelineState = select.components.timeline.getSubstate(state);
    const timelineOverlays = select.components.timeline.getOverlays(state);
    const selectTime = select.rootSelectors.getSelectTime(state)
    const time = selectTime ? convertToUTC(new Date(selectTime)) : null;
	const onTimeChange = (timelineState) => {
        const {state} = props;
        const curTimelineState = select.components.timeline.getSubstate(state);
        
        if(timelineState.moving !== curTimelineState.moving) {
            dispatch(updateComponent('timeline', {moving: timelineState.moving}))
        }
        
        if(selectTime && timelineState.centerTimeUtc && timelineState.centerTimeUtc !== selectTime) {
            dispatch(stopFollowNow());
            dispatch(stopTimer());
            dispatch(changeSelectTime(timelineState.centerTimeUtc, dispatch, selectTime, state));
        }

        if(timelineState.activeLevel && timelineState.activeLevel !== curTimelineState.activeTimeLevel) {
            dispatch(updateComponent('timeline', {activeTimeLevel: timelineState.activeLevel}))
        }

        if(timelineState.mouseTime !== curTimelineState.mouseTime) {
            dispatch(updateComponent('timeline', {mouseTime: timelineState.mouseTime ? timelineState.mouseTime.getTime() - timelineState.mouseTime.getTimezoneOffset()*60*1000 : null}))
        }

        if(timelineState.dayWidth && timelineState.dayWidth !== curTimelineState.dayWidth) {
            dispatch(updateComponent('timeline', {dayWidth: timelineState.dayWidth}))
        }
	}

	const onTimeClick = (evt) => {
        const {state} = props;
        const periodLimit = select.rootSelectors.getPeriodLimit(state);
        dispatch(stopFollowNow());
        dispatch(stopTimer());

        dispatch(setPreventReloadLayers(true));
        scrollToTime(state, dispatch, new Date(select.rootSelectors.getSelectTime(state)), moment(evt.time.toDate().getTime() - evt.time.toDate().getTimezoneOffset()*60*1000), periodLimit, () => {
            dispatch(setPreventReloadLayers(false));
        });
	}

    return (
        <Presentation 
			activeLevel={timelineState.activeTimeLevel}
			vertical = {vertical}
			period = {periodLimit}
			initialPeriod = {strInitialTimelinePeriod}
			// onLayerPeriodClick: this.onLayerPeriodClick,
			onChange = {onTimeChange}
			time={time}
			overlays={timelineOverlays}
			LEVELS={LEVELS}
			dayWidth={timelineState.dayWidth}
			onTimeClick={onTimeClick}
            />
    )
}

export default withContext(MapsTimeline);