import React from 'react';
import PropTypes from 'prop-types';
import { components } from 'react-select';
import './style.css';

import Icon from '../Icon';

const SatelliteOption = props => {
    const {groupData, ...restProps} = props;
    return (
            <components.GroupHeading {...restProps} onClick={() => {console.log(groupData.value)}}>
                <Icon icon={groupData.icon} />
                <span>
                    {props.children}
                </span>
                <Icon icon={'location'} />
            </components.GroupHeading>
    );
};

export default SatelliteOption;