import React from "react";
import "./App.css";
import OrderList from './components/OrderList';
import Websocket from "react-websocket";

import parseL2Update from './libs/parseL2Update';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sell: {},
            buy: {},
            lastUpdate: new Date().getTime(),
            currentTime: new Date().getTime()
        }
    }

    shouldComponentUpdate() {        
        const shouldUpdate = this.state.currentTime - this.state.lastUpdate >= 4000;

        if (shouldUpdate) {
            this.setState({
                lastUpdate: this.state.currentTime
            })
        }

        return shouldUpdate
    }

    handleData(d) {
        const data = JSON.parse(d)
        if (data.type === 'error') {
            console.log('error', data)
        } else if (data.type === 'l2update') {
            const update = parseL2Update(data);

            this.setState({
                currentTime: new Date().getTime(),
                sell: {
                    ...this.state.sell,
                    ...update.sell
                },
                buy: {
                    ...this.state.buy,
                    ...update.buy
                }
            })

        } else if (data.type === 'snapshot') {
            console.log('snapshot', data);
        }
    }

    onOpen() {
        // Subscribe to L2 BTC-USD channel
        console.log('subscribing to BTC-USD')
        this.refWebSocket.sendMessage(JSON.stringify({
            type: "subscribe",
            product_ids: [ 'BTC-USD' ],
            channels: ["level2"]
        }));
    }

    onClose() {
        this.refWebSocket.sendMessage(JSON.stringify({
            type: 'unsubscribe',
            product_ids: [
                'BTC-USD'
            ],
            channels: [ 'level2' ]
        }))
        console.log("closing...");
    }

    render() {
        return (
            <div className="App">
                    <Websocket
                        url="wss://ws-feed.pro.coinbase.com"
                        debug
                        onMessage={this.handleData.bind(this)}
                        onOpen={this.onOpen.bind(this)}
                        onClose={this.onClose.bind(this)}
                        ref={Websocket => {
                            this.refWebSocket = Websocket;
                        }}
                    />


                <div className='App-content'>
                    <div className='row'>
                        <h1>Sell</h1>
                        <OrderList
                            className='col-sm-12'
                            sort='desc'
                            orders={this.state.sell}
                        ></OrderList>

                        <hr />

                        <h1>Buy</h1>
                        <OrderList
                            sort='asc'
                            orders={this.state.buy}
                        ></OrderList>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
