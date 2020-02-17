import React from 'react';
import PropTypes from "prop-types";
import Modal from '../Modal';
import {withContext} from '../../context/withContext';
import SearchForm from './components/searchForm';

const ProductsModal = (props) => {
    const {visible, onClose, coordinates, modalKey} = props;

    // const content = products.map((product) => {
    //     return (<ProductInformation key={product.id} product={product} />)
    // })

    const header = (<h1 className={'modal-header'}>Sentinel search</h1>);
    const content = <div><SearchForm /></div>
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