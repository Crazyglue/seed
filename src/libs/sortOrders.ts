import { Update } from "../models/seed";

export type SortDirection = 'asc' | 'desc';

export default (order: SortDirection) => ([ priceA ]: Update, [ priceB ]: Update): number => {
    return (priceA - priceB) * (order === 'asc' ? -1 : 1);
}
