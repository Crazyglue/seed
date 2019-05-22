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
            lastUpdate: new Date().getTime()
        }
    }

    shouldComponentUpdate() {
        const currentTime = new Date().getTime();
        const shouldUpdate = currentTime - 1000 >= this.state.lastUpdate;
        if (shouldUpdate) {
            console.log('updating...')
        }

        this.state.lastUpdate = currentTime;
        return shouldUpdate
    }

    handleData(d) {
        const data = JSON.parse(d)
        if (data.type === 'error') {
            console.log('error', data)
        } else if (data.type === 'l2update') {
            const update = parseL2Update(data);

            this.setState({
                sell: {
                    ...this.state.sell,
                    ...update.sell
                },
                buy: {
                    ...this.state.buy,
                    ...update.buy
                }
            })

            // console.log(data);
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
                    <button onClick={this.onClose.bind(this)}>Close</button>
                    <div className='row'>
                        <OrderList
                            className='col-sm-12'
                            direction='asc'
                            orders={this.state.sell}
                        ></OrderList>

                        <div>
                            something
                        </div>

                        <OrderList
                            direction='desc'
                            orders={this.state.buy}
                        ></OrderList>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
