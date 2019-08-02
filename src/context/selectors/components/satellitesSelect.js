import { createSelector } from 'reselect'

import common from '../_common';
import {getSubstate as getSatellitesSubstate} from '../data/satellites';

const getSubstate = (state) => common.getByPath(state, ['components', 'satelliteSelect']);

const getSatelitesSelectOptions = createSelector(
    getSatellitesSubstate,
    (satellites) => {
        const getLayerOption = (layerConfig) => {
            return {
                id: layerConfig.id,
                label: layerConfig.id,
            }
        }

        const getSateliteOption = (satConfig) => {
            const satOption = {
                groupData: {
                    value: satConfig.id,
                    icon: satConfig.iconClass,
                },
                label: satConfig.name,
                options: []
            }

            if(satConfig.layers && satConfig.layers.length > 0) {
                satOption.options = satConfig.layers.map(getLayerOption);
            }

            return satOption;
        }

        const satOptions = satellites.map(getSateliteOption);

        return satOptions;
    }
)

export {
    getSatelitesSelectOptions,
    getSubstate,
}