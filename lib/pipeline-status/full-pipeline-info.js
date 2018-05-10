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

const buildFullPipelineInfo = (pipeline, config) => {
    const additionalFields = {};

    const stageIndex = config.stages.reduce((index, current, i) => {
        if (pipeline.stage.name === current.name) {
            return i;
        }

        return index;
    }, -1);

    const finished = (stageIndex === (config.stages.length - 1) && pipeline.stage.state === "Passed") || ["Failed", "Cancelled"].includes(pipeline.stage.state);

    if (finished) {
        const startedAt = moment(pipeline.stage["last-transition-time"]);
        const finishedAt = moment(config.stages[0].jobs[0].scheduled_date);

        additionalFields.took = startedAt.diff(finishedAt);
    }

    return {
        name: pipeline.name,
        pipelineType: getDeploymentType(pipeline.name),
        finished,
        currentStage: {
            name: pipeline.stage.name,
            stageNumber: stageIndex > -1 ? (stageIndex + 1) : "?",
            state: pipeline.stage.state,
            startedBy: pipeline.stage["approved-by"],
            startedAt: pipeline.stage["create-time"],
        },
        totalStages: config.stages.length,
        ...additionalFields,
    };
};

module.exports = { buildFullPipelineInfo };
