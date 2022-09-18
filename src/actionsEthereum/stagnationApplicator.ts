import {DEFAULT_PROVIDER, SUPER_ADDRESS} from "../util/constants";
import Web3 from "web3";
import {getAllContracts, getDeployedContracts} from "../dao/contractDAO";
import {getAbiById} from "../dao/abiDAO";

const provider = new Web3(Web3.givenProvider || DEFAULT_PROVIDER)

export default async function stagnationApplicator(): Promise<boolean> {
    const now = new Date()
    const secondsSinceEpoch = Math.round(now.getTime() / 1000)
    const allTokens = await getAllContracts()

    const receipts: any[] = []
    for (const token of allTokens) {
        // get abi data
        const abiArray: any = (await getAbiById(token.abiId)).contract
        try {
            // const estimatedGas = await contract.methods.stagnate(secondsSinceEpoch).estimateGas({from: SUPER_ADDRESS})
            const contract = new provider.eth.Contract(abiArray, token.contractAccount)
            const receipt = await contract.methods.stagnateUsers(secondsSinceEpoch).send({from: SUPER_ADDRESS})
        } catch (e: any) {
            console.log(e)
            throw e
        }
    }

    return true
}