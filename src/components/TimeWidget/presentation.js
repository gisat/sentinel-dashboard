import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import './style.css';

class TimeWidget extends React.PureComponent{

    componentDidMount() {
        if(this.props.nowActive) {
            // this.props.onStartTimer();
        }
    }
    render() {
        const {time, mouseTime, nowActive, onStartTimer, onStopTimer, active, onSelectActive} = this.props;
        const currentTime = time ? moment(time) : null;
        const mouseTimeMom = mouseTime ? moment(mouseTime) : null;
        const timeMom = mouseTimeMom || currentTime;
        const classes = classnames('time-widget', {
            'mouse-time': mouseTimeMom
        })
        return (
            <div className={classes}>
                {timeMom ?
                <>
                    <div onClick={() => nowActive ? onStopTimer() : onStartTimer()} className={`now time-cell ${nowActive ? 'active' : '' }`}>
                        NOW
                        <span className={'indicator'}>
                        </span>
                    </div>
                    <div className={`time-cell ${active === 'month' ? 'active' : '' }`} onClick={() => onSelectActive('month')}>
                        <span className={'month'}>
                            {timeMom.format('MMM')}
                        </span>
                        <span className={'indicator'}>
                        </span>
                    </div>

                    <div className={`time-cell ${active === 'day' ? 'active' : '' }`} onClick={() => onSelectActive('day')}>
                        <span className={'day'}>
                            {timeMom.format('DD')}
                        </span>
                        <span className={'indicator'}>
                        </span>
                    </div>

                    <div className={`time-cell ${active === 'year' ? 'active' : '' }`} onClick={() => onSelectActive('year')}>
                        <span className={'year'}>
                            {timeMom.format('YYYY')}
                        </span>
                        <span className={'indicator'}>
                        </span>
                    </div>

                    <div className={`time-cell ${active === 'hour' ? 'active' : '' }`} onClick={() => onSelectActive('hour')}>
                        <span>
                            {timeMom.format('HH')}
                        </span>
                        <span className={'indicator'}>
                        </span>
                    </div>:

                    <div className={`time-cell ${active === 'minute' ? 'active' : '' }`} onClick={() => onSelectActive('minute')}>
                        <span>
                            {timeMom.format('mm')}
                        </span>
                        <span className={'indicator'}>
                        </span>
                    </div>:

                    <div>
                        <span>
                            {timeMom.format('ss')}
                        </span>
                    </div>
                </> : null}
            </div>
        )
    }
}

export default TimeWidget;