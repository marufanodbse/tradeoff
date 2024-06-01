import { readContract, waitForTransaction, writeContract } from 'wagmi/actions';
import { fetchBalance } from '@wagmi/core'
import BigNumber from 'bignumber.js';
import {AddressZero} from "@ethersproject/constants"
import { getAddress } from '@ethersproject/address'


export interface IBalance {
    decimals: number,
    formatted: string,
    symbol: string,
    value: any
}

export interface IResponse {
    data: any,
    code: number
}

export const fetchBalanceFormat = async (account: any, token: any, fix?: number) => {

    if (!fix) {
        fix = 4
    }
    let balanceFormat: string;
    try {
       let tokenObj = await fetchBalanceObj(account, token)
       
        balanceFormat =  new BigNumber(tokenObj.formatted).toFixed(fix).toString();
    } catch (error) {
        balanceFormat = "Check address"
    }
    return balanceFormat;

}

export const fetchBalanceObj = async (account: any, token: any) => {

    if (token ==AddressZero) {
        const balanceObj: IBalance = await fetchBalance({
            address: account
        })
        return balanceObj
    } else {
        const balanceObj: IBalance = await fetchBalance({
            address: account,
            token: token
        })
        return balanceObj
    }

}


export const getReadData = async (method: any, abi: any, address: any, args: any, account?: any) => {
    let response: IResponse

    try {
        if (account) {

            let data: any = await readContract({
                address: address,
                abi: abi,
                functionName: method,
                args: args,
                account
            })
            response = {
                data: data,
                code: 200
            }
        } else {
            let data: any = await readContract({
                address: address,
                abi: abi,
                functionName: method,
                args: args
            })
            response = {
                data: data,
                code: 200
            }
        }
    } catch (error) {
        response = {
            data: error,
            code: 0
        }
    }

    return response;
}

export function isAddress(value: any): string | false {
    try {
        return getAddress(value)
    } catch {
        return false
    }
}

export const sendStatus = async (config: any) => {
    try {
        const { hash } = await writeContract(config)
        const configData: any = await waitForTransaction({
            hash: hash
        })

        if (configData.status && configData.status.toString() == "success") {
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

export const MIN_UNIT256_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000";
