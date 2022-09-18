export declare class DeployData {
    deployer?: string
    contract: ContractData
    token: TokenData

}

declare class ContractData {
    name: string
}

declare class TokenData {
    name: string
    symbol: string
    area: Point[]
}

declare class Point {
    lat: number
    lng: number
}
