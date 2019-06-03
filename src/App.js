import React from 'react';
import {Store} from './Store';
import WorldWindMap from './components/WorldWindMap/index';

function App() {
    const {state, dispatch} = React.useContext(Store);

    const toggleSatelliteSelection = satellite => {
        const satelliteInSelected = state.selected.includes(satellite.id);
        let dispatchObj = {
            type: 'SELECT_SATELLITE',
            payload: satellite.id
        };
        if (satelliteInSelected) {
            const remainingSelected = state.selected.filter(selected => selected !== satellite.id);
            dispatchObj = {
                type: 'UNSELECT_SATELLITE',
                payload: remainingSelected
            };
        }
        return dispatch(dispatchObj);
    };

    const focusOnSatellite = satellite => {
        return dispatch({
            type: 'FOCUS',
            payload: {
                type: 'satellite',
                value: satellite.id
            }
        })
    };

    const focusOnProduct = satellite => {
        return dispatch({
            type: 'FOCUS',
            payload: {
                type: 'product',
                value: satellite.id
            }
        })
    };

    const changeTime = time => {
        return dispatch({
            type: 'CHANGE_TIME',
            payload: time
        })
    };

    return (
        <React.Fragment>
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
        </React.Fragment>
    );
}

export default App;
