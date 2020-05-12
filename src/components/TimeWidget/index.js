import React, {useEffect, useRef} from 'react';
import moment from 'moment';
import Presentation from './presentation';
import select from '../../context/selectors/';
import {withContext} from '../../context/withContext';
import {LEVELS} from '../TimeLine';
import {getNowUTCString} from '../../utils/date'
import {
    setFollowNow,
    scrollToTime,
    zoomToTimeLevel,
    changeSelectTime,
    stopTimer,
    startTimer,
    stopFollowNow,
} from '../../context/actions';

const TimeWidget = (props) => {
    const {dispatch, state} = props;
    const timelineState = select.components.timeline.getSubstate(state);
    
    const ref = useRef();
    useEffect(() => {
        ref.current = state;
    })

    const onSetActiveTimeLevel = (level) => {
        const {state} = props;
        const timelineState = select.components.timeline.getSubstate(state);
        const timeLevelDayWidth = LEVELS.find(l => l.level === level).end;
        zoomToTimeLevel(dispatch, level, timeLevelDayWidth, timelineState.dayWidth);
    }

    const onSetTime = (time) => {
        //ref.current is state
        dispatch(changeSelectTime(time, dispatch, select.rootSelectors.getSelectTime(ref.current), ref.current));
    }

    const onStartFollowNow = () => {
        const {state} = props;
        const selectTime = select.rootSelectors.getSelectTime(state);
        const periodLimit = select.rootSelectors.getPeriodLimit(state);
        const scrollTime = selectTime ? moment(selectTime) : getNowUTCString();
        dispatch(stopTimer());
        dispatch(setFollowNow(true));
        scrollToTime(state, dispatch, scrollTime, moment(getNowUTCString()), periodLimit, () => {
            dispatch(setFollowNow(true));
        });
    }

    const onStopFollowNow = () => {
        dispatch(stopFollowNow());
    }

    const onStartTimer = () => {
        dispatch(startTimer());
    }

    const onStopTimer = () => {
        dispatch(stopTimer());
    }    

    return (
        <Presentation 
            time={select.rootSelectors.getSelectTime(state)}
            active={timelineState.activeTimeLevel}
            onSelectActive={onSetActiveTimeLevel}
            onSetTime={onSetTime}
            onStartFollowNow={onStartFollowNow}
            onStopFollowNow={onStopFollowNow}
            onStartTimer={onStartTimer}
            onStopTimer={onStopTimer}
            nowActive={select.rootSelectors.getFollowNow(state)}
            trackTimeActive={select.rootSelectors.getTrackTimeActive(state)}
            // mouseTime={timelineState.mouseTime}
            mouseTime={null}
            />
    )

}

export default withContext(TimeWidget);