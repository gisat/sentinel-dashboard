/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import React from 'react';
import ReactModal from 'react-modal';
import Icon from '../atoms/Icon';

ReactModal.setAppElement('#root');

const closeStyle = css({
    position: 'absolute',
    cursor: 'pointer',
    top: '16px',
    right: '16px',
    fill: 'rgb(226, 236, 249)',
    stroke: 'rgb(226, 236, 249)',
    ':hover:focus': {
        fill: 'rgb(93, 93, 253)',
        stroke: 'rgb(93, 93, 253)',        
    }
})

const closeIconStyle = css({
    width: '1.5rem',
})

const headerStyle = css({
    borderBottom: '1px solid rgb(233, 233, 233)',
    minHeight: '1.9rem',
    backgroundColor: 'rgba(8, 11, 18, 0.9)',
    fontSize: '2rem',
})

const visibleOverlayStyle = {
    backgroundColor: 'rgba(115, 117, 187, 0.14)',
    zIndex: '1000',
};

const hiddenOverlayStyle = {
    position: 'static'
};

const contentStyle = {
    color: 'rgb(226, 236, 249)',
    backgroundColor: 'rgba(8, 11, 18, 0.9)',
    border: '1px solid rgba(204, 204, 204, 0.51)',
    zIndex: 100,
};

// {position} fullscreen, sided
// {displayOverlay} bool

export default (props) => {
    const {modalKey, isOpen, content, onClose, header, position, displayOverlay} = props;

    return (
        <ReactModal 
            isOpen={isOpen}
            contentLabel="Inline Styles Modal Example"
            style={{
                content: contentStyle,
                overlay: displayOverlay === true ? visibleOverlayStyle : hiddenOverlayStyle
            }}
        >
            <div css={headerStyle}>{header}</div>
            {content}
            <span onClick={() => {onClose(modalKey)}} css={closeStyle}>
                <Icon icon={'times'} css={closeIconStyle}/>
            </span>
        </ReactModal>)
}