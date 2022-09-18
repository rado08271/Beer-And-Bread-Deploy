import db from "../config/db";
const contracts = db.collection("contracts")
import {DeployData} from "../entities/DeployData";
import {ObjectId} from "mongodb";

export const addContractInfo = async (deployData: DeployData, contractAccount: string, abiId: string): Promise<string> => {
    const doc = {
        contractAccount: contractAccount,
        abiId: abiId,
        deployData: deployData
    }
    const result = await contracts.insertOne(doc)

    return `${result.insertedId}`
}

export const getDeployedContracts = async (): Promise<any> => {
    try {
        const contractData = await contracts.find({}).toArray();

        let responseObject: { [key: string]: any} = {}
        contractData.forEach(doc => {
            responseObject[`${doc._id}`] = doc
        })

        return contractData
    } catch (e) {
        throw e
    }
}

export const getAllContracts = async (): Promise<{ contractAccount: string, abiId: string, deployData: DeployData }[]> => {
    try {
        const contractData = await contracts.find({}).toArray();

        const data = contractData.map(value => {return { contractAccount: value.contractAccount, abiId: value.abiId, deployData: value.deployData } })

        return data
    } catch (e) {
        throw e
    }
}

export const getContractById = async (id: string): Promise<any> => {
    return await contracts.findOne({'_id': new ObjectId(id)})
}