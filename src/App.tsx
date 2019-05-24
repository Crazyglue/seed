import React from "react";
import Websocket from "react-websocket";
import { Row, Col } from 'react-bootstrap';

import "./App.css";
import OrderList from './components/OrderList';
import parseL2Update from './libs/parseL2Update';
import { CoinbaseUpdate, CoinbaseBase, CoinbaseSnapshot, SnapshotChange } from "./models/coinbase";
import sortOrders, { SortDirection } from "./libs/sortOrders";

interface ExchangeData {
    sell: SnapshotChange[],
    buy: SnapshotChange[],
}

interface IAppState extends ExchangeData {
    lastUpdate: Date;
    currentTime: Date
}

class App extends React.Component<IAppState, any> {
    private refWebSocket: any;

    constructor(props: any) {
        super(props);

        this.state = {
            sell: [],
            buy: [],
            lastUpdate: new Date().getTime(),
            currentTime: new Date().getTime()
        }
    }

    shouldComponentUpdate() {
        const shouldUpdate = this.state.currentTime - this.state.lastUpdate >= 100;

        if (shouldUpdate) {
            this.setState({
                lastUpdate: this.state.currentTime
            })
        }

        return shouldUpdate
    }
    filterUpdates(updates: SnapshotChange[], direction: SortDirection) {
        return updates.filter(([ , amount ]) => Number(amount) > 0)
            .sort(sortOrders(direction))
            .slice(0, 25)
    }

    replaceExisting (existingUpdates: SnapshotChange[], [ amount, price ]: SnapshotChange): SnapshotChange[] {
        // Delete the existing update-amount if the next one sets it
        const previousIndex = existingUpdates.findIndex(([ existingAmount ]) => existingAmount === amount)
        if (previousIndex > -1) {
            existingUpdates.splice(previousIndex, 1)
        }

        // Insert the next update into the array
        const insertIndex = existingUpdates.findIndex(([ existingAmount ]) => Number(existingAmount) > Number(amount));
        if (insertIndex > -1) {
            existingUpdates.splice(insertIndex, 0, [amount, price]);
        }

        return existingUpdates
    }

    handleData(updateString: string) {
        const data: CoinbaseBase = JSON.parse(updateString)
        if (data.type === 'error') {
            console.log('error', data)
        } else if (data.type === 'l2update') {
            const update = parseL2Update(data as CoinbaseUpdate);

            // TODO: Decrement amounts in `buy` from all the latest sales
            this.setState({
                currentTime: new Date().getTime(),
                sell: this.filterUpdates(update.sell.reduce(this.replaceExisting, [ ...this.state.sell ]), 'desc'),
                buy: this.filterUpdates(update.buy.reduce(this.replaceExisting, [ ...this.state.buy ]), 'asc')
            })

        } else if (data.type === 'snapshot') {
            const { asks, bids } = data as CoinbaseSnapshot;

            this.setState({
                sell: this.filterUpdates(asks, 'desc'),
                buy: this.filterUpdates(bids, 'asc'),
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
        const { sell, buy }: ExchangeData = this.state as IAppState;
        const [ firstSell ] = sell[0] || [ , '0']
        const [ firstBuy ] = buy[0] || [ , '0']
        const difference = Number(firstSell) - Number(firstBuy)
        const midpointPrice = Number(firstBuy) + (difference / 2);

        // TODO: Handle this better
        document.title = 'BTC-USD ' + Number(firstSell).toLocaleString(window.navigator.language, { style: 'currency', currency: 'USD' })

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
                            <h2>Midpoint</h2>
                            { midpointPrice.toLocaleString(window.navigator.language, { style: 'currency', currency: 'USD' }) }
                            <hr />
                            <h4>Spread</h4>
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
