const { shouldShowUpdate, matchPipeline } = require("../lib/pipeline-status/filter-message");

describe("filter message", () => {
    describe("matchPipelineOn", () => {
        describe("no matchOn or exclude options provided", () => {
            it("returns true", () => expect(matchPipeline({})).toBe(true));
        });

        describe("matchOn pipeline name", () => {
            it("returns true when name matches regex", () => expect(matchPipeline({ matchOn: { pipeline: "^pipeline$" } }, { name: "pipeline" })).toBeTruthy());

            it("returns false when name doesnt matches regex", () => expect(matchPipeline({ matchOn: { pipeline: "^nomatch$" } }, { name: "pipeline" })).toBeFalsy());

            it("returns true when name matches or regex for live", () => expect(matchPipeline({ matchOn: { pipeline: "(live|prod)" } }, { name: "live pipeline" })).toBeTruthy());

            it("returns true when name matches or regex for prod", () => expect(matchPipeline({ matchOn: { pipeline: "(live|prod)" } }, { name: "production pipeline" })).toBeTruthy());
        });

        describe("matchOn pipeline group", () => {
            it("returns true when group matches regex", () => expect(matchPipeline({ matchOn: { group: "^group$" } }, { group: "group" })).toBeTruthy());

            it("returns false when group doesnt matches regex", () => expect(matchPipeline({ matchOn: { group: "^nomatch$" } }, { group: "group" })).toBeFalsy());
        });

        describe("exclude pipeline name", () => {
            it("returns false when name matches regex", () => expect(matchPipeline({ exclude: { pipeline: "^pipeline$" } }, { name: "pipeline" })).toBeFalsy());
        });

        describe("exclude group name", () => {
            it("returns false when name matches regex", () => expect(matchPipeline({ exclude: { group: "^group$" } }, { group: "group" })).toBeFalsy());
        });
    });

    describe("shouldShowUpdate", () => {
        describe("when verbose is true", () => {
            it("returns true", () => expect(shouldShowUpdate(true)).toBe(true));
        });

        describe("when verbose is false", () => {
            describe("and no statuses are whitelisted", () => {
                it("when pipeline has started building, returns true", () => expect(shouldShowUpdate(false, {
                    currentStage: { stageNumber: 1, state: "Building" },
                }, [])).toBe(true));

                it("when pipeline has Passed stage 1, but not finished, returns false", () => expect(shouldShowUpdate(false, {
                    currentStage: { stageNumber: 1, state: "Passed" },
                    finished: false,
                }, [])).toBe(false));

                it("when pipeline has started stage 2, returns false", () => expect(shouldShowUpdate(false, {
                    currentStage: { stageNumber: 2, state: "Building" },
                    finished: false,
                }, [])).toBe(false));

                it("when pipeline has passed final stage, returns true", () => expect(shouldShowUpdate(false, {
                    currentStage: { stageNumber: 1, state: "Passed" },
                    finished: true,
                }, [])).toBe(true));
            });

            describe("status is white listed", () => {
                it("returns true when Passed is whitelisted and pipeline state is Passed", () => expect(shouldShowUpdate(false, {
                    currentStage: { stageNumber: 1, state: "Passed" },
                    finished: true,
                }, ["Passed"])).toBe(true));

                it("returns false when Passed is not whitelisted and pipeline state is Passed", () => expect(shouldShowUpdate(false, {
                    currentStage: { stageNumber: 1, state: "Failed" },
                    finished: true,
                }, ["Failed"])).toBe(true));

                it("returns true when Fixed is whitelisted and pipeline state is Fixed", () => expect(shouldShowUpdate(false, {
                    currentStage: { stageNumber: 1, state: "Passed" },
                    previousState: "Failed",
                    finished: true,
                }, ["Fixed"])).toBe(true));
            });
        });
    });
});
