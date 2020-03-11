import classnames from 'classnames';
import React from 'react';
import './style.scss';
export default ({className, children}) => {
    const classes = classnames(`ptr-form ${className ? className : ""}`, {});
    return (
        <form className={classes}>
            {children}
        </form>
    )
}