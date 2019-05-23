export type SortDirection = 'asc' | 'desc';

export default (order: SortDirection) => ([ priceA ]: string[], [ priceB ]: string[]): number => {
    const factor = order === 'asc' ? -1 : 1
    const numA = Number(priceA);
    const numB = Number(priceB);
    if (numA < numB) return -1 * factor;
    if (numA > numB) return 1 * factor;
    return 0;
}

