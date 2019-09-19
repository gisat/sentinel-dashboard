import React from 'react';
import moment from 'moment';
import Presentation from './presentation';
import select from '../../context/selectors/';
import {withContext} from '../../context/withContext';
import {LEVELS} from '../TimeLine';
import {getNowUTC} from '../../utils/date'
import {
    setFollowNow,
    scrollToTime,
    zoomToTimeLevel,
    changeSelectTime,
    stopTimer,
} from '../../context/actions';

const TimeWidget = (props) => {
    const {dispatch, state} = props;
    const timelineState = select.components.timeline.getSubstate(state);

    const onSetActiveTimeLevel = (level) => {
        const {state} = props;
        const timelineState = select.components.timeline.getSubstate(state);
        const timeLevelDayWidth = LEVELS.find(l => l.level === level).end;
        zoomToTimeLevel(dispatch, level, timeLevelDayWidth, timelineState.dayWidth);
    }

    const onSetTime = (time) => {
        dispatch(changeSelectTime(time.toString(), dispatch, select.rootSelectors.getSelectTime(state)));
    }

    const onStartTimer = () => {
        const {state} = props;
        const selectTime = select.rootSelectors.getSelectTime(state);
        const periodLimit = select.rootSelectors.getPeriodLimit(state);
        const scrollTime = selectTime ? new Date(selectTime) : getNowUTC();
        dispatch(setFollowNow(true));
        scrollToTime(dispatch, scrollTime, moment(getNowUTC()), periodLimit, () => {
            dispatch(setFollowNow(true));
        });
    }

    const onStopTimer = () => {
        dispatch(stopTimer());
    }

    return (
        <Presentation 
            time={new Date(select.rootSelectors.getSelectTime(state))}
            active={timelineState.activeTimeLevel}
            onSelectActive={onSetActiveTimeLevel}
            onSetTime={onSetTime}
            onStartTimer={onStartTimer}
            onStopTimer={onStopTimer}
            nowActive={select.rootSelectors.getFollowNow(state)}
            mouseTime={timelineState.mouseTime}
            />
    )

}

export default withContext(TimeWidget);