import classnames from 'classnames';
import React from 'react';
import './style.scss';
export default ({className, id, title, value, readOnly=true}) => {
    const classes = classnames(`ptr-form-group ${className ? className : ""}`, {});
    return (
        <div className={classes}>
            <label for={id} className={'ptr-col-form-label'} >{title}</label>
            <div >
                <input type="text" readOnly={readOnly} className={"ptr-form-control-plaintext"} id={id} value={value} />
            </div>
        </div>
    )
}