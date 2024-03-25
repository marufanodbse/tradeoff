import BigNumber from "bignumber.js";

export function formatString(value: any, len: number) {
    if (!value) {
        return "";
    }
    if (!len) {
        len = 8;
    }
    return value.slice(0, len) + "..." + value.slice(-4)
}

export const verifyNum = (value: any) => {
    let str = value;
    let len1 = str.substr(0, 1);
    let len2 = str.substr(1, 1);
    if (str.length > 1 && len1 == 0 && len2 != ".") {
        str = str.substr(1, 1);
    }
    if (len1 == ".") {
        str = "";
    }
    if (str.indexOf(".") != -1) {
        let str_ = str.substr(str.indexOf(".") + 1);
        if (str_.indexOf(".") != -1) {
            str = str.substr(0, str.indexOf(".") + str_.indexOf(".") + 1);
        }
    }
    if (str.length > 1 && str.charAt(str.length - 1) == '-') {
        str = str.substr(0, str.length - 1);
    }
    return str.replace(/[^\-^\d^\.]+/g, '');
};

export function formatLinkString(value: any, len: number,lenEnd:number) {
    if (!value) {
        return "";
    }
    return value.slice(0, len) + "..." + value.slice(-lenEnd)
}

export function format1000(value: any) {
    return new BigNumber(value).multipliedBy(1000).toString()
}