import createNewContractEth from "../actionsEthereum/createNewContract";
import compileSolidityEth from "../actionsEthereum/compileSolidity";
import deployContractEth from "../actionsEthereum/deployContract";
import saveAbiToDatabaseEth from "../actionsEthereum/saveAbiToDatabase";
import saveContractDataToDatabaseEth from "../actionsEthereum/saveContractDataToDatabase";
import {DeployData} from "../entities/DeployData";
import {createFromRequest} from "../util/contract";
import makeTokenOwner from "../actionsEthereum/makeTokenOwner";


export const createToken = async (req: any, res: any, next: any) => {
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const deployData: DeployData = createFromRequest(req.body)
    console.log(deployData)

    let step = 0;

    const logger = (message: string, finished?: boolean) => {
        res.status(206).write(
            `<pre style="color:darkslategrey;">${message}</pre>` +
            (finished ? `<pre><p style="color:slategrey;">============== ${step++} ==============</p></pre>` : ``)
        )
        res.flushHeaders()
    }

    try {
        await createNewContractEth(deployData, logger)
        const abiArray = await compileSolidityEth(deployData, logger)
        const contractAddress = await deployContractEth(deployData, logger)
        await makeTokenOwner(deployData, contractAddress, abiArray, logger)
        const savedAbiId = await saveAbiToDatabaseEth(deployData, abiArray, logger)
        await saveContractDataToDatabaseEth(deployData, contractAddress, savedAbiId, logger)

        res.status(200).end(`<pre style="color:green;">deploysuccess</pre>`)

    } catch (e: any) {
        res.status(500).end(`deployerror: <pre style="color:darkred;">${e.message}</pre>`)
    }

}
