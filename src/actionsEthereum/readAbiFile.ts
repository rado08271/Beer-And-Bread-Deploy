import {DeployData} from "../entities/DeployData";
import path from "path";
import {EXEC_PATH} from "../util/path";
import readAbiFile from "../cmd/contract/abi";

export default (deployData: DeployData, logger: ( message: string, finished?: boolean | false) => void): any[] => {
    logger(`File / Application Binary Interface / Read / Reading ABI ${path.join(EXEC_PATH, `/contracts/build/${deployData.contract.name}/${deployData.contract.name}.abi`)}`)
    const abiContent = readAbiFile(deployData)
    if (abiContent) {
        logger(`File / Application Binary Interface / Read / Reading ABI ${path.join(EXEC_PATH, `/contracts/build/${deployData.contract.name}/${deployData.contract.name}.abi`)}`)
    } else {
        logger(`File / Application Binary Interface / Failed / Cannot find ${path.join(EXEC_PATH, `/contracts/build/${deployData.contract.name}/${deployData.contract.name}.abi`)}`, true)
        throw new Error(`File / Application Binary Interface / Failed / Cannot find ${path.join(EXEC_PATH, `/contracts/build/${deployData.contract.name}/${deployData.contract.name}.abi`)}`)
    }

    logger(`File / Application Binary Interface / Read / Reading ABI ${path.join(EXEC_PATH, `/contracts/build/${deployData.contract.name}/${deployData.contract.name}.abi`)}`)
    return JSON.parse(abiContent)
}