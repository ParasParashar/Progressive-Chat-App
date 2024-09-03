import cron from "cron";
import https from "https";
// cron jobs is used to schedule tasks run periodically at fixed intervals or specific times  so server is not close, for that we give a 1 request to server in every 14minutes

const URL = "https://progressive-chat-app.onrender.com";

const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(URL, (res) => {
      if (res.statusCode === 200) {
        console.log("GET request sent successfully using cron job");
      } else {
        console.log("GET request failed with status", res.statusCode);
      }
    })
    .on("error", (e) => {
      console.error("Error while sending request", e);
    });
});

export default job;
