import * as fs from "fs";
import path from "path";

// Yes, could be done with just mkdir
export function createDir(dirName: string, force: boolean): {result: boolean, message: string} {
    try {
        fs.openSync(dirName, 'r')

        return {result: true, message: dirName}
    } catch (oErr: any) {
        if (force) {
            try {
                const dirPath = fs.mkdirSync(dirName, {recursive: true})

                if (dirPath === undefined) return {result: false, message: "Dir path is undefined"}
                else return {result: true, message: dirName}
            } catch (err: any) {return {result: false, message: err.message}}
        } else return {result: false, message: oErr.message}
    }
}

export function createFile(filePath: string, fileContent: string): boolean {
    const dir = createDir(path.dirname(filePath), true)
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    console.log("file", filePath, dir.result, dir.message, path.dirname(filePath), )

    if (dir.result && dir.message === path.dirname(filePath)) {
        try {
            fs.writeFileSync(filePath, fileContent)
            return true
        } catch (e: any) {
            return false
        }
    } else return false

}

export function readFile(filePath: string): string | null {
    try {
        const data = fs.readFileSync(filePath,{encoding: "utf-8"})
        return (data)
    } catch (e: any) {
        return null
    }
}