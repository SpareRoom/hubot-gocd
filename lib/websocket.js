const WebSocketClient = require("websocket").client;
const Finity = require("finity");

module.exports = (config, handlers) => {
    const client = new WebSocketClient();
    const retryEvery = config.retryInterval || 5000;
    let url;
    let connectPromise;

    const connect = () => {
        console.log("Connecting to GoCD");

        client.connect(url);

        return new Promise((resolve, reject) => {
            connectPromise = { resolve, reject };
        });
    };

    /* eslint-disable indent */
    const fsm = Finity
        .configure()
            .initialState("uninitialised")
                .on("start").transitionTo("connecting")
            .state("connecting")
                .do(() => connect())
                    .onSuccess()
                        .transitionTo("connected")
                    .onFailure()
                        .transitionTo("disconnected")
            .state("connected")
                .on("close")
                    .transitionTo("disconnected")
            .state("disconnected")
                .onTimeout(retryEvery)
                    .transitionTo("connecting")
            .global()
                .onStateEnter(state => console.log(`Entering state '${state}'`))
        .start();
    /* eslint-enable indent */

    client.on("connect", (connection) => {
        connectPromise.resolve();

        connection.on("error", (error) => {
            console.error("Connection Error", { error });
        });

        connection.on("close", () => {
            console.log("Connection Closed");

            fsm.handle("close");
        });

        connection.on("message", message => handlers.message(message.utf8Data));
    });

    client.on("connectFailed", (error) => {
        console.error(`Failed to connect: ${error.message}`);

        connectPromise.reject();
    });

    return {
        start: () =>
            new Promise((resolve) => {
                console.log("Websocket module started.", {
                    host: config.host,
                    port: config.port,
                });
                url = `ws://${config.host}:${config.port}`;

                fsm.handle("start");

                resolve();
            }),
        stop: () => { },
    };
};
