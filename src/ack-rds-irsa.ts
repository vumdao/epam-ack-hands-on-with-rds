import { Stack, StackProps, CfnOutput, Fn, CfnJson } from 'aws-cdk-lib';
import { Role, FederatedPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './shared/environment';

export class AckRdsServiceAccount extends Stack {
  constructor(scope: Construct, id: string, reg: EnvironmentConfig, props: StackProps) {
    super(scope, id, props);

    const oidcUrl = Fn.importValue(`${reg.pattern}-iam-oidc-${reg.stage}-url`);
    const oidcArn = Fn.importValue(`${reg.pattern}-iam-oidc-${reg.stage}-arn`);

    const rdsStatement = new PolicyStatement({
      sid: 'CreateRds',
      actions: [
        "rds:*"
      ],
      resources: [`arn:aws:rds:${this.region}:${this.account}:*`],
      conditions: {
        StringEquals: {
          'aws:RequestedRegion': this.region
        }
      }
    });

    const rdsEc2Sts = new PolicyStatement({
      sid: "EC2Describe",
      actions: [
        "ec2:Describe*"
      ],
      resources: ['*'],
      conditions: {
        StringEquals: {
          'aws:RequestedRegion': this.region,
          'aws:PrincipalAccount': this.account
        }
      }
    });

    const kmsSts = new PolicyStatement({
      sid: "RdsCkm",
      actions: [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:CreateGrant",
        "kms:DescribeKey"
      ],
      resources: [`arn:aws:kms:${this.region}:${this.account}:key/*`]
    });

    const rdslinkedRole = new PolicyStatement({
      sid: 'LinkedRole',
      actions: ['iam:CreateServiceLinkedRole'],
      resources: ['*'],
      conditions: {
        StringLike: {
          "iam:AWSServiceName": [
            "rds.amazonaws.com",
            "rds.application-autoscaling.amazonaws.com"
          ]
        }
      }
    });

    const stringEquals = new CfnJson(this, 'AckCondiftionJson', {
      value: {
        [`${oidcUrl}:sub`]: 'system:serviceaccount:ack-system:ack-rds-controller',
        [`${oidcUrl}:aud`]: 'sts.amazonaws.com',
      },
    });

    const ackControllerRole = new Role(this, 'ackControllerRole', {
      roleName: `${reg.pattern}-ack-rds-controller-${reg.stage}`,
      assumedBy: new FederatedPrincipal(
        oidcArn,
        {
          StringEquals: stringEquals,
        },
        'sts:AssumeRoleWithWebIdentity')
    });

    for (var sts of [rdsStatement, rdslinkedRole, rdsEc2Sts, kmsSts]) {
      ackControllerRole.addToPolicy(sts);
    }

    new CfnOutput(this, 'ackControllerRoleOutput', { value: ackControllerRole.roleArn });
  }
}