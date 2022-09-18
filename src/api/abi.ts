import {getAbiById, getAllAbi} from "../dao/abiDAO";

export const getContractAbi = async (req: any, res: any) => {
    try {
        const response = await getAbiById(req.params.id)
        if (response) {
            console.log(response)
            res.status(200).json(response)
        } else {
            res.status(500).json(new Error('Unknown error occured, while fetching data'))
        }
    } catch (e) {
        res.status(500).json(e)
    }
}

export const getAllAbis = async (req: any, res: any) => {
    try {
        const response = await getAllAbi()
        if (response) {
            res.status(200).json(response)
        } else {
            res.status(500).json(new Error('Unknown error occured, while fetching data'))
        }
    } catch (e) {
        res.status(500).json(e)
    }
}