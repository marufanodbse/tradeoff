import BigNumber from "bignumber.js";
export const toTokenValue = (value: any, decimals: number, mantissa?: number) => {
    if (mantissa) return removeTrailingZeros(new BigNumber(value).multipliedBy(10 ** decimals).toNumber(), mantissa);
    return new BigNumber(value).multipliedBy(10 ** decimals).toFixed();
}

export const fromTokenValue = (value: any, decimals: number, mantissa?: number) => {
    if (mantissa) return removeTrailingZeros(new BigNumber(value).dividedBy(10 ** decimals).toNumber(), mantissa);
    return new BigNumber(value).dividedBy(10 ** decimals).toFixed();
}

export function removeTrailingZeros(number: number, len: number) {
    return parseFloat(number.toFixed(len)).toString();
}

export const formatNumber = (value: string, digits: number) => {
    if (value) {
        let arr = value.split('.');
        if (arr.length > 1) {
            for (let i = 0; i < arr[1].length; i++) {
                if (Number(arr[1].charAt(i)) > 0) {
                    return value.substring(0, arr[0].length + i + digits)
                }
            }
        }
        return value
    } else {
        return "0"
    }
};

export const removeDup = (old: any) => {
    var ret = [];
    for (var i = 0; i < old.length; i++) {
        if (ret.indexOf(old[i]) == -1) {
            ret.push(old[i]);
        }
    }
    return ret;
};

export const trimNumber = (numberStr: string, decimalPlaces: number) => {
    let vals = numberStr.split(".")
    if (vals.length < 2) {
        return numberStr;
    } else {
        if (vals[1] == "") {
            return numberStr;
        }

        let index = -1;
        let decimal = vals[1];
        for (let i = decimal.length - 1; i >= 0; i--) {
            if (decimal.charAt(i) != '0') {
                index = i;
                break;
            }
        }
        decimal = decimal.substring(0, index + 1);
        let numStr = vals[0];
        if (decimal.length > decimalPlaces) {
            decimal = decimal.substring(0, decimalPlaces);
        }
        if (decimal.length > 0) {
            numStr += "." + decimal;
        }
        return numStr
    }
}

export const getTime = (num: any) => {
    var date = new Date(num * 1000);
    let Y = date.getFullYear() + '/';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    let s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
    return Y + M + D + h + m + s
}

export const getTimePeriod = (num: any) => {
    var date = new Date();
    let Y = date.getFullYear() + '.';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '.';
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    var date1 = new Date(new BigNumber(new Date().getTime()).plus(new BigNumber(num).multipliedBy(86400000).toString()).toNumber());
    let Y1 = date1.getFullYear() + '.';
    let M1 = (date1.getMonth() + 1 < 10 ? '0' + (date1.getMonth() + 1) : date1.getMonth() + 1) + '.';
    let D1 = (date1.getDate() < 10 ? '0' + date1.getDate() : date1.getDate());

    return Y + M + D + "-" + Y1 + M1 + D1
}


export function formatAccount(value: any, lenStart: number, lenEnd: number) {
    if (!value) { return ""; }
    if (!lenStart) { lenStart = 8; }
    if (!lenEnd) { lenEnd = 8; }
    return value.slice(0, lenStart) + "..." + value.slice(-lenEnd)
}