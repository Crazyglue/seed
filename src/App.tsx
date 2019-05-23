import React from "react";
import Websocket from "react-websocket";
import { Row, Col } from 'react-bootstrap';

import "./App.css";
import OrderList from './components/OrderList';
import parseL2Update from './libs/parseL2Update';
import { CoinbaseUpdate, CoinbaseBase, CoinbaseSnapshot, SnapshotChange } from "./models/coinbase";
import sortOrders, { SortDirection } from "./libs/sortOrders";

interface IAppState {
    sell: object,
    buy: object,
    lastUpdate: Date;
    currentTime: Date
}

class App extends React.Component<IAppState, any> {
    private refWebSocket: any;

    constructor(props: any) {
        super(props);

        this.state = {
            sell: {},
            buy: {},
            lastUpdate: new Date().getTime(),
            currentTime: new Date().getTime()
        }
    }

    shouldComponentUpdate() {
        const shouldUpdate = this.state.currentTime - this.state.lastUpdate >= 1000;

        if (shouldUpdate) {
            this.setState({
                lastUpdate: this.state.currentTime
            })
        }

        return shouldUpdate
    }

    filterUpdates(updates: object, direction: SortDirection) {
        return Object.entries(updates)
            .filter(([ , amount ]) => Number(amount) > 0)
            .sort(sortOrders(direction))
            .reduce((obj, [price, amount]) => {
                return {
                    ...obj,
                    [price]: amount
                }
            }, {});
    }

    handleData(updateString: string) {
        const data: CoinbaseBase = JSON.parse(updateString)
        if (data.type === 'error') {
            console.log('error', data)
        } else if (data.type === 'l2update') {
            const update = parseL2Update(data as CoinbaseUpdate);

            const sellUpdate = {
                ...this.state.sell,
                ...update.sell
            };

            const buyUpdate = {
                ...this.state.buy,
                ...update.buy
            };

            // Not crazy with having to call filterUpdates on every update that comes in
            // a queue might work better, and then every `n` milliseconds process the queue
            this.setState({
                currentTime: new Date().getTime(),
                sell: this.filterUpdates(sellUpdate, 'desc'),
                buy: this.filterUpdates(buyUpdate, 'asc')
            })

        } else if (data.type === 'snapshot') {
            // Initial state of the L2Channel, only first 50 records
            const reducer = (updates: SnapshotChange[]) => updates.slice(0, 50).reduce((total, [ price, amount ]) => {
                return {
                    ...total,
                    [price]: amount
                }
            }, {})

            const { asks, bids } = data as CoinbaseSnapshot;
            const sell = reducer(asks)
            const buy = reducer(bids)

            this.setState({
                sell,
                buy,
                currentTime: new Date().getTime()
            })
        }
    }

    onOpen() {
        // Subscribe to L2 BTC-USD channel
        console.log('Subscribing to BTC-USD')
        this.refWebSocket.sendMessage(JSON.stringify({
            type: "subscribe",
            product_ids: [ 'BTC-USD' ],
            channels: ["level2"]
        }));
    }

    onClose() {
        console.log("Closing subscription to BTC-USD");
        this.refWebSocket.sendMessage(JSON.stringify({
            type: 'unsubscribe',
            product_ids: [
                'BTC-USD'
            ],
            channels: [ 'level2' ]
        }))
    }

    render() {
        const firstSell = Object.keys(this.state.sell)[0] || 0;
        const firstBuy = Object.keys(this.state.buy)[0] || 0;
        const difference = Number(firstSell) - Number(firstBuy)

        return (
            <Row className="App">
                <Websocket
                    url="wss://ws-feed.pro.coinbase.com"
                    debug
                    onMessage={this.handleData.bind(this)}
                    onOpen={this.onOpen.bind(this)}
                    onClose={this.onClose.bind(this)}
                    ref={(Websocket: any) => {
                        this.refWebSocket = Websocket;
                    }}
                />

                <Col xs='12' className='App-content'>
                    <Row>
                        <Col sm='12'>
                            <h2>Spread</h2>
                            <hr />
                            { difference.toLocaleString(window.navigator.language, { style: 'currency', currency: 'USD' }) }
                        </Col>
                    </Row>
                    <Row>
                        <Col sm='6'>
                            <h1>Sell</h1>
                            <OrderList
                                orders={this.state.sell}
                            ></OrderList>
                        </Col>

                        <Col sm='6'>
                            <h1>Buy</h1>
                            <OrderList
                                orders={this.state.buy}
                            ></OrderList>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export default App;
