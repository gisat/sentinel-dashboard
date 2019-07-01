import React, {useContext} from 'react';
import ReactResizeDetector from 'react-resize-detector';
import {Context} from './context/context';
import types from './context/types';
import WorldWindMap from './components/WorldWindMap/index';
import SatellitePanel from './components/SatellitesPanel';
import MapsTimeline from './components/MapsTimeline/MapsTimeline';
import TimeWidget from './components/TimeWidget/';

import period from './utils/period'

function App() {
    const {state, dispatch} = useContext(Context);

    const changeTime = time => {
        return dispatch({
            type: types.CHANGE_TIME,
            payload: time
        })
    };

    const timelinePeriod = period('2010/2015');

    const onTimeChange = (timelineState) => {
        changeTime(timelineState.centerTime.toDate());
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
                    />
                
            </div>
            <WorldWindMap/>
        </div>
    );
}

export default App;
