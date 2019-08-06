import { createSelector } from 'reselect'
import common from '../_common';
import {getSubstate as getSatellitesSubstate} from '../data/satellites';
import {getSubstate as getLayersSubstate, getByKey as getLayerByKey} from '../data/layers';

const getSubstate = (state) => common.getByPath(state, ['components', 'satelliteSelect']);

// TODO - use re-reselect
const getSatelitesSelectOptions = createSelector(
    getSatellitesSubstate,
    getLayersSubstate,
    (satellites, layersSubState) => {
        const getLayerOption = (layerKey, satKey) => {
            const layer = getLayerByKey(layersSubState, layerKey);
            return {
                id: layer.key,
                label: layer.name,
                satKey: satKey,
                active: true
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
                satOption.options = satConfig.layers.map((layerKey) => getLayerOption(layerKey, satConfig.id));
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