import React, {useContext} from 'react';
import ReactResizeDetector from 'react-resize-detector';
import {Context} from './context/context';
import {setActiveTimeLevel, changeTime, startTimer, stopTimer} from './context/actions';
import WorldWindMap from './components/WorldWindMap/index';
import SatellitePanel from './components/SatellitesPanel';
import MapsTimeline from './components/MapsTimeline/MapsTimeline';
import TimeWidget from './components/TimeWidget/';

import period from './utils/period'

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
