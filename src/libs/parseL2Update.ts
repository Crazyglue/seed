import { CoinbaseUpdate, Change } from "../models/coinbase";
import { Update } from "../models/seed";

interface ParsedL2Update {
    buy: Update[],
    sell: Update[]
}

export default ({ changes }: CoinbaseUpdate): ParsedL2Update => {
    return changes.reduce((update, [ side, price, size ]: Change) => {
        return {
            ...update,
            [side]: [
                ...update[side],
                [ Number(price), Number(size) ]
            ]
        }
    }, { buy: [], sell: [] })
}