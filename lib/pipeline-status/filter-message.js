const whiteListedStatusAllows = (whiteListedStatuses, state) => {
    if (!whiteListedStatuses.length) {
        return true;
    }

    return whiteListedStatuses.includes(state);
};

module.exports = {
    shouldShowUpdate: (verbose, fullPipelineInfo, whiteListedStatuses = []) => {
        if (verbose) {
            return true;
        }

        if (fullPipelineInfo.currentStage.stageNumber === 1 && fullPipelineInfo.currentStage.state === "Building" && whiteListedStatusAllows(whiteListedStatuses, fullPipelineInfo.currentStage.state)) {
            return true;
        }

        const isFixed = fullPipelineInfo.currentStage.state === "Passed" && fullPipelineInfo.currentStage === "Failed";
        const state = isFixed ? "Fixed" : fullPipelineInfo.currentStage.state;

        return fullPipelineInfo.finished
            && whiteListedStatusAllows(whiteListedStatuses, state);
    },
    matchPipeline: (matchOn, pipeline) => (
        !matchOn || ((!matchOn.pipeline || (matchOn.pipeline && new RegExp(matchOn.pipeline, ["i"]).exec(pipeline.name)))
            && (!matchOn.group || (matchOn.group && new RegExp(matchOn.group, ["i"]).exec(pipeline.group))))
    ),
};
