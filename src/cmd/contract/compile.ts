import {exec, spawn} from "child_process";
import {readFile} from "../../util/file";
import path from "path";
import {EXEC_PATH} from "../../util/path";

export default (successCallback: (message: string) => void, errorCallback: (message: string) => void, finish: (code: number | null) => void) => {
    const compile = spawn("truffle", ["compile"])

    compile.stdout.on("data", data => {
        successCallback(`${data}`)
    });

    // compile.stderr.on("data", data => {
    //     errorCallback(`${data}`)
    // });

    compile.on('error', (errorResponse) => {
        errorCallback(errorResponse.message)
    });

    compile.on("close", code => {
        finish(code)
    });

}

