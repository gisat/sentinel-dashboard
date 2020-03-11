/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import React from 'react';
import ReactModal from 'react-modal';
import Icon from '../atoms/Icon';

ReactModal.setAppElement('#root');

const innerContentStyle = css({
    width: '100%',
    height: '100%',
    position: 'relative',
});

const closeStyle = css({
    display: 'flex',
    flexFlow: 'column',
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
    // minHeight: '1.9rem',
    // backgroundColor: 'rgba(8, 11, 18, 0.9)',
    fontSize: '2rem',
    // paddingBottom: '1rem',
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
    display: 'flex',
    flexFlow: 'column',
    overflow: 'hidden',
};

const getSidedStyle = (sided) => {
    const positions = ['top', 'right', 'bottom', 'left'];
    if(sided && sided.position && positions.includes(sided.position)) {
        const width = sided.width || '66%';
        // eslint-disable-next-line default-case
        switch (sided.position) {
            case 'top':
                return {
                    top: '0px',
                    right: '0px',
                    bottom: width,
                    left: '0px',
                };
            case 'right':
                return {
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: width,
                }
            case 'bottom':
                return {
                    top: width,
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                }
            case 'left':
                return {
                    top: '0px',
                    right: width,
                    bottom: '0px',
                    left: '0px',
                }
        }
    } else {
        return {};
    }
}

// {sided?} {possition: top, right, bottom, left, width: %}
// {displayOverlay} bool

export default (props) => {
    const {modalKey, isOpen, content, onClose, header, sided, displayOverlay} = props;

    const sidedStyle = getSidedStyle(sided);

    return (
        <ReactModal 
            isOpen={isOpen}
            contentLabel="Inline Styles Modal Example"
            style={{
                content: {...contentStyle, ...sidedStyle},
                overlay: displayOverlay === true ? visibleOverlayStyle : hiddenOverlayStyle
            }}
        >
            <div css={headerStyle}>
                {header}
            </div>
            <div css={innerContentStyle}>
                {content}
            </div>
            <span onClick={() => {onClose(modalKey)}} css={closeStyle}>
                <Icon icon={'times'} css={closeIconStyle}/>
            </span>
        </ReactModal>)
}