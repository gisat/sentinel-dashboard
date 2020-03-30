import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import './style.css';

class TimeWidget extends React.PureComponent{
    constructor(props) {
        super(props);
        this.state = {
            timer: null,
        }

        this.tick = this.tick.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
        this.startTimer = this.startTimer.bind(this);
    }

    tick() {
        const {onSetTime, trackTimeActive, time} = this.props;
        const selectTime = time ? moment(time).utc() : null;

        if(trackTimeActive && selectTime && this.state.timer) {
            onSetTime(selectTime.add(1, 'second').toDate().toUTCString());
        }
    }

    stopTimer() {
        const {onStopTimer,onStopFollowNow, nowActive} = this.props;
        if(nowActive) {
            onStopFollowNow();
        }
        if(this.state.timer) {
            window.clearInterval(this.state.timer);
            this.setState({timer: null});
            onStopTimer();
        }
    }
    startTimer() {
        const {onStartTimer} = this.props;
        if(this.state.timer) {
            this.stopTimer();
        }
        const timer = window.setInterval(this.tick, 1000);
        this.setState({timer});
        onStartTimer();
    }

    render() {
        const {time, mouseTime, nowActive, active, onSelectActive, onStartFollowNow, onStopFollowNow, trackTimeActive} = this.props;
        const currentTime = time ? moment(time) : null;
        const mouseTimeMom = mouseTime ? moment(mouseTime) : null;
        const timeMom = mouseTimeMom || currentTime;
        if(timeMom) {
            timeMom.utc();
        }
        const classes = classnames('time-widget', {
            'mouse-time': mouseTimeMom
        })
        return (
            <div className={classes}>
                {timeMom ?
                <>
                    <div onClick={() => (trackTimeActive || nowActive) ? this.stopTimer() : this.startTimer()} className={`now time-cell ${(trackTimeActive || nowActive) ? 'active' : '' }`}>
                        Play
                        <span className={'indicator'}>
                        </span>
                    </div>
                    <div onClick={() => nowActive ? onStopFollowNow() : onStartFollowNow()} className={`now time-cell ${nowActive ? 'active' : '' }`}>
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

const areEqual = (prevProps, props) => {
    const {time, active, nowActive, trackTimeActive, mouseTime} = props;
    const {time: prevTime, active: prevActive, nowActive: prevNowActive, trackTimeActive: prevTrackTimeActive, mouseTime: prevMouseTime} = prevProps;
    return prevTime===time && prevActive===active && prevNowActive===nowActive && prevTrackTimeActive===trackTimeActive && prevMouseTime===mouseTime
}
export default React.memo(TimeWidget, areEqual);