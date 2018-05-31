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

    describe("previousState", () => {
        it("is set to Unknown when no pipeline history", () => {
            const pipelineStatus = {
                name: "build-and-test",
                stage: {},
            };
            const pipelineConfig = {
                stages: [],
            };
            const pipelineHistory = {
                pipelines: [
                    { },
                ],
            };

            expect(buildFullPipelineInfo(pipelineStatus, pipelineConfig, pipelineHistory).previousState).toBe("Unknown");
        });

        it("is set to Passed when previous run Passed", () => {
            const pipelineStatus = {
                name: "build-and-test",
                stage: {},
            };
            const pipelineConfig = {
                stages: [],
            };
            const pipelineHistory = {
                pipelines: [
                    {},
                    {
                        stages: [{ result: "Passed" }],
                    },
                ],
            };

            expect(buildFullPipelineInfo(pipelineStatus, pipelineConfig, pipelineHistory).previousState).toBe("Passed");
        });

        it("is set to Failed when previous run Failed", () => {
            const pipelineStatus = {
                name: "build-and-test",
                stage: {},
            };
            const pipelineConfig = {
                stages: [],
            };
            const pipelineHistory = {
                pipelines: [
                    {},
                    {
                        stages: [
                            { result: "Passed" },
                            { result: "Failed" },
                        ],
                    },
                ],
            };

            expect(buildFullPipelineInfo(pipelineStatus, pipelineConfig, pipelineHistory).previousState).toBe("Failed");
        });
    });
});
