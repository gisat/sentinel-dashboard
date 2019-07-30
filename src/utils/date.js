export const convertToUTC = (date) => {
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}

export const getNowUTC = () => {
    var now = new Date();
    return convertToUTC(now);
}