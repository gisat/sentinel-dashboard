import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import './style.css';

const TimeWidget = (props) => {
    const currentTime = props.time ? moment(props.time) : null;
    const mouseTime = props.mouseTime ? moment(props.mouseTime) : null;
    const time = mouseTime || currentTime;
    const classes = classnames('time-widget', {
        'mouse-time': mouseTime
    })
    return (
        <div className={classes}>
            {time ?
            <>
                <div onClick={() => props.onStartTimer()} className={`time-cell ${props.nowActive ? 'active' : '' }`}>
                    NOW
                    <span className={'indicator'}>
                    </span>
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

                <div>
                    <span>
                        {time.format('ss')}
                    </span>
                </div>
            </> : null}
        </div>
    )
}

export default TimeWidget;