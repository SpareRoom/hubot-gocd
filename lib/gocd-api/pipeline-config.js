const request = require("request");

module.exports = {
    getPipelineConfigFromApi: async (pipeline, counter) => {
        const url = `${process.env.HUBOT_GOCD_API_PROTOCOL || "https"}://${process.env.HUBOT_GOCD_HOST}:${process.env.HUBOT_GOCD_API_PORT}/go/api/pipelines/${pipeline}/instance/${counter}/`;

        return new Promise((resolve, reject) => request({
            url,
            headers: {
                "Content-Type": "application/json",
            },
            auth: {
                user: process.env.HUBOT_GOCD_USERNAME,
                pass: process.env.HUBOT_GOCD_PASSWORD,
            },
        }, (err, response, data) => {
            if (err) {
                return reject(err);
            }

            try {
                return resolve(JSON.parse(data));
            } catch (e) {
                return reject(e);
            }
        }));
    },
};
