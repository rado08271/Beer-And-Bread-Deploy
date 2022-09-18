import db from "../config/db";
import {ObjectId} from "mongodb";
import {DeployData} from "../entities/DeployData";

const abi = db.collection("abi")

export const addAbiInfo = async (contractName: string, contractAbi: any[]): Promise<string> => {
    const searchResult = await abi.findOne({contractName: contractName});
    if (!searchResult?._id) {
        const doc = {contractName: contractName, contract: contractAbi}
        const result = await abi.insertOne(doc)
        return `${result.insertedId}`
    }
    return `${searchResult?._id}`
}

export const getAbiById = async (id: string): Promise<any> => {
    return await abi.findOne({'_id': new ObjectId(id)})
}

export const getAllAbi = async (): Promise<any> => {
    try {
        const abiData = await abi.find({}).toArray();

        let responseObject: { [key: string]: any } = {}
        abiData.forEach(doc => {
            responseObject[`${doc._id}`] = doc
        })

        return abiData
    } catch (e) {
        throw e
    }
}

