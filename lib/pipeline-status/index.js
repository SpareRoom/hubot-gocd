const rooms = require("../rooms");
const { getPipelineConfigFromApi } = require("../gocd-api/pipeline-config");
const { getPipelineHistoryFromApi } = require("../gocd-api/pipeline-history");
const { buildFullPipelineInfo } = require("./full-pipeline-info");
const { formatMessage } = require("./format-message");
const { shouldShowUpdate, matchPipeline } = require("./filter-message");

const config = require(`${process.cwd()}/gocd_config.json`); // eslint-disable-line import/no-dynamic-require

const executeHandler = async (robot, handler, data) => {
    try {
        const channels = await Promise.all(handler.channels
            .map(channelName => rooms.getIdForChannel(channelName)));

        const { pipeline } = data;

        const pipelineInfo = await Promise.all([
            getPipelineConfigFromApi(pipeline.name, pipeline.counter),
            getPipelineHistoryFromApi(pipeline.name),
        ]);

        const fullPipelineInfo = buildFullPipelineInfo(pipeline, ...pipelineInfo);
        const statusWhitelist = handler.matchOn ? handler.matchOn.status : [];

        if (!shouldShowUpdate(handler.verbose, fullPipelineInfo, statusWhitelist)) {
            return;
        }

        const attachments = [formatMessage(fullPipelineInfo)];

        channels.forEach(room => robot.send({ room }, { attachments }));
    } catch (e) {
        console.error(`Error handling gocd pipeline result: ${e.message}`);
    }
};

const getMatchingMessageHandlers = message => config.resultHandlers
    .filter(handler => matchPipeline(handler.matchOn, message.pipeline));

module.exports = {
    handlePipelineStatus: (robot, data) => {
        const handlers = getMatchingMessageHandlers(data);
        handlers.forEach(handler => executeHandler(robot, handler, data));
    },
};
