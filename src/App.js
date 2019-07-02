import React, {useContext} from 'react';
import ReactResizeDetector from 'react-resize-detector';
import {Context} from './context/context';
import {setActiveTimeLevel, changeTime} from './context/actions';
import types from './context/types';
import WorldWindMap from './components/WorldWindMap/index';
import SatellitePanel from './components/SatellitesPanel';
import MapsTimeline from './components/MapsTimeline/MapsTimeline';
import TimeWidget from './components/TimeWidget/';

import period from './utils/period'

function App() {
    const {state, dispatch} = useContext(Context);

    const timelinePeriod = period('2010/2015');

    const onTimeChange = (timelineState) => {
        dispatch(changeTime(timelineState.centerTime.toDate()));
        //TODO
        if(timelineState.activeLevel && timelineState.activeLevel !== state.activeTimeLevel) {
            dispatch(setActiveTimeLevel(timelineState.activeLevel));
        }
    }

    const onSetActiveTimeLevel = (level) => {
        dispatch(setActiveTimeLevel(level));
    }

    let dayWidth;
    switch (state.activeTimeLevel) {
        case 'year':
            dayWidth = 1
            break;
        case 'month':
                dayWidth = 20
                break;
        case 'day':
                dayWidth = 200
                break;
        case 'hour':
                dayWidth = 2500
                break;
        default:
                dayWidth = 1
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
                                    onChange = {onTimeChange}
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
                    />
                
            </div>
            <WorldWindMap/>
        </div>
    );
}

export default App;
