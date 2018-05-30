const rooms = require("../rooms");
const { getPipelineConfigFromApi } = require("../gocd-api/pipeline-config");
const { getPipelineHistoryFromApi } = require("../gocd-api/pipeline-history");
const { buildFullPipelineInfo } = require("./full-pipeline-info");
const { formatMessage } = require("./format-message");

const config = require(`${process.cwd()}/gocd_config.json`); // eslint-disable-line import/no-dynamic-require

const whiteListedStatusAllows = (whiteListedStatuses, state) => {
    if (!whiteListedStatuses.length) {
        return true;
    }

    return whiteListedStatuses.includes(state);
};

const shouldShowUpdate = (verbose, fullPipelineInfo, whiteListedStatuses = []) => {
    if (verbose) {
        return true;
    }

    if (fullPipelineInfo.currentStage.stageNumber === 1 && fullPipelineInfo.currentStage.state === "Building" && whiteListedStatusAllows(whiteListedStatuses, fullPipelineInfo.currentStage.state)) {
        return true;
    }

    return fullPipelineInfo.finished
        && whiteListedStatusAllows(whiteListedStatuses, fullPipelineInfo.currentStage.state);
};

const executeHandler = async (robot, handler, data) => {
    const channels = await Promise.all(handler.channels
        .map(channelName => rooms.getIdForChannel(channelName)));

    const { pipeline } = data;

    const [pipelineConfig, pipelineHistory] = await Promise.all([
        getPipelineConfigFromApi(pipeline.name, pipeline.counter),
        getPipelineHistoryFromApi(pipeline.name),
    ]);
    const fullPipelineInfo = buildFullPipelineInfo(pipeline, pipelineConfig, pipelineHistory);
    const statusWhitelist = handler.matchOn ? handler.matchOn.status : [];

    console.log("*********************************");
    console.log(JSON.stringify(fullPipelineInfo, null, 4));
    console.log(JSON.stringify(pipelineHistory, null, 4));

    if (!shouldShowUpdate(handler.verbose, fullPipelineInfo, statusWhitelist)) {
        return;
    }

    const slackAttachment = formatMessage(fullPipelineInfo);

    channels.forEach(room => robot.send({ room }, {
        attachments: [slackAttachment],
    }));
};

const matchPipeline = (matchOn, pipeline) => (
    !matchOn || ((!matchOn.pipeline || (matchOn.pipeline && new RegExp(matchOn.pipeline, ["i"]).exec(pipeline.name)))
        && (!matchOn.group || (matchOn.group && new RegExp(matchOn.group, ["i"]).exec(pipeline.group))))
);

const getMatchingMessageHandlers = message => config.resultHandlers
    .filter(handler => matchPipeline(handler.matchOn, message.pipeline));

module.exports = {
    handlePipelineStatus: (robot, data) => {
        const handlers = getMatchingMessageHandlers(data);
        handlers.forEach(handler => executeHandler(robot, handler, data));
    },
};
