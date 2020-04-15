import React, { useState, useEffect } from 'react';
import Presentation from './presentation';
import {getSciProductByKey} from '../../components/WorldWindMap/layers';

const ProductInformation = (props) => {
    const {product, heading} = props;
    const [productOnline, setProductOnline] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            const productMetadata = await getSciProductByKey(product.id);
            setProductOnline(productMetadata);
        }
        fetchData();
    }, [])

    return (
        product ? <Presentation product={product} online={productOnline && productOnline.Online} heading={heading}/> : null
    )
}

export default ProductInformation;