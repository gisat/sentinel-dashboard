import moment from 'moment';

export const getMonths = (start, end) => {
    const months = [];
    let current = moment(start);

    while (end > current || current.format('YYYY-MM') === end.format('YYYY-MM')) {
        months.push({
            month: current.format('YYYY-MM'),
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
            day: current.format('YYYY-MM-DD'),
            start: (current.format('YYYY-MM-DD') === start.format('YYYY-MM-DD')) ? start : moment(current).startOf('day'),
            end: (current.format('YYYY-MM-DD') === end.format('YYYY-MM-DD')) ? end : moment(current).endOf('day')
        });
        current.add(1,'day');
    }

    return days;
}