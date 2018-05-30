const moment = require("moment");

const colourMap = {
    Building: "warning",
    Failed: "danger",
    Passed: "good",
};

const getStageStateText = (fullPipelineInfo) => {
    if (fullPipelineInfo.finished && fullPipelineInfo.currentStage.state === "Passed") {
        return "Finished";
    }

    if (fullPipelineInfo.pipelineType === "deployment" && fullPipelineInfo.currentStage.state === "Building") {
        return "Deploying";
    }

    if (fullPipelineInfo.pipelineType === "release" && fullPipelineInfo.currentStage.state === "Building") {
        return "Releasing";
    }

    return fullPipelineInfo.currentStage.state;
};

const formatMessage = (fullPipelineInfo) => {
    const message = `${fullPipelineInfo.name} - ${fullPipelineInfo.currentStage.name} ${getStageStateText(fullPipelineInfo)}`;
    const additionalFields = [];

    if (fullPipelineInfo.took) {
        additionalFields.push({
            title: "Took",
            value: moment
                .duration(fullPipelineInfo.took)
                .humanize(),
            short: true,
        });
    }

    return {
        title: `${fullPipelineInfo.pipelineType[0].toUpperCase()}${fullPipelineInfo.pipelineType.substring(1)}`,
        text: message,
        fallback: message,
        color: colourMap[fullPipelineInfo.currentStage.state],
        fields: [
            {
                title: "Progress",
                value: `${fullPipelineInfo.currentStage.stageNumber}/${fullPipelineInfo.totalStages}`,
                short: true,
            },
            {
                title: "Stage",
                value: fullPipelineInfo.currentStage.name,
                short: true,
            },
            {
                title: "Started By",
                value: fullPipelineInfo.currentStage.startedBy,
                short: true,
            },
            {
                title: "Started At",
                value: moment(fullPipelineInfo.startedAt).format("HH:mm"),
                short: true,
            },
            ...additionalFields,
        ],
        actions: [
            {
                type: "button",
                text: "🔍 View in GoCD",
                url: fullPipelineInfo.currentStage.url,
                style: "primary",
            },
        ],
    };
};

module.exports = { formatMessage };
