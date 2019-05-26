export default (num: number = 0) => {
    return num.toLocaleString(window.navigator.language, { style: 'currency', currency: 'USD' });
}
