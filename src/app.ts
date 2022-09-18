import express from 'express'
import cors from 'cors'
import {
    getAllDeployedContracts,
    getContract
} from "./api/contract";
import {getAllAbis, getContractAbi} from "./api/abi";
import {createToken} from "./api/token";
import {fundAccount, lockAccount, unlockAccount} from "./api/ethereum";
import stagnateCRON from "./config/stagnate";

// Server setup
const server = express();
server.listen(5000, () => {
    console.log("Server running on port 5000")
    stagnateCRON()
})

// Middlewares
server.use(cors())
server.use(express.json());

// ping
server.get('/', (req, res) => {res.status(200).json({status: "PONG", code: 200})})

// account actions
server.get('/account/lock/:account', lockAccount)
server.get('/account/unlock/:account', unlockAccount)
server.get('/account/fund/:account', fundAccount)

// creates new token
server.post('/create', createToken)

// get all abi
server.get("/abi", getAllAbis)
// get specific abi by id
server.get("/abi/:id", getContractAbi)

// get all contracts
server.get("/contract", getAllDeployedContracts)
// get specific contract by id
server.get("/contract/:id", getContract)


