import {DeployData} from "../entities/DeployData";
import path from "path";
import {EXEC_PATH} from "../util/path";
import createFromTemplate from '../cmd/contract/template'

export default async (deployData: DeployData, logger: ( message: string, finished?: boolean | false) => void) => {
    logger(`File / From Template / Create / Contract ${path.join(EXEC_PATH, `/contracts/${deployData.contract.name}.sol`)}`)
    const created = createFromTemplate(deployData)
    if (created) {
        logger(`File / From Template / Saved / Available at ${path.join(EXEC_PATH, `/contracts/${deployData.contract.name}.sol`)}`, true)
    } else {
        logger(`File / From Template / Error / Cannot save File ${path.join(EXEC_PATH, `/contracts/${deployData.contract.name}.sol`)}`, true)
        throw new Error(`File / From Template / Error / Cannot save File ${path.join(EXEC_PATH, `/contracts/${deployData.contract.name}.sol`)}`)
    }
}