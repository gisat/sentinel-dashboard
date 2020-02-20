import styled from '@emotion/styled';
import React from 'react';
import PropTypes from "prop-types";
import "./style.css";

// const itemStyle = {
//     display: 'flex',
// };

const titleStyle = {
    display: 'flex',
    minWidth: '15rem',
    justifyContent: 'flex-start',
}

const getDataListItem = (title, value, key) => {
    return (<div className={'item'} key={key}><span style={titleStyle}>{title}:</span><span>{value}</span></div>);
};

const getDataList = (data) => {
    return data.map((i, index) => {
        return getDataListItem(i._attributes.name, i._text, `${index}_${i._attributes.name}`);
    });
};

const ProductInformation = ({product, heading}) => {
    const {title, id, date, int, str, summary} = product;

    //dates
    // const beginpositionDate = date.find((d) => d._attributes.name === "beginposition");
    // const endpositionDate = date.find((d) => d._attributes.name === "endposition");
    // const ingestiondateDate = date.find((d) => d._attributes.name === "ingestiondate");
    const dateList = date ? getDataList(date) : null;

    //int
    const intList = int ? getDataList(int) : null;

    //str
    const strList = str ? Object.entries(str).map(([title, value], index) => getDataListItem(title, value, `${index}_${title}`)) : null;

    //summary
    const summaryItem = summary && summary._text ? getDataListItem('summary', summary._text, 'summary') : null;

    //title
    const titleItem = title && title._text ? getDataListItem('title', title._text, 'title') : null;


    //styles
    // const productStyle = {
    //     margin: '2rem',
    // };
    
    // const headingStyle = {
    //     fontSize: '1.25rem',
    //     marginLeft: '2rem',
    //     marginBottom: '1rem',
    // }
    
    // const sectionStyle = css({
    //     'div': {
    //         display: 'flex'
    //     }
    // })
    // `

    return (
        <div className={'product-info'}>
            <h1>
                {heading ? heading : `${str.platformname} - ${str.producttype}`}
            </h1>
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