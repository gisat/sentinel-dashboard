import React from 'react';
import PropTypes from "prop-types";
import Modal from '../Modal';
import ProductInformation from './productInformation';
import {withContext} from '../../context/withContext';

const ProductsModal = (props) => {
    const {visible, onClose, showProducts, products, modalKey} = props;

    const productInformations = products.map((product) => {
        return (<ProductInformation key={product.id} product={product} />)
    })
    const content = <div className={'ptr-modal-scroolable-content-wrapper'}>{productInformations}</div>;

    const header = (<div><h1 className={'modal-header'}>Sentinel products [{products.length}]</h1></div>);

    return (
        visible ? <Modal 
                modalKey = {modalKey}
                isOpen = {visible}
                content = {content}
                header = {header}
                onClose = {onClose}
                displayOverlay = {true}
                /> : null
    )
}

ProductsModal.propTypes = {
    visible:PropTypes.bool,
    onClose:PropTypes.func,
    showProducts:PropTypes.array,
    products:PropTypes.array,
    modalKey:PropTypes.string,
  }

  ProductsModal.defaultProps = {
    visible:false,
    onClose:() => {},
    showProducts: [],
    products: [],
    modalKey: '',
  }

export default withContext(ProductsModal);