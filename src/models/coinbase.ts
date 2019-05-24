export type Side = 'buy' | 'sell';
export type Change = [ Side, string, string ];

export interface CoinbaseBase {
    type: string;
    product_id: string;
}

export interface CoinbaseUpdate extends CoinbaseBase {
    time: string;
    changes: Change[];
}

export type SnapshotChange = [ string, string ];

export interface CoinbaseSnapshot extends CoinbaseBase {
    asks: SnapshotChange[];
    bids: SnapshotChange[];
}