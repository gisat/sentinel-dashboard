import React from 'react';
import PropTypes from "prop-types";
import Modal from '../Modal';
import {withContext} from '../../context/withContext';
import SearchForm from './components/searchForm';
import Result from './components/result';
import './style.scss';

const ProductsModal = (props) => {
    const {visible, onClose, coordinates, modalKey} = props;

    // const content = products.map((product) => {
    //     return (<ProductInformation key={product.id} product={product} />)
    // })

    const header = <SearchForm />;
    const content = (<div className={'ptr-modal-scroolable-content-wrapper'}><Result /></div>);
    return (
        visible ? <Modal 
                modalKey = {modalKey}
                isOpen = {visible}
                header = {header}
                content = {content}
                onClose = {onClose}
                sided = {{position: 'left'}}
                /> : null
    )
}

ProductsModal.propTypes = {
    coordinates:PropTypes.object,
    visible:PropTypes.bool,
    onClose:PropTypes.func,
    modalKey:PropTypes.string,
  }

  ProductsModal.defaultProps = {
    visible:false,
    onClose:() => {},
    coordinates: {},
    modalKey: '',
  }

export default withContext(ProductsModal);