import {DeployData} from "../entities/DeployData";
import {addContractInfo} from "../dao/contractDAO";

export default async (deployData: DeployData, contractAddress: string, abiId: string, logger: (message: string, finished?: boolean | false) => void) => {
    logger(`Database / Contract / Saving / Address ${contractAddress} with ABI ref ${abiId}`)

    if (contractAddress !== "" && abiId !== "") {
        await addContractInfo(deployData, contractAddress, abiId)
        logger(`Database / Contract / Saved`, true)
    } else {
        logger(`Database / Contract / Error / Address '${contractAddress}' or abi '${abiId}' is blank`, true)
        throw new Error(`Database / Contract / Error / Address '${contractAddress}' or abi '${abiId}' is blank`)
    }
}