const WebSocketClient = require("websocket").client;

module.exports = (config, handlers) => {
    const client = new WebSocketClient();
    const retryEvery = config.retryInterval || 5000;

    let openConnection;

    function attemptConnection(wsClient, url) {
        wsClient.connect(url);
    }

    function retryConnection() {
        console.log(`Retrying connection in ${retryEvery}ms`);
        setTimeout(openConnection, retryEvery);
    }

    client.on("connectFailed", (error) => {
        console.error("Failed to connect", { error });

        retryConnection();
    });

    client.on("connect", (connection) => {
        console.log("WebSocket Client Connected");

        connection.on("error", (error) => {
            console.error("Connection Error", { error });
        });

        connection.on("close", () => {
            console.log("Connection Closed");

            retryConnection();
        });

        connection.on("message", message => handlers.message(message.utf8Data));
    });

    return {
        start: () =>
            new Promise((resolve) => {
                console.log("Websocket module started.", {
                    host: config.host,
                    port: config.port,
                });
                const url = `ws://${config.host}:${config.port}`;

                (openConnection = attemptConnection.bind(
                    undefined,
                    client,
                    url,
                ))();

                resolve();
            }),
        stop: () => { },
    };
};
