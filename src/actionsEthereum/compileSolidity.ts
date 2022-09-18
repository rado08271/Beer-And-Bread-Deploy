import {DeployData} from "../entities/DeployData";
import path from "path";
import {EXEC_PATH} from "../util/path";
import {createFile, readFile} from "../util/fileSync";
import compiler from "../config/compiler";
import {waitForInterval} from "../util/wait";
const solc = require('solc')

export default async (deployData: DeployData, logger: ( message: string, finished?: boolean | false) => void): Promise<[]> => {
    logger(("File / Solidity / Reading Contract / Path" + " " + path.join(EXEC_PATH, `/contracts/${deployData.contract.name}.sol`)))
    const solidityFile = readFile(path.join(EXEC_PATH, `/contracts/${deployData.contract.name}.sol`))

    const compilerConfig = compiler({
        [`${deployData.contract.name}.sol`]: {content: solidityFile}
    })

    logger("Compiler / Compiling file / Path" + " " +  path.join(EXEC_PATH, `/contracts/${deployData.contract.name}.sol`))

    const compiledRaw =
        solc.compile(
            JSON.stringify(compilerConfig),
            {import: (importFilePath: string) => {
                    logger("File / Solidity / Reading imports / Path" + " " +  path.join(EXEC_PATH, `/contracts/${importFilePath}`))
                    if (importFilePath !== `${deployData.contract.name}.sol`) {
                        return {
                            contents: readFile(path.join(EXEC_PATH, `/contracts/${importFilePath}`))
                        }
                    } else {
                        return {error: 'File not found'};
                    }
                }
            }
        )

    const compiled = JSON.parse(compiledRaw)

    if (compiled.errors) {
        const errors = compiled.errors.map((error: any) => error['formattedMessage'])

        logger(`Compiler / Compilation / ERROR ${JSON.stringify(errors)}`, true)
        throw new Error(`Compiler / Compilation / ERROR ${JSON.stringify(errors)}`);
    }

    logger("Compiler / Compilation / Success / Writing file to build folder" + " " + path.join(EXEC_PATH, `/build/contracts`))
    let abiContent: [] = [], binContent = ""
    for (const solidityName in compiled.contracts) {
        const contractName = solidityName.slice(0, solidityName.length - (".sol".length))
        abiContent = compiled.contracts[solidityName][contractName].abi
        binContent = compiled.contracts[solidityName][contractName].evm.bytecode.object

        const abiFileResult = createFile(path.join(EXEC_PATH, `/build/contracts/${contractName}/${contractName}.abi`), JSON.stringify(abiContent))
        if (abiFileResult) logger(`File / Compiled / File ${contractName}.abi successfully written to` + " " + path.join(EXEC_PATH, `/build/contracts/${contractName}/${contractName}.abi`))
        else logger(`File / Compiled / File ${contractName}.abi problem with saving to`+ " " + path.join(EXEC_PATH, `/build/contracts/${contractName}/${contractName}.abi`))
        await waitForInterval(true,500)

        const binFileResult = createFile(path.join(EXEC_PATH, `/build/contracts/${contractName}/${contractName}.bin`), binContent)
        if (binFileResult) logger(`File / Compiled / File ${contractName}.bin successfully written to` + " " + path.join(EXEC_PATH, `/build/contracts/${contractName}/${contractName}.bin`))
        else logger(`File / Compiled / File ${contractName}.bin problem with saving to`+ " " + path.join(EXEC_PATH, `/build/contracts/${contractName}/${contractName}.bin`))
        await waitForInterval(true,500)
    }

    logger("Compilation successful...", true)
    return abiContent
}
