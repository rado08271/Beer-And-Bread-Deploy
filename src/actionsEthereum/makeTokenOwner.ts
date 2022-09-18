import {DeployData} from "../entities/DeployData";
import {addContractInfo} from "../dao/contractDAO";
import Web3 from "web3";
import {DEFAULT_PROVIDER, SUPER_ADDRESS} from "../util/constants";
import abi from "../cmd/contract/abi";

const provider = new Web3(Web3.givenProvider || DEFAULT_PROVIDER)

export default async (deployData: DeployData, contractAddress: string, abiArray: any[], logger: (message: string, finished?: boolean | false) => void) => {
    logger(`Token ${deployData.token.symbol} / Making Owner / Token ${contractAddress} will change owner to ${deployData.deployer}`)

    const contract = new provider.eth.Contract(abiArray, contractAddress)

    try {
        const transactionHash = await contract.methods.setOwner(deployData.deployer).send({from: SUPER_ADDRESS})
        logger(`Token ${deployData.token.symbol} / Making Owner / New owner is ${deployData.deployer}; hash of transaction ${transactionHash}`, true)
    } catch (e: any) {
        logger(`Token ${deployData.token.symbol} / Making Owner / Could not set new owner; reason ${e.message}`, true)
        throw new Error(`Token ${deployData.token.symbol} / Making Owner / Could not set new owner; reason ${e.message}`);
    }

}