import { createSelector } from 'reselect'
import common from '../_common';
import {getSubstate as getSatellitesSubstate} from '../data/satellites';
import {getSubstate as getLayersSubstate, getByKey as getLayerByKey} from '../data/layers';
import {getActiveLayers, getActiveLayerByKey, getFocusedSattelite, isLayerDisabled, getSelectTimePastCurrent} from '../rootSelectors';

const getSubstate = (state) => common.getByPath(state, ['components', 'satelliteSelect']);

const getSatelitesSelectOptions = createSelector(
    getSatellitesSubstate,
    getLayersSubstate,
    getActiveLayers,
    getFocusedSattelite,
    getSelectTimePastCurrent,
    getSelectTimePastCurrent,
    (satellites, layersSubState, activeLayers, focusedSattelite, selectTimePastCurrent) => {
        
        const getLayerOption = (layerKey, satKey) => {
            const layer = getLayerByKey(layersSubState, layerKey);
            const activeLayerCfg = getActiveLayerByKey(activeLayers, layerKey, satKey)
            
            return {
                id: layerKey,
                label: layer.name,
                disabled: selectTimePastCurrent,
                satKey: satKey,
                active: activeLayerCfg ? true : false,
                status: activeLayerCfg && activeLayerCfg.status,
                message: activeLayerCfg && activeLayerCfg.message,
                loadedCount: activeLayerCfg && activeLayerCfg.loadedCount,
                totalCount: activeLayerCfg && activeLayerCfg.totalCount,
            }
        }

        const getSateliteOption = (satConfig) => {
            const satOption = {
                groupData: {
                    value: satConfig.id,
                    icon: satConfig.iconClass,
                    active: focusedSattelite === satConfig.id,
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