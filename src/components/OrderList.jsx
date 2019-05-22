import React from 'react';
import { Table } from 'react-bootstrap';

const sortOrders = order => ([ priceA ], [ priceB ]) => {
    const factor = order === 'asc' ? -1 : 1
    const numA = Number(priceA);
    const numB = Number(priceB);
    if (numA < numB) return -1 * factor;
    if (numA > numB) return 1 * factor;
    return 0;
}

function OrderList(props) {
    const { orders = {}, sort = 'asc' } = props;
    const trimmedOrders = Object.entries(orders).filter(([ , amount ]) => amount > 0).sort(sortOrders(sort));

    const orderList = trimmedOrders.map(([ price, amount ]) => {
        return (
            <tr key={price}>
                <td>${price}</td>
                <td>{amount}</td>
            </tr>
        );
    });

    return (
        <Table striped bordered hover variant="dark">
            <thead>
                <tr>
                    <th>Price (USD)</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                {orderList}
            </tbody>
        </Table>
    );
}

export default OrderList;