import React, {useContext} from 'react';
import ReactResizeDetector from 'react-resize-detector';
import {Context} from './context/context';
import {setOrientation, setFollowNow, scrollToTime, setTimeLevelDayWidth, zoomToTimeLevel, setActiveTimeLevel, changeTime, startTimer, stopTimer, setTimeLineMouseTime} from './context/actions';
import WorldWindMap from './components/WorldWindMap/index';
import SatellitePanel from './components/SatellitesPanel';
import MapsTimeline, {LEVELS} from './components/MapsTimeline/MapsTimeline';
import TimeWidget from './components/TimeWidget/';
import className from 'classnames';

import period from './utils/period'
import moment from 'moment';

//todo - to state
const timelinePeriod = period('2010/2025');

const now = moment(new Date());
const start = now.clone().subtract(1, 'w');
const end = now.clone().add(1, 'w');


function App() {
    const {state, dispatch} = useContext(Context);

    const initialTimelinePeriod = period(`${start.format('YYYY-MM-DD')}/${end.format('YYYY-MM-DD')}`);

    const onTimeChange = (timelineState) => {
        if(timelineState.centerTime && timelineState.centerTime.toString() !== state.currentTime.toString()) {
            dispatch(changeTime(timelineState.centerTime));
            dispatch(stopTimer());
        }

        if(timelineState.activeLevel && timelineState.activeLevel !== state.activeTimeLevel) {
            dispatch(setActiveTimeLevel(timelineState.activeLevel));
        }

        if(timelineState.mouseTime !== state.timeLine.mouseTime) {
            dispatch(setTimeLineMouseTime(timelineState.mouseTime));
        }

        if(timelineState.dayWidth && timelineState.dayWidth !== state.timeLine.dayWidth) {
            dispatch(setTimeLevelDayWidth(timelineState.dayWidth));
        }
    }

    const onSetActiveTimeLevel = (level) => {
        const timeLevelDayWidth = LEVELS.find(l => l.level === level).end;
        zoomToTimeLevel(dispatch, level, timeLevelDayWidth, state.timeLine.dayWidth);
    }

    const onTimeClick = (evt) => {
        dispatch(stopTimer());
        scrollToTime(dispatch, state.currentTime, evt.time, timelinePeriod);
    }

    const onSetTime = (time) => {
        dispatch(changeTime(time.toString()));
    }

    const onStartTimer = () => {
        dispatch(setFollowNow(true));
        scrollToTime(dispatch, state.currentTime, moment(new Date()), timelinePeriod, () => {
            startTimer(dispatch);
        });
    }

    const onStopTimer = () => {
        dispatch(stopTimer());
    }

    const onResize = () => {
        let landscape = true;
        if(window.innerHeight > window.innerWidth){
            landscape = false;
        }
        
        if (state.landscape !== landscape) {
            dispatch(setOrientation(landscape));
        }
    }

    const overlays = [
        {
            key: 'Mission',
            start: now.clone(),
            end: now.clone().add(6, 'hour'),
            backdroundColor: 'rgba(77, 77, 239, 0.7)',
            label: 'Mission',
            classes: 'overlay1',
            height: 20,
            top: 0,
        },
        {
            key: 'Data',
            start: now.clone().subtract(6, 'week'),
            end: now.clone(),
            backdroundColor: 'rgba(255, 237, 66, 0.7)',
            label: 'Data',
            classes: 'overlay2',
            height: 20,
            top: 0,
        }
    ]
    let vertical = state.landscape;

    return (
        <div className={'app'}>
            <ReactResizeDetector
                onResize = {onResize}
                handleWidth
                handleHeight />
            <SatellitePanel />
            <div className={className('timelineWrapper', {
                vertical: vertical,
                horizontal: !vertical,
            })}>
                <MapsTimeline
                    activeLevel={state.activeTimeLevel}
                    vertical = {vertical}
                    period = {timelinePeriod}
                    initialPeriod = {initialTimelinePeriod}
                    // onLayerPeriodClick: this.onLayerPeriodClick,
                    onChange = {onTimeChange}
                    time={state.currentTime}
                    overlays={overlays}
                    LEVELS={LEVELS}
                    dayWidth={state.timeLine.dayWidth}
                    onTimeClick={onTimeClick}
                />
            </div>
            <div className={className('time-widget-wrapper', {
                vertical: vertical,
                horizontal: !vertical,
            })}>
                <TimeWidget
                    time={state.currentTime}
                    active={state.activeTimeLevel}
                    onSelectActive={onSetActiveTimeLevel}
                    onSetTime={onSetTime}
                    onStartTimer={onStartTimer}
                    onStopTimer={onStopTimer}
                    nowActive={state.followNow}
                    mouseTime={state.timeLine.mouseTime}
                    />
                
            </div>
            <WorldWindMap/>
        </div>
    );
}

export default App;
