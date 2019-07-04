import moment from 'moment';

export const getYears = (start, end) => {
    const years = [];
    let current = moment(start);

    while (end > current || current.format('YYYY') === end.format('YYYY')) {
        years.push({
            year: current.format('YYYY'),
            start: (current.format('YYYY') === start.format('YYYY')) ? start : moment(current).startOf('year'),
            end: (current.format('YYYY') === end.format('YYYY')) ? end : moment(current).endOf('year')
        });
        current.add(1,'year');
    }
    return years;
}
export const getMonths = (start, end) => {
    const months = [];
    let current = moment(start);

    while (end > current || current.format('YYYY-MM') === end.format('YYYY-MM')) {
        months.push({
            year: current.format('YYYY'),
            month: current.format('MM'),
            start: (current.format('YYYY-MM') === start.format('YYYY-MM')) ? start : moment(current).startOf('month'),
            end: (current.format('YYYY-MM') === end.format('YYYY-MM')) ? end : moment(current).endOf('month')
        });
        current.add(1,'month');
    }

    return months;
}

export const getDays = (start, end) => {
    const days = [];
    let current = moment(start);

    while (end > current || current.format('D') === end.format('D')) {
        days.push({
            year: current.format('YYYY'),
            month: current.format('MM'),
            day: current.format('DD'),
            start: (current.format('YYYY-MM-DD') === start.format('YYYY-MM-DD')) ? start : moment(current).startOf('day'),
            end: (current.format('YYYY-MM-DD') === end.format('YYYY-MM-DD')) ? end : moment(current).endOf('day')
        });
        current.add(1,'day');
    }

    return days;
}

export const getHours = (start, end) => {
    const hours = [];
    let current = moment(start);

    while (end > current || current.format('HH') === end.format('HH')) {
        hours.push({
            year: current.format('YYYY'),
            month: current.format('MM'),
            day: current.format('DD'),
            hour: current.format('HH'),
            start: (current.format('YYYY-MM-DD-HH') === start.format('YYYY-MM-DD-HH')) ? start : moment(current).startOf('hour'),
            end: (current.format('YYYY-MM-DD-HH') === end.format('YYYY-MM-DD-HH')) ? end : moment(current).endOf('hour')
        });
        current.add(1,'hour');
    }
    return hours;
}

export const getMinutes = (start, end) => {
    const minutes = [];
    let current = moment(start);

    while (end > current || current.format('mm') === end.format('mm')) {
        minutes.push({
            year: current.format('YYYY'),
            month: current.format('MM'),
            day: current.format('DD'),
            hour: current.format('HH'),
            minute: current.format('mm'),
            start: (current.format('YYYY-MM-DD-HH-mm') === start.format('YYYY-MM-DD-HH-mm')) ? start : moment(current).startOf('minute'),
            end: (current.format('YYYY-MM-DD-HH-mm') === end.format('YYYY-MM-DD-HH-mm')) ? end : moment(current).endOf('minute')
        });
        current.add(1,'minute');
    }
    return minutes;
}