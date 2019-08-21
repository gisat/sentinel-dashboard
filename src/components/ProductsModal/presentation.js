import React from 'react';
import PropTypes from "prop-types";
import Modal from '../Modal';
import ProductInformation from './productInformation';
import {withContext} from '../../context/withContext';

const ProductsModal = (props) => {
    const {visible, onClose, showProducts, products, modalKey} = props;

    const content = products.map((product) => {
        return (<ProductInformation key={product.id} product={product} />)
    })

    const header = (<h1 className={'modal-header'}>Sentinel products [{products.length}]</h1>);

    return (
        visible ? <Modal 
                modalKey = {modalKey}
                isOpen = {visible}
                content = {content}
                header = {header}
                onClose = {onClose}
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