import common from '../_common';
import moment from 'moment';

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
const getPlansForDate = (state, date) => {
    const dateString = getDateString(date);
    const substate = getSubstate(state);
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
}

export {
    getSubstate,
    getPlansForDate,
}