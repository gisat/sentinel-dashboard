import React from 'react';
import ReactModal from 'react-modal';

ReactModal.setAppElement('#root');

export default (props) => {
    const {modalKey, isOpen, content, onClose} = props;
    return (
        <ReactModal 
            isOpen={isOpen}
            contentLabel="Inline Styles Modal Example"
            style={{
                overlay: {
                    backgroundColor: 'papayawhip'
                },
                content: {
                    color: 'lightsteelblue'
                }
            }}
        >
            {content}
            <button onClick={() => {onClose(modalKey)}}>Close Modal</button>
        </ReactModal>)
}