import * as core from '@actions/core';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { Configuration, Linter } from 'tslint';
import * as child from 'child_process';

// @ts-ignore
(async () => {
  const configFileName = core.getInput('config') || 'tslint.json';
  const projectFileName = core.getInput('project');
  const pattern = core.getInput('pattern');

  if (!projectFileName && !pattern) {
    core.setFailed('tslint-actions: Please set project or pattern input');
    return;
  }

  const options = {
    fix: false
  };

  // Create a new Linter instance
  const result = (() => {
    if (projectFileName && !pattern) {
      const projectDir = path.dirname(path.resolve(projectFileName));
      const program = Linter.createProgram(projectFileName, projectDir);
      const linter = new Linter(options, program);

      const files = Linter.getFileNames(program);
      // @ts-ignore
      for (const file of files) {
        const sourceFile = program.getSourceFile(file);
        if (sourceFile) {
          const fileContents = sourceFile.getFullText();
          const configuration = Configuration.findConfiguration(configFileName, file).results;
          linter.lint(file, fileContents, configuration);
        }
      }

      return linter.getResult();
    } else {
      const linter = new Linter(options);

      const files = glob.sync(pattern!); // tslint:disable-line
      // @ts-ignore
      for (const file of files) {
        const fileContents = fs.readFileSync(file, { encoding: 'utf8' });
        const configuration = Configuration.findConfiguration(configFileName, file).results;
        linter.lint(file, fileContents, configuration);
      }

      return linter.getResult();
    }
  })();

  fs.writeFileSync('/var/task/result.json', result.output);

  child.exec('/var/task/bin/reviewdog -reporter=github-pr-check -f typescript < /var/task/result.json'
      // @ts-ignore
      , (error: string, stdout: string, stderr: string) => {
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
