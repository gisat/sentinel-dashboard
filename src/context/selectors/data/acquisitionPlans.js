import common from '../_common';
import moment from 'moment';
import { createSelector } from 'reselect'


const getSubstate = (state) => common.getByPath(state, ['data', 'acquisitionPlans']);

const getDateString = (date) => moment(date).format('YYYYMMDD');

/**
 * 
 * @param {Array.<object>} aps 
 * @param {string} dateString - Date string like "20190405"
 */
const apsForTime = (aps, dateString) => {
    const startDate = aps.start;
    const endDate = aps.end;

    const start = dateString;
    const end = dateString;

    const fullyInside = startDate > start && endDate < end;
    const partiallyBefore = startDate < start && endDate > start;
    const partiallyAfter = startDate < end && endDate > end;
    
    return fullyInside || partiallyBefore || partiallyAfter;
}

/**
 * @param {Date} date - Date string like "20190405"
 */
const getPlansForDate = createSelector([
    getSubstate,
    (state, date) => date
], (substate, date) => {
    const dateString = getDateString(date);
    
    if(substate && substate.length) {
        return substate.map(satAps => {
            return {
                ...satAps,
                plans:  satAps.plans.filter(aps => apsForTime(aps, dateString))
            }
        })
    } else {
        return [];
    }
})

const getLoadingAcquisitionsPlans = createSelector(
    [
        getSubstate
    ],
    (substate) => {
    if(substate && substate.length) {
        return substate.reduce((acc, satAps) => {
            const loadingPlans = satAps.plans.reduce((acc, plan) => {
                if(plan.loading) {
                    return [...acc, plan];
                } else {
                    return acc;
                }
            }, []);

            if(loadingPlans && loadingPlans.length > 0) {
                return [...acc, {key: satAps.key, plans: loadingPlans}]
            } else {
                return acc;
            }
        }, [])
    } else {
        return [];
    }

})

export {
    getSubstate,
    getPlansForDate,
    getLoadingAcquisitionsPlans,
}