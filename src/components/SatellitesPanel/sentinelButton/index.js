import React from 'react';
import classNames from 'classnames';
import './style.css';

export default ({onToggleData, iconClass, onFocusOnSatellite, focused, selectedData, name}) => {
    return (
        <div className={classNames("satellite-buttons")}>
            <button className={classNames(`data ${iconClass}`, {iconClass, active: selectedData})} onClick={onToggleData}>
                <span className={`satellite-image`}></span>
                <span className={`title`}>{name}</span>
            </button>
            <button className={classNames("position", {active: focused})} onClick={onFocusOnSatellite}>
                <i className={"fa fa-crosshairs"}></i>
            </button>
        </div>
    )
}