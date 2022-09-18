import {DeployData} from "../entities/DeployData";
import Web3 from "web3";
import path from "path";
import {EXEC_PATH} from "../util/path";
import {readFile} from "../util/fileSync";
import {DEFAULT_PROVIDER, SUPER_ADDRESS} from "../util/constants";
import {waitForInterval} from "../util/wait";

// Put it into .env
const provider = new Web3(Web3.givenProvider || DEFAULT_PROVIDER)

export default async (deployData: DeployData, logger: ( message: string, finished?: boolean | false) => void): Promise<string> => {
    logger(`Files / ${deployData.contract.name} / Wait / Waiting for files to sync`)
    logger((`File / ABI / Reading Application Binary interfaces / Path` + " " + path.join(EXEC_PATH, `/build/contracts/`)))
    const contractAbi = readFile(path.join(EXEC_PATH, `/build/contracts/${deployData.contract.name}/${deployData.contract.name}.abi`))
    const interfaceAbi = readFile(path.join(EXEC_PATH, `/build/contracts/IBAB/IBAB.abi`))
    logger((`File / BIN / Reading binary sources / Path` + " " + path.join(EXEC_PATH, `/build/contracts/`)))
    const contractBin = readFile(path.join(EXEC_PATH, `/build/contracts/${deployData.contract.name}/${deployData.contract.name}.bin`))
    const interfaceBin = readFile(path.join(EXEC_PATH, `/build/contracts/IBAB/IBAB.bin`))

    if (!contractAbi || !contractBin) {
        logger(`File / ${deployData.contract.name} / Unavailable contract data`, true)
        throw new Error(`File / ${deployData.contract.name} / Unavailable contract data`);
    }

    logger(`Contract / Preparing contract / Setting ABI ${deployData.contract.name}`)
    const contract = new provider.eth.Contract(JSON.parse(contractAbi))
    const contractData = "0x" + contractBin

    const tokenArguments = [
        deployData.token.name,
        deployData.token.symbol,
        deployData.token.area.map(value => [parseInt(`${value.lat * 1e5}`), parseInt(`${value.lng * 1e5}`)]).join(',').split(","),
    ]
    logger(`Contract / Preparing contract / Setting deploy arguments / Arguments ${JSON.stringify(tokenArguments)}`)

    const preparedContract = contract.deploy({
        arguments: tokenArguments, data: contractData
    })

    let gasPrice = "", nonce = 0, estimatedGas = 0
    try {
        gasPrice = await provider.eth.getGasPrice()
        logger(`Contract / Preparing contract / GAS ${gasPrice}`)
        nonce = (await provider.eth.getTransactionCount(SUPER_ADDRESS))
        logger(`Contract / Preparing contract / NONCE ${nonce}`)
        estimatedGas = await preparedContract.estimateGas()
        logger(`Contract / Preparing contract / EST GAS ${estimatedGas}`)
    } catch (e: any) {
        logger(`Contract / Preparing contract / Failed ${e.message}`, true)
        throw new Error(`Contract / Preparing contract / Failed ${e.message}`);
    }

    contract.options.from = SUPER_ADDRESS
    contract.options.data = contractData
    contract.options.gas = estimatedGas + 50000
    contract.options.gasPrice = gasPrice

    logger(`Contract / Preparing contract / Options:`)
    logger(`\tGAS:\t\t\t${contract.options.gas}`)
    logger(`\tFROM:\t\t\t${contract.options.from}`)
    logger(`\tPRICE:\t\t\t${contract.options.gasPrice}`)
    logger(`\tADDRESS:\t\t${contract.options.address}`)
    logger(`\tNONCE:\t\t\t${nonce}`)

    logger(`Contract / Deploying contract / In progress...`)
    let contractAddress = null
    try {
        contractAddress = await preparedContract.send({
            gas: contract.options.gas,
            from: contract.options.from,
            gasPrice: contract.options.gasPrice,
            nonce: nonce,
        })
        logger(`Contract / Deploy / Success / Contract address ${contractAddress.options.address}`)
    } catch (e: any) {
        logger(`Contract / Deploy / Failed ${e.message}`, true)
        throw new Error(`Contract / Deploy / Failed ${e.message}`);
    }

    if (contractAddress.options != null && contractAddress.options.address !== "") {
        logger("Deployment completed...", true)
        return contractAddress.options.address
    } else {
        logger(`Contract / Deploy / Failed / Incorrect data`, true)
        throw new Error(`Contract / Deploy / Failed / Incorrect data`);
    }

}