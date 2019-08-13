export const convertToUTC = (date) => {
    if(typeof date === 'string') {
        date = new Date(date);
    }
    if(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    } else {
        return null;
    }
}

export const getNowUTC = () => {
    var now = new Date();
    return convertToUTC(now);
}