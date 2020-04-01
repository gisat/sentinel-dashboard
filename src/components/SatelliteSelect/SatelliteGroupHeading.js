import React from 'react';
// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import PropTypes from 'prop-types';
import { components } from 'react-select';
import Loader from './Loader';

import Icon from '../atoms/Icon';

const SatelliteGroupHeading = props => {
    const {
        className,
        cx,
        getStyles,
        theme,
        selectProps,
        groupData,
        restProps,
        onClick,
        onAcquisitionPlanClick,
      } = props;

    const active = groupData.active;
    const disabled = groupData.disabled;
    const activeAPS = groupData.activeAPS;
    const availableAPS = groupData.availableAPS;

    //TODO -> extract into file
    const color = 'rgb(189, 189, 189)';
    const activeColor = 'rgb(93, 93, 253)';
    const activeGreenColor = '#0f9914';
    const activeStyle = {
        color: activeColor,
        fill: activeColor,
        stroke: activeColor,
    }

    const activeAPSStyle = {
        color: activeGreenColor,
        fill: activeGreenColor,
        stroke: activeGreenColor,
    }

    const satIconStyle = {
        flex: '1 1 auto',
        maxWidth: '32px',
        color,
        fill: color,
        ...(active && activeStyle)
    }

    const labelStyle = {
        flex: '1 1 auto',
        marginLeft: '.25rem',
        fontSize: '1.25rem',
        color,
        ...(active && activeStyle)
    }

    const posIconStyle = {
        flex: '2 2 auto',
        maxWidth: '1.25rem',
        color,
        fill: color,
        stroke: color,
        ...(active && activeStyle)
    }

    const apsWrapStyle = {
        flex: '2 2 auto',
        maxWidth: '1.25rem',
        maxHeight: '2rem',
        marginLeft: '0.25rem',
    }

    const apsIconStyle = {
        maxWidth: '1.25rem',
        color,
        fill: color,
        stroke: color,
        '&:hover': activeAPSStyle,
        ...(activeAPS && activeAPSStyle),
    }
    
    return (
              <div css={{...getStyles('groupHeading', { theme, ...restProps, disabled }),...(active && activeStyle)}} className={cx({ 'group-heading': true }, `${className || ''} ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`)} onClick={() => {!disabled && onClick(groupData.value)}} >
                    <div style={{display: "flex",minWidth: '100%'}}>
                        <Icon icon={groupData.icon} style={satIconStyle}/>
                        <span style={labelStyle}>
                            {props.children}
                        </span>
                        <Icon icon={'location'} style={posIconStyle}/>
                        {availableAPS ? <div style={apsWrapStyle} onClick={(e) => {
                            console.log("on click");
                            
                            e.stopPropagation();e.preventDefault();onAcquisitionPlanClick(groupData.value)}
                            }>
                            <Icon icon={'clock'} style={apsIconStyle}/>
                        </div> : null}
                    </div>
                    {groupData.loading ? <div style={{minWidth: '100%'}}>
                        <div style={{position: 'absolute',height: '1px',minWidth: '100%', marginLeft: '-12px'}}>
                            <Loader lkey={groupData.value}/>
                        </div>
                    </div> : null}
            </div>
    );
};

const getSatelliteGroupHeading = (onClick, onAcquisitionPlanClick) => {
    return (props) => {
        return <SatelliteGroupHeading {...props} onAcquisitionPlanClick={onAcquisitionPlanClick} onClick={onClick} />
    } 
}
export default React.memo(SatelliteGroupHeading);
export {
    getSatelliteGroupHeading,
}