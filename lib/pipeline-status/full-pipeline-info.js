const moment = require("moment");

const getDeploymentType = (name) => {
    if (name.match(/(live|prod)/i)) {
        return "release";
    }

    if (name.includes("deploy")) {
        return "deployment";
    }

    return "build";
};

const isLastStage = (stageIndex, stagesLength) => stageIndex === (stagesLength - 1);

const buildGocdPathSegment = ({ name, counter }) => `${name}/${counter}/`;

const buildGocdPipelineStageLink = pipeline =>
    `${process.env.HUBOT_GOCD_EXTERNAL_LINK}/go/pipelines/${buildGocdPathSegment(pipeline)}/${buildGocdPathSegment(pipeline.stage)}`;

const getPreviousStateFromHistory = ({ pipelines }) => {
    if (!pipelines || pipelines.length < 2) {
        return "Unknown";
    }

    return pipelines[1].stages.reduce((worstStatus, { result }) => {
        if (["Passed", "Failed", "Cancelled"].includes(result)) {
            return result;
        }

        return worstStatus;
    }, "Unknown");
};

const buildFullPipelineInfo = (pipeline, { stages }, history = {}) => {
    const additionalFields = {};

    const { stage, name } = pipeline;
    const { state } = stage;

    const stageIndex = stages.findIndex(current => stage.name === current.name);

    const finished = (isLastStage(stageIndex, stages.length) && state === "Passed") || ["Failed", "Cancelled"].includes(state);

    if (finished) {
        const startedAt = moment(stage["last-transition-time"]);
        const finishedAt = moment(stages[0].jobs[0].scheduled_date);

        additionalFields.took = startedAt.diff(finishedAt);
    }

    return {
        name,
        pipelineType: getDeploymentType(name),
        previousState: getPreviousStateFromHistory(history),
        finished,
        currentStage: {
            name: stage.name,
            stageNumber: stageIndex > -1 ? (stageIndex + 1) : "?",
            state: stage.state,
            startedBy: stage["approved-by"],
            startedAt: stage["create-time"],
            url: buildGocdPipelineStageLink(pipeline),
        },
        totalStages: stages.length,
        ...additionalFields,
    };
};

module.exports = { buildFullPipelineInfo };
