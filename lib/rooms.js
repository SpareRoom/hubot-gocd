const request = require("request");

let rooms;

function loadRooms() {
    const url = `https://slack.com/api/channels.list?token=${process.env.HUBOT_SLACK_TOKEN}`;
    return new Promise(resolve => request(url, (error, response, body) => {
        if (error) {
            console.log(`Error loading rooms from slack: ${error.message}`);
            return resolve({});
        }

        if (response.statusCode !== 200) {
            console.log(`Slack returned ${response.statusCode}, body: ${body}`);
            return resolve({});
        }

        const json = JSON.parse(body);

        return resolve(json.channels.reduce((roomList, room) => {
            roomList[room.name] = room.id;

            return roomList;
        }, {}));
    }));
}

module.exports = {
    getIdForChannel: (channel) => {
        if (!rooms) {
            return loadRooms().then((newRooms) => {
                rooms = newRooms;
                return Promise.resolve(rooms[channel]);
            });
        }

        return Promise.resolve(rooms[channel]);
    },
};
