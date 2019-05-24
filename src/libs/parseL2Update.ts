import { CoinbaseUpdate, SnapshotChange, Change } from "../models/coinbase";

interface ParsedL2Update {
    buy: SnapshotChange[],
    sell: SnapshotChange[]
}

export default ({ changes }: CoinbaseUpdate): ParsedL2Update => {
    return changes.reduce((update, [ side, price, size ]: Change) => {
        return {
            ...update,
            [side]: [
                ...update[side],
                [ price, size ]
            ]
        }
    }, { buy: [], sell: [] })
}