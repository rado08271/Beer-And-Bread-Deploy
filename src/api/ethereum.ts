import Web3 from "web3";
import {DEFAULT_PROVIDER, SUPER_ADDRESS} from "../util/constants";

const provider = new Web3(Web3.givenProvider || DEFAULT_PROVIDER)
export const fundAccount = async (req: any, res: any, next: any) => {
    const toReceiveAddress = req.params.account

    const gasPrice = await provider.eth.getGasPrice()

    try {
        const configData: any = {
            from: SUPER_ADDRESS,
            to: toReceiveAddress,
            nonce: await provider.eth.getBlockNumber() + 1,
            value: "1000000000000000000",
            gasPrice: gasPrice,
            data: "",
        }

        const gas = await provider.eth.estimateGas(configData)
        const transactionHash = await provider.eth.sendTransaction({
            from: SUPER_ADDRESS,
            to: toReceiveAddress,
            gas: gas,
            value: "1000000000000000000",
            gasPrice: gasPrice,
            data: ""
        })
        res.status(200).send(transactionHash)
    } catch (e: any) {
        console.log(e)
        res.status(500).send(JSON.stringify(e))
    }
}

export const unlockAccount = async (req: any, res: any, next: any) => {
    const toLockAccount = req.params.account
    const accountPassword = req.query["password"]

    console.log(toLockAccount)
    provider.eth.personal.unlockAccount(toLockAccount, accountPassword, 5*365*24*60*60,(error) => {
        console.log("Locking account status")
        if (error) {
            console.error(error)
            res.send(error)
        } else {
            console.log("Succes")
            res.send("success")
        }
    })

}
export const lockAccount = async (req: any, res: any, next: any) => {
    const toLockAccount = req.params.account

    console.log(toLockAccount)
    provider.eth.personal.lockAccount(toLockAccount,(error, success) => {
        console.log("Locking account status")
        if (error) {
            console.error(error)
            res.send(error)
        } else {
            console.log("Succes", success)
            res.send("success " + success)
        }
    })

}