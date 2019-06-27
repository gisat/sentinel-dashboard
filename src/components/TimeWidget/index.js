import React from 'react';
import moment from 'moment';
import './style.css';

const TimeWidget = (props) => {
    const time = props.time ? moment(props.time) : null;
    return (
        <div className={'time-widget'}>
            {time ?
            <>
                <span className={'month'}>
                    {time.format('MMMM')}
                </span>
                <span className={'day'}>
                    {time.format('DD')}
                </span>
                <span className={'year'}>
                    {time.format('YYYY')}
                </span>
                <span>
                    {time.format('HH')}
                </span>:
                <span>
                    {time.format('mm')}
                </span>:
                <span>
                    {time.format('ss')}
                </span>
            </> : null}
        </div>
    )
}

export default TimeWidget;