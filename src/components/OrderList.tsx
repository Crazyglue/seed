import React from 'react';
import { Table } from 'react-bootstrap';
import { Update } from '../models/seed';
import toCurrency from '../libs/toCurrency';

interface IOrderProps {
    orders: Update[];
}

function OrderList(props: IOrderProps) {
    const { orders = [] } = props;

    const orderList = orders.map(([ price, amount ]) => {
        return (
            <tr key={price}>
                <td>{toCurrency(price)}</td>
                <td>{amount}</td>
            </tr>
        );
    });

    return (
        <Table striped bordered hover variant="dark" className='OrderList__container'>
            <thead>
                <tr>
                    <th>Price (USD)</th>
                    <th>Amount (BTC)</th>
                </tr>
            </thead>
            <tbody className="OrderList__container">
                {orderList}
            </tbody>
        </Table>
    );
}

export default OrderList;