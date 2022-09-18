export async function waitForInterval(condition: boolean, intervalTime: number) {
    return await new Promise(resolve => {
        const interval = setInterval(() => {
            if (condition) {
                resolve('foo');
                clearInterval(interval);
            };
        }, intervalTime);
    });
}
