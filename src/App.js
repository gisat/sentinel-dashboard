import React, {useContext} from 'react';
import ReactResizeDetector from 'react-resize-detector';
import {Context} from './context/context';
import {
    updateComponent,
    startTrackNowOverlay,
    setOrientation,
    setFollowNow,
    scrollToTime,
    zoomToTimeLevel,
    changeTime,
    startTimer,
    stopTimer,
} from './context/actions';
import select from './context/selectors/';
import WorldWindMap from './components/WorldWindMap/index';
import SatelliteSelect from './components/SatelliteSelect';
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
        this.onLayerClick = this.onLayerClick.bind(this);
        this.onSatelliteCollapsClick = this.onSatelliteCollapsClick.bind(this);
    }

    componentDidMount() {
        const {state, dispatch} = this.context;
        //track now overlay
        startTrackNowOverlay(state, dispatch);
    }

    onTimeChange(timelineState) {
        const {state, dispatch} = this.context;
        const curTimelineState = select.components.timeline.getSubstate(state);

        if(state.currentTime && timelineState.centerTime && timelineState.centerTime.toString() !== state.currentTime.toString()) {
            dispatch(stopTimer());
            dispatch(changeTime(timelineState.centerTime));
        }

        if(timelineState.activeLevel && timelineState.activeLevel !== state.activeTimeLevel) {
            dispatch(updateComponent('timeline', {activeTimeLevel: timelineState.activeLevel}))
        }

        if(timelineState.mouseTime !== curTimelineState.mouseTime) {
            dispatch(updateComponent('timeline', {mouseTime: timelineState.mouseTime}))
        }

        if(timelineState.dayWidth && timelineState.dayWidth !== curTimelineState.dayWidth) {
            // dispatch(setTimeLevelDayWidth(timelineState.dayWidth));
            dispatch(updateComponent('timeline', {dayWidth: timelineState.dayWidth}))
        }
    }

    onSetActiveTimeLevel(level) {
        const {state, dispatch} = this.context;
        const timelineState = select.components.timeline.getSubstate(state);
        const timeLevelDayWidth = LEVELS.find(l => l.level === level).end;
        zoomToTimeLevel(dispatch, level, timeLevelDayWidth, timelineState.dayWidth);
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
        const {dispatch} = this.context;
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

    onLayerClick(evt) {
        console.log(evt);
    }
    
    onSatelliteCollapsClick(evt) {
        const {state, dispatch} = this.context;
        const satelliteSelectState = select.components.satelliteSelect.getSubstate(state);
        if(satelliteSelectState.open) {
            dispatch(updateComponent('satelliteSelect', {open: false}))
        } else {
            dispatch(updateComponent('satelliteSelect', {open: true}))
        }
    }

    render() {
        const {state} = this.context;
        let vertical = state.landscape;
        const satelliteSelectState = select.components.satelliteSelect.getSubstate(state);
        const sateliteOptions = select.components.satelliteSelect.getSatelitesSelectOptions(state);

        const timelineState = select.components.timeline.getSubstate(state);

        return (
            <div className={'app'}>
                <ReactResizeDetector
                    onResize = {this.onResize}
                    handleWidth
                    handleHeight />
                <SatelliteSelect 
                    options={sateliteOptions}
                    open={satelliteSelectState.open}
                    onLayerClick={this.onLayerClick}
                    onCollapsClick={this.onSatelliteCollapsClick}
                    />
                <div className={className('timelineWrapper', {
                    vertical: vertical,
                    horizontal: !vertical,
                })}>
                    <MapsTimeline
                        activeLevel={timelineState.activeTimeLevel}
                        vertical = {vertical}
                        period = {timelinePeriod}
                        initialPeriod = {this.initialTimelinePeriod}
                        // onLayerPeriodClick: this.onLayerPeriodClick,
                        onChange = {this.onTimeChange}
                        time={state.currentTime}
                        overlays={timelineState.overlays}
                        LEVELS={LEVELS}
                        dayWidth={timelineState.dayWidth}
                        onTimeClick={this.onTimeClick}
                    />
                </div>
                <div className={className('time-widget-wrapper', {
                    vertical: vertical,
                    horizontal: !vertical,
                })}>
                    <TimeWidget
                        time={state.currentTime}
                        active={timelineState.activeTimeLevel}
                        onSelectActive={this.onSetActiveTimeLevel}
                        onSetTime={this.onSetTime}
                        onStartTimer={this.onStartTimer}
                        onStopTimer={this.onStopTimer}
                        nowActive={state.followNow}
                        mouseTime={timelineState.mouseTime}
                        />
                    
                </div>
                <WorldWindMap/>
            </div>
        );
    }
}

export default App;
