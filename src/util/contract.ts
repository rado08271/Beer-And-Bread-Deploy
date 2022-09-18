import {DeployData} from "../entities/DeployData";

export function createFromRequest(requestBody: DeployData): DeployData {

    return {
        deployer: requestBody.deployer,
        contract: {name: requestBody.contract.name},
        token: {
            name: requestBody.token.name,
            symbol: requestBody.token.symbol,
            area: requestBody.token.area.map(value => {return {lat: value.lat, lng: value.lng}})
        }
    }
}