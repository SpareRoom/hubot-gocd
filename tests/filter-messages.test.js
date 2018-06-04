const { shouldShowUpdate, matchPipeline } = require("../lib/pipeline-status/filter-message");

describe("filter message", () => {
    describe("matchPipelineOn", () => {
        describe("no matchOn options provided", () => {
            it("returns true", () => expect(matchPipeline()).toBe(true));
        });

        describe("matchOn pipeline name", () => {
            it("returns true when name matches regex", () => expect(matchPipeline({ pipeline: "^pipeline$" }, { name: "pipeline" })).toBeTruthy());

            it("returns false when name doesnt matches regex", () => expect(matchPipeline({ pipeline: "^nomatch$" }, { name: "pipeline" })).toBeFalsy());

            it("returns true when name matches or regex for live", () => expect(matchPipeline({ pipeline: "(live|prod)" }, { name: "live pipeline" })).toBeTruthy());

            it("returns true when name matches or regex for prod", () => expect(matchPipeline({ pipeline: "(live|prod)" }, { name: "production pipeline" })).toBeTruthy());
        });

        describe("matchOn pipeline group", () => {
            it("returns true when group matches regex", () => expect(matchPipeline({ group: "^group$" }, { group: "group" })).toBeTruthy());

            it("returns false when group doesnt matches regex", () => expect(matchPipeline({ group: "^nomatch$" }, { group: "group" })).toBeFalsy());
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
        });
    });
});
