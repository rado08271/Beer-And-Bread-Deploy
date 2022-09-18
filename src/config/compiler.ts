
export default (sources: {[key: string]: { content: string | null } }): object => {
    return ({
        language: 'Solidity',
        sources: sources,
        settings: {
            outputSelection: {
                '*': {
                    "*": ["*"]
                },
            }
        }
    })
};