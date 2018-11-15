const whiteListedStatusAllows = (whiteListedStatuses, state) => {
    if (!whiteListedStatuses.length) {
        return true;
    }

    return whiteListedStatuses.includes(state);
};

const matchPropertyRule = (rule, value) => rule && new RegExp(rule, ["i"]).exec(value);

const matchAgainstRule = (matchOn, pipeline) => !matchOn || (
    (!matchOn.pipeline || matchPropertyRule(matchOn.pipeline, pipeline.name)) &&
    (!matchOn.group || matchPropertyRule(matchOn.group, pipeline.group))
);

const excludeAgainstRule = (exclude, pipeline) => exclude && (
    (matchPropertyRule(exclude.pipeline, pipeline.name)) ||
    (matchPropertyRule(exclude.group, pipeline.group))
);

module.exports = {
    shouldShowUpdate: (verbose, fullPipelineInfo, whiteListedStatuses = []) => {
        if (verbose) {
            return true;
        }

        if (fullPipelineInfo.currentStage.stageNumber === 1 && fullPipelineInfo.currentStage.state === "Building" && whiteListedStatusAllows(whiteListedStatuses, fullPipelineInfo.currentStage.state)) {
            return true;
        }

        const isFixed = fullPipelineInfo.currentStage.state === "Passed" && fullPipelineInfo.previousState === "Failed";
        const state = isFixed ? "Fixed" : fullPipelineInfo.currentStage.state;

        return fullPipelineInfo.finished
            && whiteListedStatusAllows(whiteListedStatuses, state);
    },
    matchPipeline: ({ matchOn, exclude }, pipeline) => (
        matchAgainstRule(matchOn, pipeline) && !excludeAgainstRule(exclude, pipeline)
    ),
};
