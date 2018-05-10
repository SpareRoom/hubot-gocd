const { buildFullPipelineInfo } = require("../lib/pipeline-status/full-pipeline-info");

describe("build full pipeline info", () => {
    describe("pipelineType", () => {
        it("is set to 'deployment' when the pipeline name contains deploy", () => {
            const pipelineStatus = {
                name: "test deploy",
                stage: {},
            };
            const pipelineConfig = {
                stages: [],
            };

            expect(buildFullPipelineInfo(pipelineStatus, pipelineConfig).pipelineType).toBe("deployment");
        });

        it("is set to 'release' when pipeline name contains live", () => {
            const pipelineStatus = {
                name: "live deploy",
                stage: {},
            };
            const pipelineConfig = {
                stages: [],
            };

            expect(buildFullPipelineInfo(pipelineStatus, pipelineConfig).pipelineType).toBe("release");
        });

        it("is set to 'release' when pipeline name contains prod", () => {
            const pipelineStatus = {
                name: "production deploy",
                stage: {},
            };
            const pipelineConfig = {
                stages: [],
            };

            expect(buildFullPipelineInfo(pipelineStatus, pipelineConfig).pipelineType).toBe("release");
        });

        it("is set to 'build' when pipeline name contains neither live, prod or deploy", () => {
            const pipelineStatus = {
                name: "build-and-test",
                stage: {},
            };
            const pipelineConfig = {
                stages: [],
            };

            expect(buildFullPipelineInfo(pipelineStatus, pipelineConfig).pipelineType).toBe("build");
        });
    });
});
