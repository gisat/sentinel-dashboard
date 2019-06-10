import React, {useContext} from 'react';
import ReactResizeDetector from 'react-resize-detector';
import {Context} from './context/context';
import types from './context/types';
import WorldWindMap from './components/WorldWindMap/index';
import SatellitePanel from './components/SatellitesPanel';
import MapsTimeline from './components/MapsTimeline/MapsTimeline';

import period from './utils/period'

function App() {
    const {state, dispatch} = useContext(Context);

    const changeTime = time => {
        return dispatch({
            type: types.CHANGE_TIME,
            payload: time
        })
    };

    const timelinePeriod = period('2000/2020');

    return (
        <React.Fragment>
            <SatellitePanel />
            <div class={'timelineWrapper'}>
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
                                    />
                            )
                        } else {
                            return(<div></div>)
                        }
                    }}
                    />
            </div>
            <WorldWindMap/>
        </React.Fragment>
    );
}

export default App;
