const WebSocketClient = require("websocket").client;
const Finity = require("finity");
const { EventEmitter } = require("events");

module.exports = (config) => {
    const client = new WebSocketClient();
    const { retryInterval } = config;
    const url = `ws://${config.host}:${config.port}`;
    const eventEmitter = new EventEmitter();
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
                .on("start")
                    .transitionTo("connecting")
                    .withAction(() => console.log("Websocket module started.", {
                        host: config.host,
                        port: config.port,
                    }))
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
                    .selfTransition()
                    .withAction((from, to, { eventPayload }) => eventEmitter.emit("message", eventPayload))
                .on("close")
                    .transitionTo("disconnected")
            .state("disconnected")
                .onEnter(() => console.log("Disconnected to GoCD"))
                .onTimeout(retryInterval || 5000)
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
        start: () => fsm.handle("start"),
        stop: () => fsm.handle("stop"),
        on: eventEmitter.on,
    };
};
