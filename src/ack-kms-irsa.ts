import { Stack, StackProps, CfnOutput, Fn, CfnJson } from 'aws-cdk-lib';
import { Role, FederatedPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './shared/environment';

export class AckKmsServiceAccount extends Stack {
  constructor(scope: Construct, id: string, reg: EnvironmentConfig, props: StackProps) {
    super(scope, id, props);

    const oidcUrl = Fn.importValue(`${reg.pattern}-iam-oidc-${reg.stage}-url`);
    const oidcArn = Fn.importValue(`${reg.pattern}-iam-oidc-${reg.stage}-arn`);

    const kmsStatement = new PolicyStatement({
      sid: 'CreateDeleteKMS',
      actions: [
        "kms:GetKeyPolicy",
        "kms:DescribeKey",
        "kms:ListKey*",
        "kms:ListResourceTags",
        "tag:GetResources",
        "kms:CreateKey",
        "kms:DisableKey",
        "kms:ScheduleKeyDeletion",
        "kms:TagResource"
      ],
      resources: ['*']
    });

    const stringEquals = new CfnJson(this, 'AckCondiftionJson', {
      value: {
        [`${oidcUrl}:sub`]: 'system:serviceaccount:ack-system:ack-kms-controller',
        [`${oidcUrl}:aud`]: 'sts.amazonaws.com',
      },
    });

    const ackKmsControllerRole = new Role(this, 'ackKmsControllerRole', {
      roleName: `${reg.pattern}-ack-kms-controller-${reg.stage}`,
      assumedBy: new FederatedPrincipal(
        oidcArn,
        {
          StringEquals: stringEquals,
        },
        'sts:AssumeRoleWithWebIdentity')
    });

    ackKmsControllerRole.addToPolicy(kmsStatement);

    new CfnOutput(this, 'ackKmsControllerRoleOutput', { value: ackKmsControllerRole.roleArn });
  }
}