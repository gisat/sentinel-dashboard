import styled from '@emotion/styled';
import React from 'react';
import PropTypes from "prop-types";

import FormGroup from "../form/FormGroup";
import Form from "../form/Form";

import "./style.css";

// const itemStyle = {
//     display: 'flex',
// };


const getDataList = (data) => {
    return data.map((i, index) => {
        return <FormGroup title={i._attributes.name} value={i._text} id={`${index}_${i._attributes.name}`} readOnly={true}/>
    });
};

const ProductInformation = ({product, heading}) => {
    const {title, id, date, int, str, summary} = product;

    //dates
    const dateList = date ? getDataList(date) : null;

    //int
    const intList = int ? getDataList(int) : null;

    //str
    const strList = str ? Object.entries(str).map(([title, value], index) => <FormGroup title={title} value={value} id={`${index}_${title}`} readOnly={true}/>) : null;

    //summary
    const summaryItem = summary && summary._text ? <FormGroup title={'Summary'} value={summary._text} id={`summary`} readOnly={true}/> : null;

    //title
    const titleItem = title && title._text ? <FormGroup title={'Title'} value={title._text} id={`title`} readOnly={true}/> : null;

    return (
        <div className={'product-info'}>
            <h1>
                {heading ? heading : `${str.platformname} - ${str.producttype}`}
            </h1>
            <Form className={'ptr-product-info'}>
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