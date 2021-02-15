"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const tslint_1 = require("tslint");
const child = require("child_process");
// @ts-ignore
(async () => {
    const configFileName = core.getInput('config') || 'tslint.json';
    const projectFileName = core.getInput('project');
    const pattern = core.getInput('pattern');
    if (!projectFileName && !pattern) {
        core.setFailed('tslint-actions: Please set project or pattern input');
        return;
    }
    const ghToken = core.getInput('token');
    if (!ghToken) {
        core.setFailed('github-actions: Please set token');
        return;
    }
    const options = {
        fix: false,
        format: 'prose'
    };
    // Create a new Linter instance
    const result = (() => {
        if (projectFileName && !pattern) {
            const projectDir = path.dirname(path.resolve(projectFileName));
            const program = tslint_1.Linter.createProgram(projectFileName, projectDir);
            const linter = new tslint_1.Linter(options, program);
            const files = tslint_1.Linter.getFileNames(program);
            // @ts-ignore
            for (const file of files) {
                const sourceFile = program.getSourceFile(file);
                if (sourceFile) {
                    const fileContents = sourceFile.getFullText();
                    const configuration = tslint_1.Configuration.findConfiguration(configFileName, file).results;
                    linter.lint(file, fileContents, configuration);
                }
            }
            return linter.getResult();
        }
        else {
            const linter = new tslint_1.Linter(options);
            const files = glob.sync(pattern); // tslint:disable-line
            // @ts-ignore
            for (const file of files) {
                const fileContents = fs.readFileSync(file, { encoding: 'utf8' });
                const configuration = tslint_1.Configuration.findConfiguration(configFileName, file).results;
                linter.lint(file, fileContents, configuration);
            }
            return linter.getResult();
        }
    })();
    fs.writeFileSync('/var/task/result.json', result.output);
    child.exec('/var/task/bin/reviewdog -reporter=github-check -f=tslint < /var/task/result.json', { env: { REVIEWDOG_GITHUB_API_TOKEN: ghToken } }
    // @ts-ignore
    , (error, stdout, stderr) => {
        if (error) {
            console.error(`error: ${error}`); // tslint:disable-line
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`); // tslint:disable-line
            return;
        }
        console.log(`stdout:\n${stdout}`); // tslint:disable-line
    });
    console.log(result.output); // tslint:disable-line
})().catch((e) => {
    console.error(e.stack); // tslint:disable-line
    core.setFailed(e.message);
});
