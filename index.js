const WS = require("./lib/websocket");
const { handlePipelineStatus } = require("./lib/pipeline-status");

module.exports = (robot) => {
    console.log("Starting Hubot GOCD Websocket Listener");
    const host = process.env.HUBOT_GOCD_HOST;
    const port = 8887 || process.env.HUBOT_GOCD_PORT;

    const websocket = WS({ host, port });

    websocket.on("message", (message) => {
        let parsedData;
        try {
            parsedData = JSON.parse(message);
        } catch (e) {
            console.log(`Could not parse message: "${message}"`);
            return;
        }

        try {
            handlePipelineStatus(robot, parsedData);
        } catch (e) {
            console.log(`Could not handle message: "${e.message}"`);
        }
    });

    websocket.start();
};
