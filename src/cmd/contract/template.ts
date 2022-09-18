import contractTemplate from '../../templates/contracts/contractTemplate'
import {Data, render, renderFile} from "template-file";
import path from "path";
import {EXEC_PATH} from "../../util/path";
import {DeployData} from "../../entities/DeployData";
import {createFile} from "../../util/fileSync";

export default (deployData: DeployData): boolean => {
    const renderedTemplate = render(contractTemplate, JSON.parse(JSON.stringify(deployData)))
    const newFile = createFile(path.join(EXEC_PATH, `/contracts/${deployData.contract.name}.sol`), renderedTemplate)
    return newFile
}