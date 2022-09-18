import {exec, spawn} from "child_process";

export default (successCallback: (message: string) => void, errorCallback: (message: string) => void, finish: (code: number | null) => void) => {
    const deploy = spawn("truffle", ["deploy"])

    deploy.stdout.on("data", data => {
        successCallback(`${data}`)
    });

    deploy.stderr.on("data", data => {
        errorCallback(`${data}`)
    });

    deploy.on('error', (errorResponse) => {
        errorCallback(errorResponse.message)
    });

    deploy.on("close", code => {
        finish(code)
    });

}

