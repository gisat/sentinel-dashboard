import React, {useContext} from 'react';
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
            <div className="header">
                <h1>Sentinel Dashboard</h1>
                <p>Select your satellite</p>
            </div>
            <div>
                {state.currentTime.toString()}
            </div>
            <div>
                <input type="date" value={state.currentTime} onChange={(e) => changeTime(e.target.value)}/>
            </div>
            <SatellitePanel />
            <WorldWindMap/>
            <MapsTimeline
                period = {timelinePeriod}
                initialPeriod = {timelinePeriod}
                // onLayerPeriodClick: this.onLayerPeriodClick,
                containerWidth = {500}
                />
        </React.Fragment>
    );
}

export default App;
