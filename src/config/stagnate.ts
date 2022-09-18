import cron from 'node-cron'
import stagnationApplicator from "../actionsEthereum/stagnationApplicator";

const stagnateCRON = () => {
    console.log("Starting stagnation scheduler")

    // Cron jobs features enables to run any scheduled tasks based on given structure
    // minute (in hour) | hour (in day) | day (in month) | month (in year) | weekday (in week)
    // This function needs to be run every day at midnight
    cron.schedule("0 0 * * *", async () => {
        try {
            const secondsSinceEpoch = Math.round(new Date().getTime() / 1000)
            console.log(`Applying cron job, current time:\t`, secondsSinceEpoch)

            if (await stagnationApplicator()) console.log(`Stagnation on ${secondsSinceEpoch} successful`)
            else throw new Error(`Not finished on ${secondsSinceEpoch}`)
        } catch (e: any) {
            console.error(e)
        }
    })
}

export default stagnateCRON