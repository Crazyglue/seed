import React from "react";
import Websocket from "react-websocket";
import { Row, Col } from 'react-bootstrap';

import "./App.css";
import OrderList from './components/OrderList';
import parseL2Update from './libs/parseL2Update';
import { CoinbaseUpdate, CoinbaseBase, CoinbaseSnapshot, Side } from "./models/coinbase";
import sortOrders from "./libs/sortOrders";
import { Update } from "./models/seed";
import toCurrency from './libs/toCurrency';

interface ExchangeData {
    sell: Update[],
    buy: Update[],
}

interface IAppState extends ExchangeData {
    lastUpdate: Date;
    currentTime: Date;
}

class App extends React.Component<IAppState, any> {
    private refWebSocket: any;

    constructor(props: any) {
        super(props);

        this.state = {
            sell: [],
            buy: []
        }
    }

    mergeUpdates(previousUpdates: Update[], updates: Update[], side: Side): Update[] {
        const direction = side === 'sell' ? 'desc' : 'asc';
        return updates.reduce((allUpdates, [ price, amount ]) => {
            const previousIndex = previousUpdates.findIndex(([ existingPrice ]) => existingPrice === price)

            if (previousIndex !== -1) { // Replace existing tuple
                allUpdates.splice(previousIndex, 1, [ price, amount ])
            } else { // Append tuple
                allUpdates.push([ price, amount ])
            }

            return allUpdates;
        }, previousUpdates)
            .filter(([ , amount ]: Update) => amount > 0)
            .sort(sortOrders(direction))
            .slice(0, 25)
    }

    handleData(updateString: string) {
        const data: CoinbaseBase = JSON.parse(updateString)
        if (data.type === 'error') {
            alert('There was an error' + data);
        } else if (data.type === 'l2update') {
            const update = parseL2Update(data as CoinbaseUpdate);

            const sell = this.mergeUpdates(this.state.sell, update.sell, 'sell');
            const buy = this.mergeUpdates(this.state.buy, update.buy, 'buy');

            // TODO: Decrement amounts in `buy` from all the latest sales
            this.setState({
                sell,
                buy
            })

        } else if (data.type === 'snapshot') {
            const { asks, bids } = data as CoinbaseSnapshot;

            // Convert the asks/bids to an Update[]
            const convertedAsks: Update[] = asks.map(([ price, amount ]) => [ Number(price), Number(amount) ])
            const convertedBids: Update[] = bids.map(([ price, amount ]) => [ Number(price), Number(amount) ])

            this.setState({
                sell: this.mergeUpdates([], convertedAsks, 'sell'),
                buy: this.mergeUpdates([], convertedBids, 'buy')
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
        const [ firstSell ] = sell[0] || [ 0 ]
        const [ firstBuy ] = buy[0] || [ 0 ]
        const difference = firstSell - firstBuy
        const midpointPrice = firstBuy + (difference / 2);

        // TODO: Use hooks!
        document.title = 'BTC-USD ' + toCurrency(firstSell);

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
                            { toCurrency(midpointPrice) }
                            <hr />
                            <h4>Spread</h4>
                            { toCurrency(difference) }
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
