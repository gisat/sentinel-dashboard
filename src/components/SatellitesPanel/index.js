import React, {useContext} from 'react';
import {Context} from '../../context/context'
import {toggleSatelliteSelection, focusOnSatellite} from '../../context/actions'
import './style.css';
import SateliteButton from './sentinelButton';

export default () => {
    const {state, state:{focus, satellites, selected}, dispatch} = useContext(Context);
    return (
        <div className={"satellite-selector tracking-selector"}>
                    {satellites.map(satellite => {
                        return (
                            <SateliteButton {...satellite} 
                                key={satellite.id}
                                selectedData={selected.some(selected => selected === satellite.id)}
                                focused={focus && focus.value === satellite.id}
                                onFocusOnSatellite={() => {dispatch(focusOnSatellite(satellite, state))}}
                                onToggleData={() => {dispatch(toggleSatelliteSelection(satellite, state))}}
                                />
                        );
                    })}
        </div>
    )
}