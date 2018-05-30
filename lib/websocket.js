const WebSocketClient = require("websocket").client;
const Finity = require("finity");

module.exports = (config, handlers) => {
    const client = new WebSocketClient();
    const retryEvery = config.retryInterval || 5000;
    let url;
    let connectPromise;

    const connect = () => {
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
                .onEnter(() => console.log("Connecting to GoCD"))
                .do(() => connect())
                    .onSuccess()
                        .transitionTo("connected")
                    .onFailure()
                        .transitionTo("disconnected")
            .state("connected")
                .onEnter(() => console.log("Connected to GoCD"))
                .on("message")
                    .do((state, context) => handlers.message(context.eventPayload))
                .on("close")
                    .transitionTo("disconnected")
            .state("disconnected")
                .onEnter(() => console.log("Disconnected to GoCD"))
                .onTimeout(retryEvery)
                    .transitionTo("connecting")
        .start();
    /* eslint-enable indent */

    client.on("connect", (connection) => {
        connectPromise.resolve();

        connection.on("error", error => console.error("Connection Error", { error }));
        connection.on("message", message => fsm.handle("message", message.utf8Data));
        connection.on("close", () => fsm.handle("close"));
    });

    client.on("connectFailed", error => connectPromise.reject(error));

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
