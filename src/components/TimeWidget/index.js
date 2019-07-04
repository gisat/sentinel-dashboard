import React from 'react';
import moment from 'moment';
import './style.css';

const TimeWidget = (props) => {
    const time = props.time ? moment(props.time) : null;
    return (
        <div className={'time-widget'}>
            {time ?
            <>
                <div onClick={() => props.onSetTime(new Date())}>
                    NOW
                </div>
                <div className={`time-cell ${props.active === 'month' ? 'active' : '' }`} onClick={() => props.onSelectActive('month')}>
                    <span className={'month'}>
                        {time.format('MMMM')}
                    </span>
                    <span className={'indicator'}>
                    </span>
                </div>

                <div className={`time-cell ${props.active === 'day' ? 'active' : '' }`} onClick={() => props.onSelectActive('day')}>
                    <span className={'day'}>
                        {time.format('DD')}
                    </span>
                    <span className={'indicator'}>
                    </span>
                </div>

                <div className={`time-cell ${props.active === 'year' ? 'active' : '' }`} onClick={() => props.onSelectActive('year')}>
                    <span className={'year'}>
                        {time.format('YYYY')}
                    </span>
                    <span className={'indicator'}>
                    </span>
                </div>

                <div className={`time-cell ${props.active === 'hour' ? 'active' : '' }`} onClick={() => props.onSelectActive('hour')}>
                    <span>
                        {time.format('HH')}
                    </span>
                    <span className={'indicator'}>
                    </span>
                </div>:

                <div className={`time-cell ${props.active === 'minute' ? 'active' : '' }`} onClick={() => props.onSelectActive('minute')}>
                    <span>
                        {time.format('mm')}
                    </span>
                    <span className={'indicator'}>
                    </span>
                </div>:

                <div className={`time-cell ${props.active === 'second' ? 'active' : '' }`} onClick={() => props.onSelectActive('second')}>
                    <span>
                        {time.format('ss')}
                    </span>
                    <span className={'indicator'}>
                    </span>
                </div>
            </> : null}
        </div>
    )
}

export default TimeWidget;