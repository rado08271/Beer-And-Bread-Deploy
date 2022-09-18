import compile from "../cmd/contract/compile";
import deploy from "../cmd/contract/deploy";
import {getContractById, getDeployedContracts} from "../dao/contractDAO";
import compileSolidityEthereum from '../actionsEthereum/compileSolidity'
import {createFromRequest} from "../util/contract";
import deployContractEthereum from "../actionsEthereum/deployContract";

export const compileSimple = (req: any, res: any) => {

    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    compileSolidityEthereum(createFromRequest(req.body), (message, finished) => {
        res.status(206).write(`${message}\n`)
        if (finished) {
            res.status(200).end()
        }
    })
}

export const deploySimple = (req: any, res: any) => {
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    deployContractEthereum(createFromRequest(req.body), (message, finished) => {
        res.status(206).write(`${message}\n`)
        if (finished) {
            res.status(200).end()
        }
    })
}

export const compileContract = (req: any, res: any) => {
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    compile(message => {
        res.write(`${message}\n`)
    }, error => {
        res.write(`${error}\n`)
    }, code => {
        res.end()
    })
}

export const deployContract = (req: any, res: any) =>{
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    deploy(message => {
        res.write(`${message}\n`)
    }, error => {
        res.write(`${error}\n`)
    }, code => {
        res.end()
    })
}

export const getAllDeployedContracts = async (req: any, res: any) => {
    try {
        const response = await getDeployedContracts()
        if (response) {
            res.status(200).json(response)
        } else {
            res.status(500).json(new Error('Unknown error occured, while fetching data'))
        }
    } catch (e) {
        res.status(500).json(e)
    }
}

export const getContract = async (req: any, res: any) => {
    try {
        const response = await getContractById(req.params.id)
        if (response) {
            res.status(200).json(response)
        } else {
            res.status(500).json(new Error('Unknown error occured, while fetching data'))
        }
    } catch (e) {
        res.status(500).json(e)
    }
}

