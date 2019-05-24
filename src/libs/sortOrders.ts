import { SnapshotChange } from "../models/coinbase";

export type SortDirection = 'asc' | 'desc';

export default (order: SortDirection) => ([ priceA ]: SnapshotChange, [ priceB ]: SnapshotChange): number => {
    const directionFactor = order === 'asc' ? -1 : 1;
    const numA = Number(priceA);
    const numB = Number(priceB);
    return (numA - numB) * directionFactor;
}

