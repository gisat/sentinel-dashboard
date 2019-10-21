
/**
 * Compare release date from satData to given date. If date of release is before given date, then return true.
 * @param {Object} satellite Satellite data for questioned satellite
 * @param {Date} date Date that is compared
 */
const isSatelliteReleaseBeforeDate = (satellite, date) => {
    return satellite.satData.launchDate.getTime() < new Date(date).getTime();
}

/**
 * Find satellite by given orbit by orbit key, then check if is satellite released.
 * @param {Object} orbit Orbit of questioned satellite
 * @param {Array.<Object>} satellites Array of satellite data 
 * @param {Date} date Date that is compared
 */
const filterByReleasedSatellite = (orbit, satellites, date) => {
    const satKey = orbit.key.split("orbit-")[1];
    const satellite = satellites.find((s) => s.id === satKey);
    return isSatelliteReleaseBeforeDate(satellite, date);
}

export default {
    isSatelliteReleaseBeforeDate,
    filterByReleasedSatellite
}