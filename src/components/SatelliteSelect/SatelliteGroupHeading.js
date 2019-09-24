import React from 'react';
// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import PropTypes from 'prop-types';
import { components } from 'react-select';

import Icon from '../Icon';

const SatelliteGroupHeading = props => {
    const {
        className,
        cx,
        getStyles,
        theme,
        selectProps,
        groupData,
        restProps,
        onClick
      } = props;

    const active = groupData.active;
    const activeAPS = groupData.activeAPS;

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

    const apsIconStyle = {
        flex: '2 2 auto',
        maxWidth: '1.25rem',
        marginLeft: '0.25rem',
        color,
        fill: color,
        stroke: color,
        '&:hover': activeAPSStyle,
        ...(activeAPS && activeAPSStyle),
    }
    
    return (
              <div css={{...getStyles('groupHeading', { theme, ...restProps }),...(active && activeStyle)}} className={cx({ 'group-heading': true }, `${className || ''} ${active ? 'active' : ''}`)} onClick={() => {onClick(groupData.value)}} >
                <Icon icon={groupData.icon} style={satIconStyle}/>
                <span style={labelStyle}>
                    {props.children}
                </span>
                <Icon icon={'location'} style={posIconStyle}/>
                <Icon icon={'clock'} style={apsIconStyle}/>
            </div>
    );
};

const getSatelliteGroupHeading = (onClick) => {
    return (props) => {
        return <SatelliteGroupHeading {...props} onClick={onClick} />
    } 
}
export default SatelliteGroupHeading;
export {
    getSatelliteGroupHeading,
}