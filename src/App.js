import React, {useContext} from 'react';
import ReactResizeDetector from 'react-resize-detector';
import {Context} from './context/context';
import {startTrackNowOverlay, setOrientation, setFollowNow, scrollToTime, setTimeLevelDayWidth, zoomToTimeLevel, setActiveTimeLevel, changeTime, startTimer, stopTimer, setTimeLineMouseTime} from './context/actions';
import WorldWindMap from './components/WorldWindMap/index';
import SatellitePanel from './components/SatellitesPanel';
import MapsTimeline, {LEVELS} from './components/MapsTimeline/MapsTimeline';
import TimeWidget from './components/TimeWidget/';
import className from 'classnames';

import period from './utils/period'
import {getNowUTC} from './utils/date'
import moment from 'moment';

//todo - to state
const timelinePeriod = period('2010/2025');

const now = moment(getNowUTC());
const start = now.clone().subtract(1, 'w');
const end = now.clone().add(1, 'w');


class App extends React.PureComponent {
    static contextType = Context

    constructor(props) {
        super(props)

        this.initialTimelinePeriod = period(`${start.format('YYYY-MM-DD')}/${end.format('YYYY-MM-DD')}`);

        this.onTimeChange = this.onTimeChange.bind(this);
        this.onSetActiveTimeLevel = this.onSetActiveTimeLevel.bind(this);
        this.onTimeClick = this.onTimeClick.bind(this);
        this.onSetTime = this.onSetTime.bind(this);
        this.onStartTimer = this.onStartTimer.bind(this);
        this.onStopTimer = this.onStopTimer.bind(this);
        this.onResize = this.onResize.bind(this);
    }

    componentDidMount() {
        const {state, dispatch} = this.context;
        //track now overlay
        startTrackNowOverlay(state, dispatch);
    }

    onTimeChange(timelineState) {
        const {state, dispatch} = this.context;
        if(state.currentTime && timelineState.centerTime && timelineState.centerTime.toString() !== state.currentTime.toString()) {
            dispatch(stopTimer());
            dispatch(changeTime(timelineState.centerTime));
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

    onSetActiveTimeLevel(level) {
        const {state, dispatch} = this.context;
        const timeLevelDayWidth = LEVELS.find(l => l.level === level).end;
        zoomToTimeLevel(dispatch, level, timeLevelDayWidth, state.timeLine.dayWidth);
    }

    onTimeClick (evt) {
        const {state, dispatch} = this.context;
        dispatch(stopTimer());
        scrollToTime(dispatch, state.currentTime, evt.time, timelinePeriod);
    }

    onSetTime (time) {
        const {state, dispatch} = this.context;
        dispatch(changeTime(time.toString()));
    }

    onStartTimer() {
        const {state, dispatch} = this.context;
        const currentTime = state.currentTime || getNowUTC();
        dispatch(setFollowNow(true));
        scrollToTime(dispatch, currentTime, moment(getNowUTC()), timelinePeriod, () => {
            startTimer(dispatch);
        });
    }

    onStopTimer() {
        const {state, dispatch} = this.context;
        dispatch(stopTimer());
    }

    onResize() {
        const {state, dispatch} = this.context;
        let landscape = true;
        if(window.innerHeight > window.innerWidth){
            landscape = false;
        }
        
        if (state.landscape !== landscape) {
            dispatch(setOrientation(landscape));
        }
    }

    render() {
        const {state, dispatch} = this.context;
        let vertical = state.landscape;
    
        return (
            <div className={'app'}>
                <ReactResizeDetector
                    onResize = {this.onResize}
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
                        initialPeriod = {this.initialTimelinePeriod}
                        // onLayerPeriodClick: this.onLayerPeriodClick,
                        onChange = {this.onTimeChange}
                        time={state.currentTime}
                        overlays={state.timeLine.overlays}
                        LEVELS={LEVELS}
                        dayWidth={state.timeLine.dayWidth}
                        onTimeClick={this.onTimeClick}
                    />
                </div>
                <div className={className('time-widget-wrapper', {
                    vertical: vertical,
                    horizontal: !vertical,
                })}>
                    <TimeWidget
                        time={state.currentTime}
                        active={state.activeTimeLevel}
                        onSelectActive={this.onSetActiveTimeLevel}
                        onSetTime={this.onSetTime}
                        onStartTimer={this.onStartTimer}
                        onStopTimer={this.onStopTimer}
                        nowActive={state.followNow}
                        mouseTime={state.timeLine.mouseTime}
                        />
                    
                </div>
                <WorldWindMap/>
            </div>
        );
    }
}

export default App;
