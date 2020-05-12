import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect';
import common from '../_common';
import {getSubstate as getSatellitesSubstate} from '../data/satellites';
import {getVisibleAcquisitionsPlans, getVisibleStatistics, getLoadingStatistics} from '../map';
import {getSubstate as getLayersSubstate, getByKey as getLayerByKey} from '../data/layers';
import {getPlansForDate, getLoadingAcquisitionsPlans} from '../data/acquisitionPlans';
import {getActiveLayers, getActiveLayerByKey, getFocusedSatellite, isLayerDisabled, getSelectTimePastOrCurrent, getSelectTime} from '../rootSelectors';
import satellitesUtils from '../../../utils/satellites';

const getSubstate = (state) => common.getByPath(state, ['components', 'satelliteSelect']);

const getVisible = createSelector(getSubstate, substate => substate.visible);

const getSatelitesSelectOptions = createSelector(
    [
        getSatellitesSubstate,
        getLayersSubstate,
        getActiveLayers,
        getFocusedSatellite,
        getSelectTimePastOrCurrent,
        getVisibleAcquisitionsPlans,
        getVisibleStatistics,
        getPlansForDate,
        getLoadingAcquisitionsPlans,
        getLoadingStatistics,
        getSelectTime,
    ],
    (satellites, layersSubState, activeLayers, focusedSatellite, selectTimePastOrCurrent, visibleAcquisitionsPlans, visibleStatistics, acquisitionPlansData, loadingAcquisitionsPlans, loadingStatistics, selectTime) => {
        
        const getLayerOption = (layerKey, satConfig) => {
            const satKey = satConfig.id;
            const layer = getLayerByKey(layersSubState, layerKey);
            const activeLayerCfg = getActiveLayerByKey(activeLayers, layerKey, satKey)
            
            return {
                type: 'product',
                id: layerKey,
                label: layer.name,
                // disabled: false,
                disabled: selectTimePastOrCurrent || !satellitesUtils.isSatelliteReleaseBeforeDate(satConfig, selectTime),
                satKey: satKey,
                active: activeLayerCfg ? true : false,
                status: activeLayerCfg && activeLayerCfg.status,
                message: activeLayerCfg && activeLayerCfg.message,
                loadedCount: activeLayerCfg && activeLayerCfg.loadedCount,
                totalCount: activeLayerCfg && activeLayerCfg.totalCount,
            }
        }

        const getSateliteOption = (satConfig) => {
            // const availableAPS = selectTimePastOrCurrent && acquisitionPlansData.some((p) => p.key === satConfig.id && p.plans.length > 0);
            const hasAPS = acquisitionPlansData.find((p) => p.key === satConfig.id);
            const hasStatistics = satConfig.hasOwnProperty('statisticsKey');
            const activeAPS = visibleAcquisitionsPlans.includes(satConfig.id);
            const activeStatistics = visibleStatistics.includes(satConfig.id);
            const satOption = {
                groupData: {
                    value: satConfig.id,
                    satKey: satConfig.id,
                    icon: satConfig.iconClass,
                    disabled: !satellitesUtils.isSatelliteReleaseBeforeDate(satConfig, selectTime),
                    active: focusedSatellite === satConfig.id,
                    loading: loadingAcquisitionsPlans.some(l => l.key === satConfig.id) || loadingStatistics.some(s => s.key === satConfig.id), //todo
                },
                label: satConfig.name,
                options: []
            }

            //add acquisition plan option if satellite contains data for it
            if(hasAPS) {
                satOption.options.push({
                    type: 'acquisitionPlan',
                    id: `acg_${satConfig.id}`,
                    satKey: satConfig.id,
                    label: 'Acquisition plan',
                    disabled: false,
                    active: activeAPS,
                    loadedCount: selectTimePastOrCurrent && hasAPS.plans && hasAPS.plans.length > 0 ? hasAPS.visiblePlans || 0 : 0,
                    totalCount: 0,
                })
            }

            //add acquisition plan option if satellite contains data for it
            if(hasStatistics) {
                satOption.options.push({
                    type: 'statistics',
                    id: `statistics_${satConfig.id}`,
                    satKey: satConfig.id,
                    label: 'Statistics',
                    disabled: false,
                    active: activeStatistics,
                    loadedCount: 0,
                    totalCount: 0,
                })
            }

            if(satConfig.layers && satConfig.layers.length > 0) {
                satOption.options = [...satOption.options, ...satConfig.layers.map((layerKey) => getLayerOption(layerKey, satConfig))];
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
    getVisible,
}