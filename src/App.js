import React, {useReducer} from 'react';
import {Context} from './context/context';
import reducer from './context/reducer';
import types from './context/types';
import WorldWindMap from './components/WorldWindMap/index';


function App() {

    const initialState = {
        satellites: [
            {id: 'S-1A', name: 'Sentinel 1A'},
            {id: 'S-1B', name: 'Sentinel-1B'},
            {id: 'S-2A', name: 'Sentinel-2A'},
            {id: 'S-2B', name: 'Sentinel-2B'},
            {id: 'S-3A', name: 'Sentinel-3A'},
            {id: 'S-3B', name: 'Sentinel-3B'},
            {id: 'S-5P', name: 'Sentinel-5P'}
        ], // All the available satellites.
        selected: [], // Selected represents satellites for which we download data
        focus: null, // Focus represents the type of focus {type: 'satellite', value: 'S-2A'} or
            // {type: 'product', value: 'S-2A'} No focus mean the default selection.
        currentTime: new Date()
    };


    const [state, dispatch] =  useReducer(reducer, initialState);

    const toggleSatelliteSelection = satellite => {
        const satelliteInSelected = state.selected.includes(satellite.id);
        let dispatchObj = {
            type: types.SELECT_SATELLITE,
            payload: satellite.id
        };
        if (satelliteInSelected) {
            const remainingSelected = state.selected.filter(selected => selected !== satellite.id);
            dispatchObj = {
                type: types.UNSELECT_SATELLITE,
                payload: remainingSelected
            };
        }
        return dispatch(dispatchObj);
    };

    const focusOnSatellite = satellite => {
        return dispatch({
            type: types.FOCUS,
            payload: {
                type: 'satellite',
                value: satellite.id
            }
        })
    };

    const focusOnProduct = satellite => {
        return dispatch({
            type: types.FOCUS,
            payload: {
                type: 'product',
                value: satellite.id
            }
        })
    };

    const changeTime = time => {
        return dispatch({
            type: types.CHANGE_TIME,
            payload: time
        })
    };

    return (
        <React.Fragment>
            <Context.Provider value={{satelites: state.satelites, selected: state.selected, focus: state.focus, currentTime: state.currentTime}}>
                {console.log(state)}
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
                <section className="episode-layout">
                    {state.satellites.map(satellite => {
                        return (
                            <section key={satellite.id} className="episode-box">
                                <div>{satellite.name}</div>
                                <section>
                                    <div>
                                        Satellite Focus {state.focus &&
                                    state.focus.type === 'satellite' &&
                                    state.focus.value === satellite.id ? 'Focused' : 'Not focused'}
                                    </div>

                                    <button type='button' onClick={() => focusOnSatellite(satellite)}>
                                        Focus
                                    </button>

                                    <button type='button' onClick={() => toggleSatelliteSelection(satellite)}>
                                        {state.selected.find(selected => selected === satellite.id) ? 'Unselect' : 'Select'}
                                    </button>
                                </section>
                            </section>
                        );
                    })}
                </section>
                <section className="episode-layout">
                    {state.satellites.map(satellite => {
                        return (
                            <section key={satellite.id} className="episode-box">
                                <div>Products Focus {satellite.name}</div>
                                <section>
                                    <div>
                                        Satellite Focus {state.focus &&
                                    state.focus.type === 'product' &&
                                    state.focus.value === satellite.id ? 'Focused' : 'Not focused'}
                                    </div>

                                    <button type='button' onClick={() => focusOnProduct(satellite)}>
                                        Focus
                                    </button>

                                </section>
                            </section>
                        );
                    })}
                </section>
                <WorldWindMap/>
            </Context.Provider>
        </React.Fragment>
    );
}

export default App;
