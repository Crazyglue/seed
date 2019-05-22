import React from 'react';
import { Row, Col } from 'react-bootstrap';
// import { VariableSizeList as List } from 'react-window';


// import React from 'react';
// import { FixedSizeList as List } from 'react-window';
 
// const Row = (row) => {
//     console.log('row', row)
//     return (
//         <div >Row {row.index}</div>
//     );
// }
 
// const OrderList = (props) => (

//     <List
//         height={150}
//         itemData={Object.entries(props.orders)}
//         itemKey={(index, data) => {
//             console.log('data', index, data)
//             return index
//         }}
//         itemCount={1000}
//         itemSize={35}
//         width={300}
//     >
//         {Row}
//     </List>
// );

function OrderList(props) {
    const { orders = {} } = props;




    const orderList = Object.entries(orders).map(([ price, amount ]) => {
        return (
            <Row key={price}>
                <Col xs={6}>{price}</Col>
                <Col xs={6}>{amount}</Col>
            </Row>
        )
    })
    return orderList;
}

export default OrderList;