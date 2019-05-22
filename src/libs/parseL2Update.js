export default ({ changes }) => {
    return changes.reduce((update, [ side, price, size ]) => {
        return {
            ...update,
            [side]: {
                ...update[side],
                [price]: size
            }
        }

    }, { buy: {}, sell: {} })
}