import { CoinbaseUpdate, Change } from "../models/coinbase";

export default ({ changes }: CoinbaseUpdate) => {
    return changes.reduce((update, [ side, price, size ]: Change) => {
        return {
            ...update,
            [side]: {
                ...update[side],
                [price]: size
            }
        }

    }, { buy: {}, sell: {} })
}