export type Side = 'buy' | 'sell';
export type Change = [ Side, string, string ];

export interface CoinbaseUpdate {
    type: string;
    time: string;
    product_id: string;
    changes: Change[];
}