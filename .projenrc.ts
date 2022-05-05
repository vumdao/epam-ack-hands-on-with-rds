import { awscdk } from "projen";
import { ApprovalLevel } from "projen/lib/awscdk";
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: "2.23.0",
  defaultReleaseBranch: "master",
  name: "epam-ack-hands-on-with-rds",
  projenrcTs: true,
  deps: ['env-var', 'dotenv'],
  gitignore: ['.idea'],
  requireApproval: ApprovalLevel.NEVER


  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

const dotEnvFile = '.env';
project.gitignore.addPatterns(dotEnvFile);
project.gitignore.addPatterns('.github');
project.gitignore.addPatterns('*.drawio');
project.gitignore.addPatterns('*.psd');
project.gitignore.addPatterns('*-chart');

project.synth();