import {DeployData} from "../entities/DeployData";
import readAbiFile from "./readAbiFile";
import {addAbiInfo} from "../dao/abiDAO";

export default async (deployData: DeployData, abiContent: any[] = [], logger: (message: string, finished?: boolean | false) => void): Promise<string> => {
    logger(`Database / ABI / Saving / ${deployData.contract.name}`)

    if (abiContent.length <= 0) {
        try {
            abiContent = readAbiFile(deployData, logger)
        } catch (e) {
            // just throw anything readAbiFile thrown
            throw e
        }
    }

    if (abiContent.length > 0) {
        const abiId = await addAbiInfo(deployData.contract.name, abiContent)
        logger(`Database / ABI / ID received ${abiId}`, true)
        return abiId
    } else {
        logger(`Database / ABI / Content has weird length ${abiContent.length}`, true)
        throw new Error(`Database / ABI / Content has weird length ${abiContent.length}`)
    }
}