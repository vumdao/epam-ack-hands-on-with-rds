import { App, Environment } from 'aws-cdk-lib';
import { AckKmsServiceAccount } from './ack-kms-irsa';
import { AckRdsServiceAccount } from './ack-rds-irsa';
import { EksCluster } from './eks-cluster';
import { devEnv } from './shared/environment';
import { TagsProp } from './shared/tagging';

const app = new App();

const eksEnv: Environment = {
  region: devEnv.region,
  account: devEnv.account,
};

const eksCluster = new EksCluster(app, 'EksCluster', devEnv, {
  description: 'EKS cluster for Development',
  env: eksEnv,
  tags: TagsProp('eks', devEnv),
});

const ackRdsSa = new AckRdsServiceAccount(app, 'AckRdsServiceAccount', devEnv, {
  description: "ACK SA for AWS RDS",
  env: devEnv,
  tags: TagsProp('ack-sa', devEnv)
});

const ackKmsSa = new AckKmsServiceAccount(app, 'AckKmsServiceAccount', devEnv, {
  description: "ACK SA for AWS Kms",
  env: devEnv,
  tags: TagsProp('ack-sa', devEnv)
});

ackRdsSa.addDependency(eksCluster);
ackKmsSa.addDependency(eksCluster);

app.synth();