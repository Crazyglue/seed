import React from 'react';
import { Table } from 'react-bootstrap';

interface IOrderProps {
    orders: {
        [price: string]: string;
    };
}

function OrderList(props: IOrderProps) {
    const { orders = {} } = props;

    const orderList = Object.entries(orders).map(([ price, amount ]) => {
        return (
            <tr key={price}>
                <td>{Number(price).toLocaleString(window.navigator.language, { style: 'currency', currency: 'USD' })}</td>
                <td>{amount}</td>
            </tr>
        );
    });

    return (
        <Table striped bordered hover variant="dark" className='OrderList__container'>
            <thead>
                <tr>
                    <th>Price (USD)</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody className="OrderList__container">
                {orderList}
            </tbody>
        </Table>
    );
}

export default OrderList;