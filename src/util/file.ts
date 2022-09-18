import * as fs from "fs";
import path from "path";

export function createDir(dirName: string, force: boolean, status: (result: boolean, message: string) => void) {
    fs.open(dirName, 'r', (oErr) => {
        if (oErr) {
            if (force) {
                fs.mkdir(dirName, {recursive: true}, (err, dirPath) => {
                    if (err || dirPath === undefined) status(false, (err ? err.message : "Dir path error"))
                    else status(true, dirName)
                })
            } else status(false, oErr.message)
        } else status(true, dirName)
    })
}

export function createFile(filePath: string, fileContent: string, status: (result: boolean) => void) {
    createDir(path.dirname(filePath), true, (result, message) => {
        if (result && message === path.dirname(filePath)) {
            fs.writeFile(filePath, fileContent, err => {
                if (err) status(false)
                else status(true)
            })
        } else status(false)
    })
}

export function readFile(filePath: string, status: (result: string | null) => void) {
    fs.readFile(filePath,{encoding: "utf-8"}, (err, data) =>  {
        if (err) {
            status(null)
        } else {
            status(data)
        }
    })
}