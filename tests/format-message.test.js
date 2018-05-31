const { formatMessage } = require("../lib/pipeline-status/format-message");

describe("format message", () => {
    describe("sets title", () => {
        it("To 'Deployment' for deployment pipeline type", () => {
            const pipelineInfo = {
                currentStage: {},
                pipelineType: "deployment",
            };

            expect(formatMessage(pipelineInfo).title).toBe("Deployment");
        });

        it("To 'Build' for deployment pipeline build", () => {
            const pipelineInfo = {
                currentStage: {},
                pipelineType: "build",
            };

            expect(formatMessage(pipelineInfo).title).toBe("Build");
        });

        it("To 'Release' for deployment pipeline release", () => {
            const pipelineInfo = {
                currentStage: {},
                pipelineType: "release",
            };

            expect(formatMessage(pipelineInfo).title).toBe("Release");
        });
    });

    describe("text", () => {
        it("starts with the pipeline name and stage", () => {
            const pipelineInfo = {
                name: "test-pipeline",
                currentStage: {
                    name: "test",
                },
                pipelineType: "build",
            };

            expect(formatMessage(pipelineInfo).text).toMatch(/^test-pipeline - test/);
        });

        describe("status ends with", () => {
            it("Building when the type is build and stage state is Building", () => {
                const pipelineInfo = {
                    name: "test-pipeline",
                    currentStage: {
                        name: "test",
                        state: "Building",
                    },
                    pipelineType: "build",
                };

                expect(formatMessage(pipelineInfo).text).toMatch(/ Building$/);
            });

            it("Passed when the type is build, stage state is Passed and it is not the final stage", () => {
                const pipelineInfo = {
                    name: "test-pipeline",
                    currentStage: {
                        name: "test",
                        state: "Passed",
                    },
                    pipelineType: "build",
                };

                expect(formatMessage(pipelineInfo).text).toMatch(/ Passed$/);
            });

            it("Finished when the type is build, stage state is Passed and it is the final stage", () => {
                const pipelineInfo = {
                    name: "test-pipeline",
                    finished: true,
                    currentStage: {
                        name: "test",
                        state: "Passed",
                    },
                    pipelineType: "build",
                };

                expect(formatMessage(pipelineInfo).text).toMatch(/ Finished$/);
            });

            it("Fixed when the type is build, stage state is Passed and it is the final stage and the previousState is 'Failed'", () => {
                const pipelineInfo = {
                    name: "test-pipeline",
                    finished: true,
                    previousState: "Failed",
                    currentStage: {
                        name: "test",
                        state: "Passed",
                    },
                    pipelineType: "build",
                };

                expect(formatMessage(pipelineInfo).text).toMatch(/ Fixed$/);
            });

            it("Deploying when the type is deployment and stage state is Building", () => {
                const pipelineInfo = {
                    name: "test-pipeline",
                    currentStage: {
                        name: "test",
                        state: "Building",
                    },
                    pipelineType: "deployment",
                };

                expect(formatMessage(pipelineInfo).text).toMatch(/ Deploying$/);
            });

            it("Releasing when the type is release and stage state is Building", () => {
                const pipelineInfo = {
                    name: "test-pipeline",
                    currentStage: {
                        name: "test",
                        state: "Building",
                    },
                    pipelineType: "release",
                };

                expect(formatMessage(pipelineInfo).text).toMatch(/ Releasing$/);
            });
        });
    });
});
