import path from "path";
import {EXEC_PATH} from "../../util/path";
import {readFile} from "../../util/fileSync";
import {DeployData} from "../../entities/DeployData";

export default (deployData: DeployData): string | null => {
    return readFile(path.join(EXEC_PATH, `/build/contracts/${deployData.contract.name}/${deployData.contract.name}.abi`))
}