import styled from '@emotion/styled';
import React from 'react';
import PropTypes from "prop-types";

import FormGroup from "../form/FormGroup";
import Form from "../form/Form";
import Button from '../atoms/Button';

import {getProductDownloadUrl} from '../../utils/product';

import "./style.css";

// const itemStyle = {
//     display: 'flex',
// };

const getDownloadIcon = (url, isOnline) => {
    if(url) {
        return (<Button ghost disabled={!isOnline} onClick={() => {window.open(url, '_blank')}} icon={'download'} className={'ptr-download-product'} small></Button>);
    } else {
        return null;
    }
}


const Heading = ({product, text, isOnline}) => {
    const downloadUrl = product ? getProductDownloadUrl(product) : null;
    const DownloadIcon = getDownloadIcon(downloadUrl, isOnline);
    return (<div className={'ptr-product-heading'}>{text}{DownloadIcon}</div>)
}

const getDataList = (data) => {
    return data.map((i, index) => {
        return <FormGroup title={i.name} value={i.content} id={`${index}_${i.name}`} readOnly={true} key={`${index}_${i.name}`}/>
    });
};

const ProductInformation = ({product, heading, online}) => {
    const {title, id, date, int, str, summary} = product;

    //dates
    const dateList = date ? getDataList(date) : null;

    //int
    const intList = int ? getDataList(int) : null;

    //str
    const strList = str ? Object.entries(str).map(([title, value], index) => <FormGroup title={title} value={value.content} id={`${index}_${title}`} key={`${index}_${title}`} readOnly={true}/>) : null;

    //summary
    const summaryItem = summary && summary.content ? <FormGroup title={'Summary'} value={summary.content} id={`summary`} readOnly={true}/> : null;

    //title
    const titleItem = title && title.content ? <FormGroup title={'Title'} value={title.content} id={`title`} readOnly={true}/> : null;

    return (
        <div className={'product-info'}>
            <h1>
                {heading ? heading : <Heading text={`${str.platformname.content} - ${str.producttype.content}`} product={product} isOnline={online}/>}
            </h1>
            <Form className={'ptr-product-info'}>
                <section>
                    <FormGroup title={'Online'} value={online} id={`online`} key={`online`} readOnly={true}/>
                </section>
                <section>
                    {titleItem}
                </section>
                <section>
                    {dateList}
                </section>
                <section>
                    {intList}
                </section>
                <section>
                    {strList}
                </section>
                <section>
                    {summaryItem}
                </section>
            </Form>
            {/* line */}
        </div>
    )
}

ProductInformation.propTypes = {
    product:PropTypes.object,
}

ProductInformation.defaultProps = {
    product: {},
}

export default ProductInformation;