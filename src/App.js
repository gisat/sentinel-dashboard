import React, {useContext} from 'react';
import ReactResizeDetector from 'react-resize-detector';
import {Context} from './context/context';
import {setActiveTimeLevel, changeTime, startTimer, stopTimer} from './context/actions';
import WorldWindMap from './components/WorldWindMap/index';
import SatellitePanel from './components/SatellitesPanel';
import MapsTimeline from './components/MapsTimeline/MapsTimeline';
import TimeWidget from './components/TimeWidget/';

import period from './utils/period'
import moment from 'moment';

function App() {
    const {state, dispatch} = useContext(Context);

    const timelinePeriod = period('2010/2025');

    const onTimeChange = (timelineState) => {
        //TODO
        if(timelineState.centerTime && timelineState.centerTime.toString() !== state.currentTime.toString()) {
            dispatch(changeTime(timelineState.centerTime));
            dispatch(stopTimer());
        }
        if(timelineState.activeLevel && timelineState.activeLevel !== state.activeTimeLevel) {
            dispatch(setActiveTimeLevel(timelineState.activeLevel));
        }
    }

    const onSetActiveTimeLevel = (level) => {
        dispatch(setActiveTimeLevel(level));
    }

    const onSetTime = (time) => {
        dispatch(changeTime(time.toString()));
    }

    const onStartTimer = () => {
        if(state.followNow){
            dispatch(stopTimer());
        } else {
            startTimer(dispatch);
        }
    }

    const overlays = [
        {
            key: 'overlay1',
            start: moment(2018, 'YYYY'),
            end: moment(2020, 'YYYY'),
            backdroundColor: 'rgba(77, 77, 239, 0.7)',
            label: 'label1',
            classes: 'overlay1',
            height: 20,
            top: 0,
        },
        {
            key: 'overlay2',
            start: moment(2019, 'YYYY'),
            end: moment(2035, 'YYYY'),
            backdroundColor: 'rgba(255, 237, 66, 0.7)',
            label: 'label2',
            classes: 'overlay2',
            height: 10,
            top: 0,
        },
        {
            key: 'overlay3',
            start: moment(2005, 'YYYY'),
            end: moment(2018, 'YYYY'),
            backdroundColor: 'rgba(255, 69, 69, 0.7)',
            label: 'label3',
            classes: 'overlay3',
            height: 10,
            top: 20,
        }
    ]
	
    return (
        <div className={'app'}>
            <SatellitePanel />
            <div className={'timelineWrapper'}>
                <ReactResizeDetector
                    key="11"
                    handleWidth
                    render={({ width }) => {
                        if (width) {
                            return (
                                <MapsTimeline
                                    period = {timelinePeriod}
                                    initialPeriod = {timelinePeriod}
                                    // onLayerPeriodClick: this.onLayerPeriodClick,
                                    containerWidth = {width}
                                    activeLevel={state.activeTimeLevel}
                                    onChange = {onTimeChange}
                                    time={state.currentTime}
                                    overlays={overlays}
                                    />
                            )
                        } else {
                            return(<div></div>)
                        }
                    }}
                    />
            </div>
            <div className={'time-widget-wrapper horizontal'}>
                <TimeWidget
                    time={state.currentTime}
                    active={state.activeTimeLevel}
                    onSelectActive={onSetActiveTimeLevel}
                    onSetTime={onSetTime}
                    onStartTimer={onStartTimer}
                    nowActive={state.followNow}
                    />
                
            </div>
            <WorldWindMap/>
        </div>
    );
}

export default App;
