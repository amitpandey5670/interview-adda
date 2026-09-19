import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const base = path.resolve('data/aws/modules');

const WA = { title: 'AWS Well-Architected Framework', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html' };
const CF = { title: 'AWS Cloud Foundation', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/migration-aws-environment/welcome.html' };
const SAAS = { title: 'SaaS Lens — AWS Well-Architected Framework', url: 'https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-lens.html' };

function topic(cfg) {
  const id = `${cfg.prefix}-${cfg.slug}`;
  const glossary = (cfg.terms || []).map(t => ({ term: t[0], longForm: t[1], plainDefinition: t[2], example: t[3] }));
  return {
    id, slug: cfg.slug, title: cfg.title, moduleId: cfg.moduleId, order: cfg.order, hook: cfg.hook,
    sections: [
      { heading: 'What is this?', blocks: [{ type: 'prose', text: cfg.whatIs }, { type: 'glossary', title: 'Key terms', entries: glossary }] },
      { heading: 'Why does it matter?', blocks: [{ type: 'prose', text: cfg.why }, { type: 'callout', variant: 'tip', title: 'Interview framing', body: cfg.frame }] },
      { heading: 'How it works step by step', blocks: [{ type: 'steps', title: 'Mechanism', items: cfg.steps }, { type: 'diagram', diagram: { type: 'mermaid', title: cfg.diagTitle, source: cfg.diag } }] },
      { heading: 'Code walkthrough', blocks: cfg.snippets.map(s => ({ type: 'snippet', snippet: s })) },
      { heading: 'Compare with JavaScript and TypeScript', blocks: [{ type: 'comparisonTable', title: 'Cloud vs app patterns', headers: ['Aspect', 'AWS', 'JS/TS'], rows: cfg.compare }] },
      { heading: 'Common mistakes', blocks: [{ type: 'callout', variant: 'warning', title: 'Pitfalls to avoid', body: cfg.mistakes }] },
      { heading: 'Senior interview depth', blocks: [
        { type: 'prose', text: cfg.senior },
        { type: 'comparisonTable', title: 'Tradeoffs at senior level', headers: ['Pattern', 'Win', 'Cost / risk'], rows: cfg.seniorRows },
        { type: 'callout', variant: 'warning', title: 'What gets you rejected in interviews', body: cfg.reject }
      ]}
    ],
    interviewTakeaways: cfg.takeaways,
    commonPitfalls: cfg.pitfalls,
    relatedTopicIds: cfg.related.map(s => `${cfg.prefix}-${s}`),
    jsTsCorrelations: cfg.jsTs,
    officialSources: cfg.sources,
    animationHint: cfg.anim || 'flow',
    scenarioTag: cfg.tag || 'high-concurrency'
  };
}

function writeTopic(folder, data) {
  const dir = path.join(base, folder, 'topics');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${data.slug}.json`), JSON.stringify(data, null, 2) + '\n');
}

function writeJson(folder, name, data) {
  writeFileSync(path.join(base, folder, name), JSON.stringify(data, null, 2) + '\n');
}

// Module 16 topics
const m16 = 'aws-16-well-architected';
const p16 = 'aws-16';

const topics16 = [
  topic({
    prefix: p16, moduleId: m16, slug: 'well-architected-overview', order: 1,
    title: 'Well-Architected overview (framework and review workflow)',
    hook: 'The AWS Well-Architected Framework organizes cloud design into six pillars with actionable best practices. A Well-Architected Review asks structured questions so you find high-risk gaps before customers do.',
    whatIs: 'The framework is a lens for tradeoffs across six pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability. The Well-Architected Tool stores workloads, runs questionnaires, and tracks High-Risk Issues (HRIs). Lenses such as SaaS and Serverless add domain-specific questions.',
    why: 'Senior interviews expect pillar language with evidence. Production teams run quarterly Well-Architected Framework Reviews (WAFR) before major launches. Enterprise customers map your controls to Security and Reliability pillars.',
    frame: 'Say: six pillars, review questions, HRIs — framework is continuous improvement, not a one-time checkbox.',
    terms: [['Pillar','Well-Architected pillar','Design focus area with principles and questions','Security pillar covers identity and data protection'],['HRI','High-Risk Issue','Answer that violates best practice and needs remediation','Single-AZ production database'],['Lens','Well-Architected lens','Domain overlay on core pillars','SaaS Lens for multi-tenant products'],['Workload','Defined workload','Bounded system under review — accounts, regions, dependencies','payments-api prod in two regions']],
    steps: [
      { title: 'Define workload boundary', body: 'Scope environment, accounts, regions, and dependencies.' },
      { title: 'Answer pillar questions', body: 'Complete questionnaires in Well-Architected Tool or workshop.' },
      { title: 'Identify HRIs', body: 'Flag high-risk answers — missing backups, open ingress, no runbooks.' },
      { title: 'Remediate and milestone', body: 'Fix HRIs, create milestone snapshot, re-review quarterly.' }
    ],
    diagTitle: 'WAFR workflow', diag: 'flowchart LR\n  W[Workload] --> Q[Pillar Q&A]\n  Q --> H[HRIs]\n  H --> R[Remediation]\n  R --> M[Milestone]',
    snippets: [
      { language: 'bash', label: 'Create workload', code: 'aws wellarchitected create-workload \\\n  --workload-name payments-prod \\\n  --environment PRODUCTION \\\n  --review-owner platform@example.com \\\n  --aws-regions us-east-1 \\\n  --lenses wellarchitected', explanation: 'Registers workload for structured reviews.' },
      { language: 'bash', label: 'List high-risk answers', code: 'aws wellarchitected list-answers \\\n  --workload-id <id> \\\n  --lens-alias wellarchitected \\\n  --query "AnswerSummaries[?Risk==`HIGH`].QuestionTitle"', explanation: 'Export HRIs for sprint planning.' },
      { language: 'yaml', label: 'Cost allocation tags', code: 'Tags:\n  - Key: workload\n    Value: payments-prod\n  - Key: cost-center\n    Value: finops-42', explanation: 'Cost pillar needs tags for chargeback.' },
      { language: 'bash', label: 'Create milestone', code: 'aws wellarchitected create-milestone \\\n  --workload-id <id> \\\n  --milestone-name post-hri-q2 \\\n  --milestone-number 2', explanation: 'Snapshots progress after remediation.' }
    ],
    compare: [['Review','Quarterly WAFR with HRIs','Quarterly dependency audits'],['Scope','Cross-account workload','Single repo/service'],['Evidence','Config rules + alarms','CI test coverage']],
    mistakes: 'Treating framework as launch-only checklist. Claiming compliance without backup restore proof or alarm runbooks.',
    senior: 'How to prove it in production: map HRIs to AWS Config rules, CloudWatch alarm coverage, and backup job success metrics. Mature teams block prod deploys while Security HRIs remain open.',
    seniorRows: [['Central WAFR guild','Consistent reviews','Bottleneck'],['Per-team mini-reviews','Fast feedback','Misses cross-workload deps'],['Automated Config','Continuous signals','Tuning needed']],
    reject: 'Saying you follow all pillars perfectly — rejected. Strong answer: pillars conflict; document tradeoffs and residual risk.',
    takeaways: ['Six pillars + review questions + HRIs — continuous improvement lens.','Perfect scores on all pillars are impossible — document tradeoffs.','Link HRIs to Config rules and alarm dashboards in production.','60s: Framework evaluates design via six pillars. Tool tracks workloads and HRIs. Lenses add SaaS context. Prioritize fixes by business risk.','Follow-up: which pillar conflicts most with your architecture?'],
    pitfalls: ['Claiming compliance without evidence — rejected; need restore tests and runbooks.','Strong answer: pillar, principle, tradeoff, proving metric.','One-time review at launch only.','Ignoring Sustainability when customers require carbon reporting.'],
    related: ['pillar-operational-excellence','pillar-security','pillar-reliability'],
    jsTs: [{ language: 'javascript', concept: 'ADRs', note: 'Architecture Decision Records mirror WAFR tradeoff documentation.', futureTopicSlug: 'javascript/cloud/architecture' },{ language: 'typescript', concept: 'Bounded contexts', note: 'TypeScript module boundaries help scope a Well-Architected workload.', futureTopicSlug: 'typescript/cloud/architecture' }],
    sources: [WA, { title: 'Well-Architected Tool User Guide', url: 'https://docs.aws.amazon.com/wellarchitected/latest/userguide/intro.html' }],
    anim: 'flow', tag: 'high-concurrency'
  }),
  topic({
    prefix: p16, moduleId: m16, slug: 'pillar-operational-excellence', order: 2,
    title: 'Operational Excellence pillar (run and observe systems)',
    hook: 'Operational Excellence means running workloads reliably through automation, observability, and safe change. You learn from operations and feed improvements back into design.',
    whatIs: 'Design principles: perform operations as code, annotate documentation, make frequent small reversible changes, refine procedures from events, and anticipate failure. Key practices include Infrastructure as Code (IaC), CI/CD pipelines, runbooks, Game Days, and blameless postmortems.',
    why: 'Interviewers ask how you deploy without downtime and how you know a service is healthy before customers complain. Operational Excellence separates teams that firefight from teams with automated rollback and SLO-driven alerts.',
    frame: 'Say: ops as code, small changes, observability, runbooks, learn from incidents.',
    terms: [['IaC','Infrastructure as Code','Templates define infra — CloudFormation, CDK, Terraform','ECS service from CDK stack'],['Runbook','Operational runbook','Step-by-step incident response','RDS failover procedure'],['Game Day','Resilience game day','Simulated failure exercise','Kill primary AZ during drill'],['SLO','Service Level Objective','Target reliability metric','99.9% availability monthly']],
    steps: [
      { title: 'Automate deployments', body: 'CI/CD with staged rollouts, health checks, and automatic rollback.' },
      { title: 'Instrument observability', body: 'Metrics, logs, traces with dashboards and SLO-based alarms.' },
      { title: 'Document operations', body: 'Runbooks linked to alarms; architecture diagrams kept current.' },
      { title: 'Improve from events', body: 'Postmortems produce action items tracked to completion.' }
    ],
    diagTitle: 'Ops flywheel', diag: 'flowchart TB\n  DEPLOY[Automated deploy] --> OBS[Observe metrics/logs]\n  OBS --> ALARM[Alarm fires]\n  ALARM --> RUNBOOK[Runbook response]\n  RUNBOOK --> POST[Postmortem]\n  POST --> DEPLOY',
    snippets: [
      { language: 'yaml', label: 'CodePipeline deploy stage', code: 'DeployStage:\n  Actions:\n    - Name: ECSDeploy\n      ActionTypeId:\n        Category: Deploy\n        Provider: ECS\n      Configuration:\n        ClusterName: prod\n        ServiceName: api\n        FileName: imagedefinitions.json', explanation: 'Automated deploy — core Operational Excellence practice.' },
      { language: 'yaml', label: 'CloudWatch alarm on error rate', code: 'Api5xxAlarm:\n  Type: AWS::CloudWatch::Alarm\n  Properties:\n    MetricName: HTTPCode_Target_5XX_Count\n    Threshold: 10\n    EvaluationPeriods: 2\n    AlarmActions:\n      - !Ref PagerDutyTopic', explanation: 'SLO-driven paging before customer flood.' },
      { language: 'bash', label: 'SSM runbook execution', code: 'aws ssm start-automation-execution \\\n  --document-name RestartUnhealthyTargets \\\n  --parameters ServiceName=api,ClusterName=prod', explanation: 'Runbooks as code — repeatable incident response.' },
      { language: 'json', label: 'EventBridge rule for pipeline failure', code: '{\n  "source": ["aws.codepipeline"],\n  "detail-type": ["CodePipeline Pipeline Execution State Change"],\n  "detail": { "state": ["FAILED"] }\n}', explanation: 'Notify team on failed deploy — close the ops feedback loop.' }
    ],
    compare: [['Deploy','Blue/green ECS via CodeDeploy','GitHub Actions to npm publish'],['Observability','CloudWatch + X-Ray','OpenTelemetry in Node'],['Incidents','SSM Automation runbooks','Playbooks in Notion']],
    mistakes: 'Manual console changes not in IaC. Alarms with no runbook link. Postmortems without tracked action items.',
    senior: 'How to prove it in production: deployment frequency and MTTR dashboards; percentage of infra under IaC; alarm coverage ratio (alarms with runbooks / total critical metrics).',
    seniorRows: [['GitOps (CDK Pipelines)','Drift detection','Learning curve'],['Feature flags + canary','Safe rollback','Flag debt'],['Centralized logging','Faster triage','Cost at scale']],
    reject: 'Saying "we have CloudWatch" without SLOs, runbooks, or rollback — rejected. Strong answer: automated deploy, observable SLOs, learned postmortems.',
    takeaways: ['Operational Excellence = automate ops, observe, small reversible changes, learn from failure.','Manual console changes violate ops-as-code principle.','Wire alarms to runbooks and track postmortem actions in Jira.','60s: IaC, CI/CD, observability, runbooks, postmortems. Measure deploy frequency and MTTR. Game Days prove readiness.','Follow-up: how do you roll back a bad ECS deployment?'],
    pitfalls: ['No rollback plan — rejected when interviewer asks about failed deploy.','Strong answer: blue/green or rolling with health checks and automatic rollback.','Alarms without ownership or runbooks.','Skipping postmortem action item tracking.'],
    related: ['well-architected-overview','pillar-reliability','pillar-security'],
    jsTs: [{ language: 'javascript', concept: 'Health check endpoints', note: 'Express /health must match ALB target group checks — ops pillar needs real probes.', futureTopicSlug: 'javascript/cloud/observability' },{ language: 'typescript', concept: 'Structured logging', note: 'pino/winston JSON logs feed CloudWatch Logs Insights queries in incidents.', futureTopicSlug: 'typescript/cloud/observability' }],
    sources: [WA, { title: 'Operational Excellence pillar', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/operational-excellence.html' }],
    anim: 'timeline', tag: 'step-functions-saga'
  }),
  topic({
    prefix: p16, moduleId: m16, slug: 'pillar-security', order: 3,
    title: 'Security pillar (protect data and systems)',
    hook: 'The Security pillar implements defense in depth: strong identity, least-privilege permissions, encryption everywhere, and continuous detection of misconfigurations and threats.',
    whatIs: 'Principles: implement strong identity foundation, apply security at all layers, automate security best practices, protect data in transit and at rest, keep people away from data, and prepare for security events. AWS services: IAM, Organizations SCPs, KMS, Secrets Manager, Security Hub, GuardDuty, Config, WAF.',
    why: 'Every architecture review starts with "who can access what?" and "what happens if credentials leak?" Security pillar HRIs — public S3 buckets, overly broad IAM, unencrypted databases — are instant interview red flags.',
    frame: 'Say: identity foundation, least privilege, encryption, detective controls, incident response.',
    terms: [['SCP','Service Control Policy','Org-wide permission guardrail on accounts','Deny unencrypted S3 uploads'],['KMS','AWS Key Management Service','Managed encryption keys','RDS encrypted with CMK'],['GuardDuty','Amazon GuardDuty','Threat detection from VPC Flow Logs and DNS','Credential exfiltration finding'],['Least privilege','Least-privilege access','Minimum permissions required for task','Lambda role read one secret only']],
    steps: [
      { title: 'Identity foundation', body: 'IAM Identity Center SSO, no long-lived root keys, MFA everywhere.' },
      { title: 'Protect data', body: 'Encrypt at rest (KMS) and in transit (TLS). Classify sensitive data.' },
      { title: 'Detective controls', body: 'Config rules, Security Hub standards, GuardDuty findings.' },
      { title: 'Respond to events', body: 'Runbooks for credential rotation, isolation, forensic snapshot.' }
    ],
    diagTitle: 'Defense in depth', diag: 'flowchart TB\n  ID[Identity SSO/MFA] --> NET[Network SG/NACL/WAF]\n  NET --> DATA[Encryption KMS]\n  DATA --> DET[GuardDuty Config]\n  DET --> IR[Incident response]',
    snippets: [
      { language: 'json', label: 'SCP deny public S3', code: '{\n  "Effect": "Deny",\n  "Action": "s3:PutObjectAcl",\n  "Resource": "*",\n  "Condition": {\n    "StringEquals": { "s3:x-amz-acl": ["public-read","public-read-write"] }\n  }\n}', explanation: 'Org guardrail prevents accidental public object ACLs.' },
      { language: 'yaml', label: 'RDS encryption', code: 'DbInstance:\n  Type: AWS::RDS::DBInstance\n  Properties:\n    StorageEncrypted: true\n    KmsKeyId: !Ref DbKey', explanation: 'Encrypt at rest — Security pillar baseline for data stores.' },
      { language: 'bash', label: 'Enable GuardDuty', code: 'aws guardduty create-detector --enable\naws guardduty list-findings --detector-id <id> --finding-criteria \'{"criterion":{"severity":{"gte":7}}}\'', explanation: 'Detective control for threat findings.' },
      { language: 'bash', label: 'IAM access analyzer', code: 'aws accessanalyzer create-analyzer \\\n  --analyzer-name org-analyzer \\\n  --type ORGANIZATION', explanation: 'Find resources shared externally — common HRI source.' }
    ],
    compare: [['Auth','IAM roles + SSO','JWT middleware in Express'],['Encryption','KMS at rest + TLS in transit','bcrypt passwords + HTTPS'],['Detection','GuardDuty + Config','Dependabot + SAST in CI']],
    mistakes: 'Long-lived IAM user access keys in application code. Security groups open to 0.0.0.0/0 on app ports. Ignoring GuardDuty findings as "noise".',
    senior: 'How to prove it in production: Security Hub compliance score trend; mean time to remediate Config non-compliance; secrets rotation age; zero public S3 buckets via automated scans.',
    seniorRows: [['SCP guardrails','Prevent entire classes of mistakes','Can block legit emergency fixes'],['ABAC with tags','Fine-grained access','Tag hygiene required'],['PrivateLink only','No internet data path','Higher complexity']],
    reject: 'Saying "security groups are enough" — rejected. Strong answer: identity + network + data encryption + detective controls + IR.',
    takeaways: ['Security = strong identity, least privilege, encryption, detection, incident response.','Public buckets and broad IAM are top HRIs.','Automate Config rules and Security Hub dashboards for continuous compliance.','60s: SSO/MFA, encrypt data, SCP guardrails, GuardDuty/Config detect issues, runbooks for IR. Defense in depth not one control.','Follow-up: how do SCPs differ from IAM policies?'],
    pitfalls: ['IAM users with access keys in repos — instant rejection.','Strong answer: roles, SSO, Secrets Manager, rotation, no static keys.','Relying only on perimeter SG without data encryption.','Ignoring external access findings from IAM Access Analyzer.'],
    related: ['well-architected-overview','pillar-operational-excellence','pillar-reliability'],
    jsTs: [{ language: 'javascript', concept: 'OIDC to AWS', note: 'GitHub Actions OIDC replaces long-lived AWS keys — Security pillar best practice.', futureTopicSlug: 'javascript/cloud/iam' },{ language: 'typescript', concept: 'Secrets in env', note: 'Never commit secrets; use Secrets Manager SDK with IAM role — same principle as dotenv in dev only.', futureTopicSlug: 'typescript/cloud/security' }],
    sources: [WA, { title: 'Security pillar', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/security.html' }],
    anim: 'network-flow', tag: 'auth-token'
  }),
  topic({
    prefix: p16, moduleId: m16, slug: 'pillar-reliability', order: 4,
    title: 'Reliability pillar (recover from failure)',
    hook: 'Reliability means a workload performs its intended function correctly and consistently — including when components fail. Design for failure across Availability Zones (AZs), regions, and dependencies.',
    whatIs: 'Principles: automatically recover from failure, test recovery procedures, scale horizontally, stop guessing capacity, manage change through automation, and anticipate failure. Patterns: Multi-AZ RDS, Auto Scaling groups, health checks, backups with tested restore, chaos engineering, and defined Recovery Time Objective (RTO) / Recovery Point Objective (RPO).',
    why: 'Interviewers ask "what happens when an AZ goes down?" and "have you tested backup restore?" Reliability HRIs — single-AZ databases, no auto scaling, untested DR — fail enterprise due diligence.',
    frame: 'Say: design for failure, Multi-AZ, auto scaling, backup/restore tested, defined RTO/RPO.',
    terms: [['RTO','Recovery Time Objective','Max acceptable downtime after failure','4 hours for billing API'],['RPO','Recovery Point Objective','Max acceptable data loss window','15 minutes of transactions'],['Multi-AZ','Multi-Availability Zone','Resources span isolated AZs within a region','RDS Multi-AZ synchronous standby'],['Chaos','Chaos engineering','Inject failures to validate resilience','Terminate random ECS task in Game Day']],
    steps: [
      { title: 'Eliminate single points of failure', body: 'Multi-AZ for data and compute; no one NAT gateway for all egress if critical.' },
      { title: 'Auto scale and health check', body: 'Replace unhealthy targets; scale on demand metrics.' },
      { title: 'Backup and restore', body: 'Automated backups; quarterly restore drill with documented RTO.' },
      { title: 'Plan for region failure', body: 'Active-passive or active-active multi-region if RTO requires it.' }
    ],
    diagTitle: 'Failure domains', diag: 'flowchart TB\n  REG[Region] --> AZ1[AZ-a app]\n  REG --> AZ2[AZ-b app]\n  AZ1 --> RDS[(Multi-AZ RDS)]\n  AZ2 --> RDS',
    snippets: [
      { language: 'yaml', label: 'Multi-AZ RDS', code: 'Database:\n  Type: AWS::RDS::DBInstance\n  Properties:\n    MultiAZ: true\n    BackupRetentionPeriod: 14\n    DeletionProtection: true', explanation: 'Automatic failover to standby AZ on primary failure.' },
      { language: 'yaml', label: 'ASG across AZs', code: 'AutoScalingGroup:\n  Properties:\n    MinSize: 2\n    MaxSize: 10\n    VPCZoneIdentifier:\n      - !Ref Az1Subnet\n      - !Ref Az2Subnet\n    HealthCheckType: ELB', explanation: 'Horizontal scale across AZs with ELB health checks.' },
      { language: 'bash', label: 'Restore test', code: 'aws rds restore-db-instance-from-db-snapshot \\\n  --db-instance-identifier restore-drill-$(date +%Y%m%d) \\\n  --db-snapshot-identifier prod-snapshot-latest', explanation: 'Prove RTO — untested backups are wishful thinking.' },
      { language: 'yaml', label: 'Route53 failover', code: 'PrimaryRecord:\n  Type: AWS::Route53::RecordSet\n  Properties:\n    Failover: PRIMARY\n    HealthCheckId: !Ref PrimaryHealthCheck\n    SetIdentifier: primary', explanation: 'DNS-level failover for multi-region active-passive.' }
    ],
    compare: [['HA','Multi-AZ ASG + RDS','PM2 cluster on one VM — weaker'],['DR','Route53 failover + snapshot restore','Database replica in another DC'],['Testing','Game Day AZ failure','Integration tests only']],
    mistakes: 'Single-AZ production database. Backups enabled but never restored. One NAT Gateway for all private subnets — AZ failure blocks egress.',
    senior: 'How to prove it in production: last successful restore drill date; AZ failure Game Day results; SLO burn rate alerts; chaos experiment pass rate.',
    seniorRows: [['Multi-AZ everything','High availability','2x cost for some services'],['Active-active multi-region','Lowest RTO','Data consistency complexity'],['Single-region + good backups','Simpler','Region outage exceeds RTO']],
    reject: 'Saying "we are in the cloud so it is reliable" — rejected. Strong answer: explicit failure modes, Multi-AZ, tested restore, defined RTO/RPO.',
    takeaways: ['Reliability = perform correctly under failure; design for AZ/region/dependency loss.','Untested backups are not backups — schedule restore drills.','Multi-AZ RDS fails over automatically; apps must handle DNS/cache staleness.','60s: Multi-AZ, auto scaling, health checks, backup with tested restore, RTO/RPO. Chaos Game Days prove it. Cloud does not auto-heal bad design.','Follow-up: RTO 15 min — active-active or failover?'],
    pitfalls: ['Single-AZ prod DB — classic HRI and interview fail.','Strong answer: Multi-AZ, ASG, tested restore, defined RTO/RPO with tradeoff cost.','One NAT GW for all AZs — AZ outage kills egress.','No health checks on custom app port.'],
    related: ['well-architected-overview','pillar-operational-excellence','pillar-performance'],
    jsTs: [{ language: 'javascript', concept: 'Retry with backoff', note: 'aws-sdk v3 retry strategy handles transient failures — app must still handle throttling.', futureTopicSlug: 'javascript/cloud/resilience' },{ language: 'typescript', concept: 'Circuit breaker', note: 'opossum or similar pattern for dependency failure — Reliability at app layer.', futureTopicSlug: 'typescript/cloud/resilience' }],
    sources: [WA, { title: 'Reliability pillar', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/reliability.html' }],
    anim: 'region-map', tag: 'lambda-vpc'
  }),
  topic({
    prefix: p16, moduleId: m16, slug: 'pillar-performance', order: 5,
    title: 'Performance Efficiency pillar (use resources well)',
    hook: 'Performance Efficiency means using computing resources efficiently and scaling to meet demand without over-provisioning. Right-size services, use managed offerings, and measure before optimizing.',
    whatIs: 'Principles: democratize advanced technologies (managed services), go global in minutes, use serverless where fit, experiment often, and consider mechanical sympathy. Trade compute types (EC2, Fargate, Lambda), storage (EBS vs instance store vs S3), databases (RDS vs DynamoDB vs Aurora), caching (ElastiCache, CloudFront), and network paths.',
    why: 'Interviewers ask why DynamoDB over RDS, or when Lambda beats ECS. Performance pillar is about matching architecture to access patterns — not maximum raw speed.',
    frame: 'Say: measure first, right-size, managed services, cache, global edge, match data store to access pattern.',
    terms: [['Right-sizing','Resource right-sizing','Match instance/capacity to actual load','t3.medium not r6g.2xlarge for idle API'],['Serverless','Serverless compute','Lambda scales per invocation — no server management','Event-driven thumbnail job'],['Cache','Caching layer','Store hot data closer to consumers','ElastiCache Redis for session store'],['CDN','Content Delivery Network','Edge cache for static and dynamic content','CloudFront for API GET caching']],
    steps: [
      { title: 'Measure baseline', body: 'CloudWatch metrics, X-Ray traces, load tests define p50/p99 latency.' },
      { title: 'Select service type', body: 'Match compute and data store to access pattern and burst profile.' },
      { title: 'Add caching and CDN', body: 'Reduce origin load; tune TTL and cache keys.' },
      { title: 'Review and experiment', body: 'Load test after changes; remove over-provisioned resources.' }
    ],
    diagTitle: 'Performance layers', diag: 'flowchart LR\n  CF[CloudFront CDN] --> ALB[ALB]\n  ALB --> APP[ECS/Lambda]\n  APP --> CACHE[ElastiCache]\n  APP --> DB[(DynamoDB/RDS)]',
    snippets: [
      { language: 'bash', label: 'Compute Optimizer recommendation', code: 'aws compute-optimizer get-ec2-instance-recommendations \\\n  --account-ids 123456789012', explanation: 'Data-driven right-sizing — Performance pillar practice.' },
      { language: 'yaml', label: 'DynamoDB on-demand', code: 'OrdersTable:\n  Type: AWS::DynamoDB::Table\n  Properties:\n    BillingMode: PAY_PER_REQUEST\n    AttributeDefinitions:\n      - AttributeName: pk\n        AttributeType: S\n    KeySchema:\n      - AttributeName: pk\n        KeyType: HASH', explanation: 'Scale throughput automatically for spiky SaaS workloads.' },
      { language: 'yaml', label: 'CloudFront cache policy', code: 'CachePolicy:\n  Type: AWS::CloudFront::CachePolicy\n  Properties:\n    CachePolicyConfig:\n      DefaultTTL: 300\n      MinTTL: 0\n      MaxTTL: 3600\n      ParametersInCacheKeyAndForwardedToOrigin:\n        QueryStringsConfig:\n          QueryStringBehavior: all', explanation: 'Edge caching reduces origin latency and load.' },
      { language: 'bash', label: 'X-Ray trace summary', code: 'aws xray get-trace-summaries \\\n  --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) \\\n  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \\\n  --filter-expression \'service("api") {fault = true}\'', explanation: 'Find slow/faulty segments before guessing optimizations.' }
    ],
    compare: [['Scale','Lambda per request','Node cluster manual scale'],['Data','DynamoDB partition key design','MongoDB single collection'],['Cache','CloudFront + Redis','in-memory Node cache — not shared']],
    mistakes: 'Oversized instances "for headroom" without metrics. Wrong database for access pattern (relational for key-value hot path). Caching without cache invalidation strategy.',
    senior: 'How to prove it in production: p99 latency SLO dashboards; cache hit ratio; Compute Optimizer savings applied; load test results before/after architecture change.',
    seniorRows: [['Lambda for spiky','Zero idle cost','Cold start at p99'],['Aurora Serverless v2','DB scales with load','Cost at sustained high TPS'],['Global Accelerator','Lower global latency','Added monthly cost']],
    reject: 'Optimizing code before measuring — rejected. Strong answer: baseline metrics, bottleneck identification, right service selection, then tune.',
    takeaways: ['Performance Efficiency = right resource types, scale to demand, measure before optimize.','Managed services and serverless reduce undifferentiated ops.','Cache and CDN are first-class — not afterthoughts.','60s: Measure p99, match compute/DB to pattern, cache at edge and app, right-size with Compute Optimizer. Mechanical sympathy for data stores.','Follow-up: when does Lambda cold start break your SLO?'],
    pitfalls: ['Premature optimization without metrics — rejected.','Strong answer: X-Ray/latency baseline, bottleneck, then architectural fix.','r6g.2xlarge for 5% CPU average.','Relational DB for pure key-value hot path without joins.'],
    related: ['pillar-reliability','pillar-cost','well-architected-overview'],
    jsTs: [{ language: 'javascript', concept: 'Connection pooling', note: 'pg pool in Node prevents RDS connection exhaustion — performance at app layer.', futureTopicSlug: 'javascript/cloud/databases' },{ language: 'typescript', concept: 'Lazy loading', note: 'Dynamic import() reduces Lambda bundle cold start — performance tradeoff.', futureTopicSlug: 'typescript/cloud/serverless' }],
    sources: [WA, { title: 'Performance Efficiency pillar', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/performance-efficiency.html' }],
    anim: 'request-path', tag: 'redis-cache'
  }),
  topic({
    prefix: p16, moduleId: m16, slug: 'pillar-cost', order: 6,
    title: 'Cost Optimization pillar (avoid unnecessary spend)',
    hook: 'Cost Optimization means delivering business value at the lowest price point — not cheapest at the expense of reliability. Continuously monitor, attribute, and eliminate waste while rightsizing for actual demand.',
    whatIs: 'Principles: implement cloud financial management, adopt consumption models, measure overall efficiency, stop spending on undifferentiated heavy lifting, and analyze and attribute expenditure. Tools: Cost Explorer, Budgets, CUR (Cost and Usage Report), Savings Plans, Reserved Instances, S3 Intelligent-Tiering, Graviton instances.',
    why: 'FinOps is a senior interview theme: "how do you know which team spent what?" and "how do you reduce NAT Gateway data processing charges?" Cost pillar conflicts with Reliability — articulate the tradeoff.',
    frame: 'Say: tag everything, budgets/alarms, right-size, Savings Plans/RI, eliminate waste, unit economics.',
    terms: [['CUR','Cost and Usage Report','Detailed billing line items for analysis','Athena query on S3 CUR parquet'],['Savings Plan','Compute Savings Plan','Commitment discount for compute usage','1-year compute SP for steady ECS'],['Showback','Cost showback','Allocate spend to teams via tags','cost-center tag on every resource'],['Unit economics','Cost per unit','Cost divided by business metric','$ per 1000 API requests']],
    steps: [
      { title: 'Tag and allocate', body: 'Mandatory tags: environment, cost-center, workload. SCP enforce tag-on-create.' },
      { title: 'Monitor and budget', body: 'AWS Budgets with alerts at 80/100% forecast.' },
      { title: 'Right-size and purchase', body: 'Compute Optimizer + Savings Plans for steady baseline.' },
      { title: 'Eliminate waste', body: 'Idle EIPs, unattached EBS, old snapshots, over-provisioned NAT.' }
    ],
    diagTitle: 'FinOps loop', diag: 'flowchart LR\n  TAG[Tag resources] --> MON[Cost Explorer]\n  MON --> BUD[Budgets alarm]\n  BUD --> ACT[Right-size / SP]\n  ACT --> TAG',
    snippets: [
      { language: 'bash', label: 'Cost Explorer by tag', code: 'aws ce get-cost-and-usage \\\n  --time-period Start=2026-01-01,End=2026-02-01 \\\n  --granularity MONTHLY \\\n  --metrics UnblendedCost \\\n  --group-by Type=TAG,Key=cost-center', explanation: 'Showback per team — foundation of cost governance.' },
      { language: 'yaml', label: 'Budget alert', code: 'MonthlyBudget:\n  Type: AWS::Budgets::Budget\n  Properties:\n    Budget:\n      BudgetName: prod-monthly\n      BudgetLimit:\n        Amount: 50000\n        Unit: USD\n      TimeUnit: MONTHLY\n    NotificationsWithSubscribers:\n      - Notification:\n          Threshold: 80\n          ComparisonOperator: GREATER_THAN\n        Subscribers:\n          - SubscriptionType: EMAIL\n            Address: finops@example.com', explanation: 'Proactive alert before invoice surprise.' },
      { language: 'bash', label: 'Find idle EIPs', code: 'aws ec2 describe-addresses --query "Addresses[?AssociationId==null].[PublicIp,AllocationId]"', explanation: 'Common waste — charged while unattached.' },
      { language: 'sql', label: 'Athena CUR — top NAT cost', code: 'SELECT line_item_resource_id, SUM(line_item_unblended_cost) AS cost\nFROM cur_db.cur_table\nWHERE product_product_name = \'Amazon VPC\'\n  AND line_item_usage_type LIKE \'%NatGateway%\'\nGROUP BY 1 ORDER BY 2 DESC LIMIT 10;', explanation: 'NAT data processing often surprises — query CUR for proof.' }
    ],
    compare: [['Billing','Cost Explorer + tags','Stripe usage metering'],['Commitment','Savings Plans','Annual cloud contract'],['Waste','Trusted Advisor idle resources','Dependabot unused deps']],
    mistakes: 'No tagging — cannot allocate spend. Buying 3-year RIs for experimental workloads. Ignoring data transfer and NAT Gateway costs.',
    senior: 'How to prove it in production: unit cost dashboard ($/request); month-over-month waste reduction; Savings Plan coverage %; budget forecast accuracy.',
    seniorRows: [['Graviton migration','~20% compute savings','Arm compatibility testing'],['Spot for batch','Large discount','Interruption handling'],['Single NAT GW','Lower NAT hourly cost','AZ reliability risk — conflicts Reliability']],
    reject: 'Saying "serverless is always cheaper" — rejected. Strong answer: match pricing model to traffic pattern; measure unit economics.',
    takeaways: ['Cost Optimization = visibility, allocation, right-size, commitment discounts, eliminate waste.','Tagging is prerequisite — untagged spend is ungovernable.','NAT Gateway and data transfer are silent cost drivers.','60s: Tag, Budgets, Cost Explorer, CUR/Athena, right-size, Savings Plans for steady load, eliminate idle resources. Unit economics over raw bill.','Follow-up: Cost vs Reliability — when is single NAT OK?'],
    pitfalls: ['No tags on prod resources — cannot answer "who spent this?"','Strong answer: mandatory tags, SCP enforcement, showback dashboards.','3-year RI for spiky experimental service.','Ignoring cross-AZ data transfer charges.'],
    related: ['pillar-performance','pillar-sustainability','well-architected-overview'],
    jsTs: [{ language: 'javascript', concept: 'Lambda memory tuning', note: 'More Lambda memory = more CPU and cost — tune with Power Tuning tool, not max memory.', futureTopicSlug: 'javascript/cloud/serverless' },{ language: 'typescript', concept: 'Bundle size', note: 'Smaller esbuild bundles reduce Lambda GB-seconds — cost and performance link.', futureTopicSlug: 'typescript/cloud/serverless' }],
    sources: [WA, { title: 'Cost Optimization pillar', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-optimization.html' }],
    anim: 'compare', tag: 'high-concurrency'
  }),
  topic({
    prefix: p16, moduleId: m16, slug: 'pillar-sustainability', order: 7,
    title: 'Sustainability pillar (minimize environmental impact)',
    hook: 'The Sustainability pillar asks you to minimize the environmental impact of running cloud workloads — understand your footprint, maximize utilization, and choose efficient architectures and regions.',
    whatIs: 'Principles: understand impact, establish sustainability goals, maximize utilization, anticipate and adopt efficient offerings, reduce downstream impact, and measure. Practices: right-size, Graviton (ARM) instances, serverless for variable load, S3 lifecycle to colder tiers, delete unused resources, and consider carbon footprint of regions (Customer Carbon Footprint Tool).',
    why: 'Enterprise RFPs increasingly ask for carbon reporting. Sustainability overlaps Cost and Performance — efficient architecture is often cheaper. Interviewers test whether you know it is the sixth pillar, not an afterthought.',
    frame: 'Say: maximize utilization, efficient instance types, serverless, lifecycle policies, measure with Carbon Footprint Tool.',
    terms: [['Carbon footprint','Workload carbon footprint','Estimated emissions from cloud usage','Customer Carbon Footprint Tool report'],['Graviton','AWS Graviton processor','ARM-based efficient instances','m7g vs m5 same vCPU, lower power'],['Utilization','Resource utilization','Percentage of provisioned capacity actually used','40% avg CPU — right-size opportunity'],['Lifecycle','S3 lifecycle policy','Transition objects to colder storage tiers','Standard to Glacier after 90 days']],
    steps: [
      { title: 'Measure footprint', body: 'Customer Carbon Footprint Tool; correlate with Cost Explorer.' },
      { title: 'Maximize utilization', body: 'Right-size, auto scale in, schedule dev environment shutdown.' },
      { title: 'Choose efficient services', body: 'Graviton, serverless, managed services over idle VMs.' },
      { title: 'Reduce data waste', body: 'Lifecycle policies, compress logs, delete unused snapshots.' }
    ],
    diagTitle: 'Sustainability levers', diag: 'flowchart TB\n  MEAS[Carbon Footprint Tool] --> UTIL[Right-size / scale in]\n  UTIL --> EFF[Graviton / serverless]\n  EFF --> DATA[S3 lifecycle / log retention]',
    snippets: [
      { language: 'bash', label: 'Carbon footprint report', code: 'aws bcm-data-exports create-export \\\n  --export DataExportName=carbon-footprint \\\n  --data-query \'{"QueryStatement":"SELECT * FROM carbon_footprint"}\'', explanation: 'Measure before claiming sustainability improvements.' },
      { language: 'yaml', label: 'S3 lifecycle to IA', code: 'LifecycleConfiguration:\n  Rules:\n    - Id: transition-logs\n      Status: Enabled\n      Prefix: logs/\n      Transitions:\n        - StorageClass: STANDARD_IA\n          TransitionInDays: 30\n        - StorageClass: GLACIER\n          TransitionInDays: 90', explanation: 'Colder tiers reduce storage energy footprint and cost.' },
      { language: 'yaml', label: 'Graviton ECS task', code: 'TaskDefinition:\n  Properties:\n    Cpu: 512\n    Memory: 1024\n    RuntimePlatform:\n      CpuArchitecture: ARM64\n    ContainerDefinitions:\n      - Name: api\n        Image: myapi:arm64', explanation: 'Graviton delivers better performance per watt for many workloads.' },
      { language: 'bash', label: 'Schedule dev shutdown', code: 'aws autoscaling update-auto-scaling-group \\\n  --auto-scaling-group-name dev-workers \\\n  --min-size 0 --desired-capacity 0', explanation: 'Zero utilization overnight — sustainability and cost win.' }
    ],
    compare: [['Efficiency','Graviton + right-size','Smaller Docker images less transfer'],['Idle waste','Scale to zero Lambda','Dev servers left running 24/7'],['Reporting','Carbon Footprint Tool','No cloud carbon equivalent in typical Node hosting']],
    mistakes: 'Oversized instances running 24/7 at 10% CPU. Never expiring logs in S3. Ignoring Sustainability pillar entirely in WAFR.',
    senior: 'How to prove it in production: carbon report trend quarter-over-quarter; Graviton adoption %; average CPU utilization; S3 storage class distribution.',
    seniorRows: [['Graviton fleet-wide','Lower power per request','Migration testing'],['Aggressive scale-in','Less idle capacity','Cold start / slower dev UX'],['Shorter log retention','Less storage energy','Shorter forensic window']],
    reject: 'Saying sustainability does not apply to cloud — rejected. Strong answer: maximize utilization, efficient hardware, lifecycle, measure footprint.',
    takeaways: ['Sustainability = minimize environmental impact via utilization and efficient architecture.','Often aligns with Cost and Performance — not separate effort.','Graviton, serverless, lifecycle policies are primary levers.','60s: Measure with Carbon Footprint Tool. Right-size, Graviton, serverless, S3 lifecycle, delete waste. Sixth pillar — enterprise customers ask.','Follow-up: how does region choice affect carbon footprint?'],
    pitfalls: ['Ignoring sixth pillar — looks uninformed in enterprise interviews.','Strong answer: utilization, Graviton, lifecycle, measurement tool.','24/7 oversized dev clusters.','Infinite log retention without business need.'],
    related: ['pillar-cost','pillar-performance','well-architected-overview'],
    jsTs: [{ language: 'javascript', concept: 'Efficient algorithms', note: 'O(n) vs O(n²) in Node reduces CPU — sustainability at code layer.', futureTopicSlug: 'javascript/performance' },{ language: 'typescript', concept: 'Tree-shaking', note: 'esbuild tree-shake reduces bundle and Lambda execution time — less compute waste.', futureTopicSlug: 'typescript/build/bundlers' }],
    sources: [WA, { title: 'Sustainability pillar', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/sustainability.html' }],
    anim: 'compare', tag: 'datasync-migration'
  })
];

topics16.forEach(t => writeTopic('16-well-architected', t));

writeJson('16-well-architected', 'mindmap.json', {
  moduleId: m16,
  title: 'Well-Architected — concept map',
  intro: 'The AWS Well-Architected Framework evaluates workloads across six pillars. Use review questions to find High-Risk Issues before launch and re-review after major changes. Each pillar exposes tradeoffs senior interviewers expect you to defend with metrics.',
  overviewDiagram: { type: 'mermaid', title: 'Six pillars', source: 'flowchart TB\n  WA[Well-Architected Framework]\n  WA --> OPS[Operational Excellence]\n  WA --> SEC[Security]\n  WA --> REL[Reliability]\n  WA --> PERF[Performance Efficiency]\n  WA --> COST[Cost Optimization]\n  WA --> SUS[Sustainability]' },
  conceptCards: [
    { id: 'c-overview', title: 'Overview', summary: 'Six pillars, WAFR workflow, HRIs, lenses.', example: 'Quarterly review before major launch', topicSlug: 'well-architected-overview' },
    { id: 'c-ops', title: 'Operational Excellence', summary: 'IaC, CI/CD, observability, runbooks, postmortems.', example: 'Alarm linked to SSM runbook', topicSlug: 'pillar-operational-excellence' },
    { id: 'c-sec', title: 'Security', summary: 'Identity, encryption, detective controls, IR.', example: 'SCP deny public S3 ACLs', topicSlug: 'pillar-security' },
    { id: 'c-rel', title: 'Reliability', summary: 'Multi-AZ, auto scale, backup/restore, RTO/RPO.', example: 'Quarterly RDS restore drill', topicSlug: 'pillar-reliability' },
    { id: 'c-perf', title: 'Performance', summary: 'Right-size, managed services, cache, CDN.', example: 'DynamoDB on-demand for spikes', topicSlug: 'pillar-performance' },
    { id: 'c-cost', title: 'Cost', summary: 'Tags, budgets, Savings Plans, waste elimination.', example: 'CUR Athena NAT cost query', topicSlug: 'pillar-cost' },
    { id: 'c-sus', title: 'Sustainability', summary: 'Utilization, Graviton, lifecycle, carbon tool.', example: 'S3 transition to Glacier', topicSlug: 'pillar-sustainability' }
  ],
  revisionDiagram: { type: 'mermaid', title: 'Pillar revision map', source: 'mindmap\n  root((Well-Architected))\n    Overview\n      Six pillars\n      WAFR HRIs\n      Lenses SaaS\n    Operational Excellence\n      IaC CI/CD\n      SLO alarms\n      Runbooks\n    Security\n      SSO MFA\n      KMS encrypt\n      GuardDuty Config\n    Reliability\n      Multi-AZ\n      ASG health\n      Restore drills\n    Performance\n      Right-size\n      Cache CDN\n      Match data store\n    Cost\n      Tags budgets\n      Savings Plans\n      CUR Athena\n    Sustainability\n      Graviton\n      Lifecycle\n      Carbon tool' }
});

writeJson('16-well-architected', 'quick-overview.json', {
  moduleId: m16, title: 'Well-Architected in one screen',
  rememberThis: [
    'Six pillars: Ops, Security, Reliability, Performance, Cost, Sustainability.',
    'Well-Architected Tool tracks workloads and High-Risk Issues — not a one-time checklist.',
    'Pillars conflict — document tradeoffs (Cost vs Reliability multi-AZ).',
    'Prove controls: Config rules, alarm coverage, restore drill dates.',
    'Lenses (SaaS, Serverless) add domain questions on core pillars.'
  ],
  bullets: [
    'WAFR quarterly or before major releases.',
    'HRIs map to sprint epics with owners.',
    'Security: no long-lived keys, encrypt, GuardDuty.',
    'Reliability: tested backup restore beats theoretical Multi-AZ.',
    'Cost: tag everything; NAT and data transfer surprise bills.'
  ],
  rows: [
    { label: 'Operational Excellence', value: 'IaC, observe, small changes, learn' },
    { label: 'Security', value: 'Identity, encrypt, detect, respond' },
    { label: 'Reliability', value: 'Multi-AZ, scale, RTO/RPO, test restore' },
    { label: 'Performance', value: 'Measure, right-size, cache, match store' },
    { label: 'Cost', value: 'Tag, budget, SP/RI, eliminate waste' },
    { label: 'Sustainability', value: 'Utilize, Graviton, lifecycle, measure' }
  ]
});

writeJson('16-well-architected', 'interview.json', {
  moduleId: m16, title: 'Well-Architected interview drills',
  items: [
    { question: 'Your VP asks for a Well-Architected review before launching a payments API. Walk the process.', answer: 'Define workload boundary (accounts, regions, dependencies). Run pillar questionnaires in Well-Architected Tool. Flag HRIs — likely single-AZ DB, missing WAF, no backup restore test, untagged resources. Prioritize by business risk. Remediate with owners. Create milestone. Re-review quarterly. Map HRIs to Config rules and alarm coverage for continuous proof.', followUps: ['Which pillar conflicts most for a cost-sensitive startup?', 'How do SaaS Lens questions differ?'], sixtySeconds: 'Scope workload, answer six pillars, list HRIs, remediate, milestone, re-review. Evidence beats checkbox yes. Lenses add domain context.' },
    { question: 'Security pillar HRI: IAM users with access keys in application repos. Fix and prevent.', answer: 'Rotate and delete user keys. Move apps to IAM roles (ECS task role, Lambda execution role). Enforce SSO for humans via IAM Identity Center. SCP deny iam:CreateAccessKey for non-break-glass roles. Config rule alerts on new access keys. Secrets Manager for any third-party API keys.', followUps: ['SCP vs IAM policy boundary?', 'Break-glass access pattern?'], sixtySeconds: 'Roles not keys. SSO humans. SCP prevent key creation. Config detect. Secrets Manager for app secrets.' },
    { question: 'Reliability: AZ failure during peak. What should already be in place?', answer: 'Multi-AZ RDS with automatic failover. ASG across 2+ AZs behind ALB with health checks. NAT per AZ or accept egress risk document. Cached data TTL handles brief DNS staleness. Tested restore drill proves RPO. Runbook for failover verification. Game Day should have simulated this.', followUps: ['One NAT vs NAT per AZ cost tradeoff?', 'Active-active multi-region when?'], sixtySeconds: 'Multi-AZ data and compute, ASG, health checks, NAT strategy documented, tested restore, Game Day proof.' },
    { question: 'FinOps lead says bill up 40% with flat traffic. First Cost pillar investigation?', answer: 'Cost Explorer grouped by service and tag — find which service spiked. CUR/Athena for NAT Gateway data processing, cross-AZ transfer, idle EIPs, unattached EBS. Check new environments without shutdown schedule. Compute Optimizer for oversized instances. Verify Savings Plan coverage dropped after architecture change.', followUps: ['Unit economics metric you would track?', 'When are Savings Plans wrong?'], sixtySeconds: 'Cost Explorer by service/tag, CUR for NAT/transfer waste, right-size, check commitments, eliminate idle resources.' },
    { question: 'Performance pillar: p99 latency SLO breached on read-heavy API. Ordered steps?', answer: 'X-Ray traces identify slow segment — DB, downstream, or cold start. Check RDS CPU/connections vs DynamoDB throttling. Add ElastiCache for hot keys. CloudFront cache GET if cacheable. Right-size if CPU bound. Load test after each change. Do not add r6g.2xlarge without metrics.', followUps: ['When DynamoDB over Aurora?', 'Cache invalidation strategy?'], sixtySeconds: 'Measure X-Ray, find bottleneck, cache edge/app, right-size, match data store, load test verify.' },
    { question: 'How do Operational Excellence and Reliability pillars overlap in incident response?', answer: 'Ops Excellence: runbooks, automated rollback, observability, postmortem process. Reliability: system survives failure, RTO/RPO met. Together: alarm fires (ops), runbook executes failover (reliability), postmortem adds automation (ops) and architecture fix (reliability). Blameless postmortem with tracked actions satisfies both.', followUps: ['SLO vs SLA difference?', 'Error budget policy?'], sixtySeconds: 'Ops = how you run and learn. Reliability = survives failure. Alarms, runbooks, failover, postmortem close both loops.' },
    { question: 'Enterprise customer asks for sustainability reporting. What AWS tools and practices?', answer: 'Customer Carbon Footprint Tool for quarterly report. Practices: Graviton migration, right-size low-utilization instances, serverless for variable load, S3 lifecycle to IA/Glacier, delete unused snapshots, schedule dev shutdown. Correlate with Cost Explorer — efficient often equals cheaper.', followUps: ['Graviton migration risks?', 'Region carbon difference?'], sixtySeconds: 'Carbon Footprint Tool measure. Graviton, right-size, serverless, lifecycle, delete waste. Sixth pillar — overlaps cost.' },
    { question: 'Two pillars conflict: CFO wants single NAT Gateway; SRE wants NAT per AZ. Decide.', answer: 'Document tradeoff in WAFR: Cost pillar saves ~$32/mo per NAT avoided; Reliability pillar risks AZ failure blocking all private egress. For payments prod with strict RTO, NAT per AZ. For dev or non-critical batch, single NAT acceptable with documented residual risk and HRI if prod.', followUps: ['Other common pillar conflicts?', 'How to record accepted risk?'], sixtySeconds: 'Pillars conflict by design. Document decision, residual risk, cost vs RTO. Prod critical → NAT per AZ. Dev → single NAT OK with HRI noted.' },
    { question: 'What is a Well-Architected lens and when use SaaS lens?', answer: 'Lens overlays domain questions on six pillars. SaaS Lens adds tenant isolation, noisy neighbor, tiering, onboarding/offboarding. Use when building multi-tenant product. Serverless Lens for Lambda-heavy. Core pillars still apply — lens deepens relevant areas.', followUps: ['Bridge vs silo tenancy?', 'Control plane vs data plane?'], sixtySeconds: 'Lens = domain questions on pillars. SaaS Lens for multi-tenant. Still six pillars underneath.' }
  ]
});

console.log('Module 16 done');

// Module 17
const m17 = 'aws-17-cloud-foundation';
const p17 = 'aws-17';

const topics17 = [
  topic({
    prefix: p17, moduleId: m17, slug: 'landing-zone-concept', order: 1,
    title: 'Landing zone concept (multi-account foundation)',
    hook: 'A landing zone is a pre-configured multi-account AWS environment with security, networking, and governance baselines. New workloads deploy into accounts carved from this foundation instead of ad-hoc single accounts.',
    whatIs: 'Landing zones provide organization structure (management, security, shared services, workload accounts), baseline networking (hub VPC, IPAM), identity federation, logging aggregation, and guardrails (Service Control Policies). AWS Control Tower automates landing zone setup; custom landing zones use Organizations + CloudFormation StackSets.',
    why: 'Enterprise migrations fail without account strategy. Interviewers ask how you onboard a new team without compromising security. Landing zones are the answer — repeatable, governed account factory.',
    frame: 'Say: multi-account OU structure, baseline guardrails, shared services, account vending — not one giant account.',
    terms: [['Landing zone','AWS landing zone','Multi-account foundation with baselines','Control Tower setup with 4 OUs'],['OU','Organizational Unit','Container for accounts in AWS Organizations','Workloads OU vs Security OU'],['Management account','Organizations management account','Billing root — limited workload deployment','Pays consolidated bill'],['Shared services','Shared services account','Central DNS, logging, networking hub','Transit Gateway owner account']],
    steps: [
      { title: 'Design OU hierarchy', body: 'Security, Infrastructure, Workloads (dev/stage/prod), Sandbox, Suspended.' },
      { title: 'Apply baseline guardrails', body: 'SCPs, Config rules, mandatory tags via Control Tower or custom.' },
      { title: 'Deploy shared networking', body: 'Hub VPC, Transit Gateway, IPAM pool for spoke CIDR allocation.' },
      { title: 'Vend workload accounts', body: 'Account Factory creates account with baseline stacks applied automatically.' }
    ],
    diagTitle: 'Landing zone OUs', diag: 'flowchart TB\n  ROOT[Management] --> SEC[Security OU]\n  ROOT --> INFRA[Infrastructure OU]\n  ROOT --> WL[Workloads OU]\n  WL --> DEV[Dev accounts]\n  WL --> PROD[Prod accounts]',
    snippets: [
      { language: 'bash', label: 'Create OU', code: 'aws organizations create-organizational-unit \\\n  --parent-id r-xxxx \\\n  --name Workloads-Production', explanation: 'OU structure is foundation of landing zone governance.' },
      { language: 'bash', label: 'Control Tower enable', code: 'aws controltower enable-baseline \\\n  --baseline-identifier AWSControlTowerBaseline \\\n  --target-identifier arn:aws:organizations::123:ou/o-abc/ou-xyz', explanation: 'Applies guardrails and logging baseline to OU.' },
      { language: 'yaml', label: 'StackSet baseline logging', code: 'LogArchiveStackSet:\n  Type: AWS::CloudFormation::StackSet\n  Properties:\n    StackSetName: org-cloudtrail\n    PermissionModel: SERVICE_MANAGED\n    AutoDeployment:\n      Enabled: true\n      RetainStacksOnAccountRemoval: false', explanation: 'Auto-deploy CloudTrail config to new accounts.' },
      { language: 'bash', label: 'List enrolled accounts', code: 'aws controltower list-enabled-controls \\\n  --target-identifier arn:aws:organizations::123:account/456', explanation: 'Verify baseline controls on vendored account.' }
    ],
    compare: [['Structure','Multi-account OU landing zone','Monorepo with env folders'],['Governance','SCPs + Control Tower','ESLint + CODEOWNERS'],['Onboarding','Account Factory','New repo from template']],
    mistakes: 'Running production workloads in management account. No OU separation for sandbox vs prod. Skipping centralized logging account.',
    senior: 'How to prove it in production: every new account enrolled in Control Tower within 24h; SCP coverage on all OUs; zero workloads in management account audit.',
    seniorRows: [['Control Tower','Fast standard LZ','Less customization'],['Custom LZ (CFN)','Full control','You own maintenance'],['Account per env','Strong blast radius','More accounts to manage']],
    reject: 'Single account for everything "because it is simpler" — rejected at enterprise scale. Strong answer: OU structure, guardrails, shared services, account vending.',
    takeaways: ['Landing zone = governed multi-account foundation with baselines.','Management account for billing/governance only — not workloads.','Control Tower or custom StackSets automate repeatable setup.','60s: OUs for Security/Infrastructure/Workloads. SCP guardrails. Hub networking. Account Factory vends governed accounts. Not one shared prod account.','Follow-up: how does landing zone relate to Well-Architected Security pillar?'],
    pitfalls: ['Prod in management account — major governance fail.','Strong answer: OU hierarchy, SCPs, centralized logging, account vending.','No sandbox OU — developers experiment in prod account.','Skipping IPAM — CIDR collisions across spokes.'],
    related: ['account-vending-guardrails','network-foundation-hub-spoke','identity-foundation-sso'],
    jsTs: [{ language: 'javascript', concept: 'Monorepo vs multi-repo', note: 'Landing zone multi-account mirrors multi-repo team boundaries — isolation by default.', futureTopicSlug: 'javascript/cloud/organizations' },{ language: 'typescript', concept: 'Workspace packages', note: 'npm workspaces separate packages like OUs separate accounts.', futureTopicSlug: 'typescript/tooling/monorepo' }],
    sources: [CF, { title: 'AWS Control Tower', url: 'https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html' }],
    anim: 'region-map', tag: 'lambda-vpc'
  }),
  topic({
    prefix: p17, moduleId: m17, slug: 'account-vending-guardrails', order: 2,
    title: 'Account vending and guardrails (SCPs and policies)',
    hook: 'Account vending automatically creates new AWS accounts with baseline security and networking applied. Guardrails — especially Service Control Policies (SCPs) — set maximum permissions for entire organizational units.',
    whatIs: 'Account Factory (Control Tower) or custom Step Functions workflow creates accounts, assigns to OU, and triggers StackSets for logging, Config, IAM baseline. SCPs are organization policies attached to OUs/accounts that filter IAM permissions — they do not grant access, only deny. Preventive guardrails block actions; detective guardrails (Config) detect drift.',
    why: 'Interviewers ask "how do you stop a developer from opening S3 to the world org-wide?" SCP deny on public buckets. Account vending ensures every account starts compliant, not retrofitted.',
    frame: 'Say: SCPs are permission guardrails on OUs; vending automates compliant account creation.',
    terms: [['SCP','Service Control Policy','Org policy filtering max permissions','Deny leaving region us-east-1'],['Account Factory','Control Tower Account Factory','Self-service governed account creation','New team clicks provision account'],['Preventive','Preventive guardrail','Blocks non-compliant API calls','SCP deny root login'],['Detective','Detective guardrail','Detects non-compliance after fact','Config rule on encryption']],
    steps: [
      { title: 'Define SCP policies', body: 'Deny risky actions: unapproved regions, disable CloudTrail, public S3 ACLs.' },
      { title: 'Attach to OUs', body: 'Sandbox gets stricter limits than Production OU.' },
      { title: 'Vend account', body: 'Account Factory creates account, applies baseline stacks.' },
      { title: 'Validate enrollment', body: 'Control Tower dashboard shows control status per account.' }
    ],
    diagTitle: 'SCP evaluation', diag: 'flowchart LR\n  API[API call] --> SCP[SCP allow?]\n  SCP -->|deny| BLOCK[Blocked]\n  SCP -->|allow| IAM[IAM policy]\n  IAM --> EXEC[Execute]',
    snippets: [
      { language: 'json', label: 'SCP deny unapproved regions', code: '{\n  "Effect": "Deny",\n  "Action": "*",\n  "Resource": "*",\n  "Condition": {\n    "StringNotEquals": {\n      "aws:RequestedRegion": ["us-east-1","eu-west-1"]\n    }\n  }\n}', explanation: 'Data residency guardrail — common enterprise SCP.' },
      { language: 'json', label: 'SCP protect CloudTrail', code: '{\n  "Effect": "Deny",\n  "Action": ["cloudtrail:StopLogging","cloudtrail:DeleteTrail"],\n  "Resource": "*"\n}', explanation: 'Preventive guardrail — audit trail cannot be disabled.' },
      { language: 'bash', label: 'Create SCP and attach', code: 'aws organizations create-policy \\\n  --name DenyPublicS3 --type SERVICE_CONTROL_POLICY \\\n  --content file://deny-public-s3.json\naws organizations attach-policy \\\n  --policy-id p-abc --target-id ou-xyz', explanation: 'Attach SCP to OU — applies to all accounts underneath.' },
      { language: 'bash', label: 'Provision Account Factory account', code: 'aws servicecatalog provision-product \\\n  --product-id prod-abc \\\n  --provisioning-artifact-id pa-xyz \\\n  --provisioned-product-name team-payments-dev', explanation: 'Self-service account vending with baseline stacks.' }
    ],
    compare: [['Guardrail','SCP org-wide deny','npm audit block in CI'],['Vending','Account Factory','terraform workspace per team'],['Drift','Config detective rules','lint-staged pre-commit']],
    mistakes: 'SCP that blocks Control Tower management actions — breaks landing zone. SCP thinking it grants permissions. No break-glass exception process.',
    senior: 'How to prove it in production: SCP simulator tests before attach; 100% account enrollment in Control Tower; Config compliance % per OU; time-to-vend new account < 1 hour.',
    seniorRows: [['Strict SCPs','Strong security posture','Can block emergency fixes'],['Loose SCPs + Config','Flexibility','Relies on remediation speed'],['Break-glass OU','Emergency access','Must monitor heavily']],
    reject: 'Confusing SCP with IAM policy — rejected. Strong answer: SCP filters max permissions; IAM grants within that boundary.',
    takeaways: ['SCPs set permission ceiling for OUs — deny only, never grant.','Account vending applies baselines at creation — not retrofit.','Preventive (SCP) + detective (Config) guardrails complement each other.','60s: SCP on OU denies risky APIs org-wide. Account Factory vends compliant accounts. Test SCPs in simulator. Break-glass OU for emergencies.','Follow-up: what happens when SCP and IAM both allow an action?'],
    pitfalls: ['SCP grants permissions — wrong; SCP only denies/filters.','Strong answer: IAM grants within SCP ceiling; explicit deny in SCP wins.','SCP blocks Control Tower — landing zone breaks.','No break-glass process for SCP-blocked emergencies.'],
    related: ['landing-zone-concept','identity-foundation-sso','centralized-logging-baseline'],
    jsTs: [{ language: 'javascript', concept: 'Policy as code', note: 'SCP JSON mirrors OPA/authorization middleware — deny rules at org boundary.', futureTopicSlug: 'javascript/cloud/iam' },{ language: 'typescript', concept: 'Type-level constraints', note: 'SCP ceiling like TypeScript strict mode — limits what code can do at compile boundary.', futureTopicSlug: 'typescript/fundamentals/types' }],
    sources: [CF, { title: 'Service control policies', url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html' }],
    anim: 'flow', tag: 'auth-token'
  }),
  topic({
    prefix: p17, moduleId: m17, slug: 'network-foundation-hub-spoke', order: 3,
    title: 'Network foundation (hub-and-spoke topology)',
    hook: 'Hub-and-spoke networking centralizes shared connectivity in a hub Virtual Private Cloud (VPC) while workload accounts attach as spokes via AWS Transit Gateway (TGW) or VPC peering. IP Address Management (IPAM) prevents CIDR collisions.',
    whatIs: 'Hub VPC hosts shared services: egress NAT, firewall appliances (GWLB), DNS resolver endpoints, and TGW attachments. Spoke VPCs in workload accounts connect to hub for hybrid connectivity (Direct Connect, VPN) and inter-spoke routing. AWS Network Firewall or third-party NGFW often sits in inspection VPC. IPAM pools allocate non-overlapping CIDR blocks per account.',
    why: 'Interviewers draw hub-spoke on whiteboards for enterprise AWS. Wrong CIDR planning blocks peering. Centralized egress simplifies allow-listing but creates chokepoint — know the tradeoff.',
    frame: 'Say: hub VPC + TGW, spokes per account/env, IPAM for CIDR, centralized egress with inspection option.',
    terms: [['TGW','Transit Gateway','Regional hub connecting VPCs and VPN/DX','Spoke VPC attachments'],['Hub VPC','Network hub VPC','Central connectivity and shared services','Egress and firewall VPC'],['IPAM','VPC IP Address Manager','Central CIDR pool allocation','/16 per workload account'],['Inspection VPC','Traffic inspection VPC','NGFW or Network Firewall inline','GWLB endpoint in hub']],
    steps: [
      { title: 'Plan IPAM pools', body: 'Top-level pool; allocate /16 or /20 per account from pool.' },
      { title: 'Deploy hub VPC', body: 'TGW, NAT, optional Network Firewall, Route53 resolver rules.' },
      { title: 'Attach spokes', body: 'Workload VPC TGW attachment; propagate routes via TGW route tables.' },
      { title: 'Segment routing', body: 'Separate TGW route tables for prod vs dev isolation.' }
    ],
    diagTitle: 'Hub and spoke', diag: 'flowchart TB\n  DX[Direct Connect] --> HUB[Hub VPC / TGW]\n  HUB --> S1[Spoke dev VPC]\n  HUB --> S2[Spoke prod VPC]\n  HUB --> FW[Inspection VPC]',
    snippets: [
      { language: 'bash', label: 'Create IPAM pool', code: 'aws ec2 create-ipam-pool \\\n  --ipam-id ipam-abc \\\n  --address-family ipv4 \\\n  --locale us-east-1 \\\n  --allocation-min-netmask-length 16', explanation: 'Central pool prevents overlapping spoke CIDRs.' },
      { language: 'bash', label: 'TGW attachment', code: 'aws ec2 create-transit-gateway-vpc-attachment \\\n  --transit-gateway-id tgw-abc \\\n  --vpc-id vpc-spoke \\\n  --subnet-ids subnet-a subnet-b', explanation: 'Connect spoke VPC to hub transit.' },
      { language: 'yaml', label: 'TGW route table association', code: 'SpokeRoute:\n  Type: AWS::EC2::TransitGatewayRoute\n  Properties:\n    TransitGatewayRouteTableId: !Ref ProdRouteTable\n    DestinationCidrBlock: 10.20.0.0/16\n    TransitGatewayAttachmentId: !Ref SpokeAttachment', explanation: 'Route propagation controls which spokes talk to which.' },
      { language: 'bash', label: 'Reachability Analyzer', code: 'aws ec2 create-network-insights-path \\\n  --source vpc-spoke \\\n  --destination vpc-hub \\\n  --protocol TCP \\\n  --destination-port 443', explanation: 'Prove hub-spoke path before go-live.' }
    ],
    compare: [['Topology','Hub-spoke TGW','Flat VPC peering mesh — scales poorly'],['IPAM','Central CIDR pools','Manual spreadsheet CIDR tracking'],['Egress','Centralized NAT in hub','NAT per spoke VPC']],
    mistakes: 'Overlapping CIDRs block peering/TGW routes. Full mesh VPC peering at 20+ VPCs. Single TGW route table for prod and dev.',
    senior: 'How to prove it in production: IPAM utilization dashboard; TGW route table segmentation audit; Reachability Analyzer paths documented per connection.',
    seniorRows: [['Centralized egress','Single allow-list point','Hub becomes SPOF'],['Distributed NAT','AZ-local egress','Higher cost, better resilience'],['Network Firewall inline','Deep inspection','Latency and cost add']],
    reject: 'VPC peering mesh for 30 accounts — rejected. Strong answer: TGW hub-spoke, IPAM, segmented route tables.',
    takeaways: ['Hub-spoke: central TGW hub, spokes per account/VPC, IPAM for CIDR.','Overlapping CIDRs are fatal — plan with IPAM upfront.','Segment TGW route tables for prod/dev isolation.','60s: Hub VPC with TGW, spokes attach, IPAM allocates CIDRs, optional inspection VPC. Avoid peering mesh at scale.','Follow-up: centralized vs distributed NAT tradeoff?'],
    pitfalls: ['CIDR overlap discovered after account vending — expensive fix.','Strong answer: IPAM first, then hub-spoke TGW, segmented routes.','VPC peering full mesh at enterprise scale.','Prod and dev on same TGW route table.'],
    related: ['landing-zone-concept','account-vending-guardrails','centralized-logging-baseline'],
    jsTs: [{ language: 'javascript', concept: 'API gateway pattern', note: 'Hub VPC like API gateway for network — central entry for hybrid and shared services.', futureTopicSlug: 'javascript/cloud/networking' },{ language: 'typescript', concept: 'Module boundaries', note: 'Spoke accounts like TS project references — explicit interfaces (TGW routes) between them.', futureTopicSlug: 'typescript/architecture/modules' }],
    sources: [CF, { title: 'Building a scalable network architecture', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/migration-aws-environment/networking.html' }],
    anim: 'network-flow', tag: 'vpc-troubleshoot'
  }),
  topic({
    prefix: p17, moduleId: m17, slug: 'identity-foundation-sso', order: 4,
    title: 'Identity foundation (IAM Identity Center SSO)',
    hook: 'IAM Identity Center (formerly AWS Single Sign-On) is the enterprise identity hub. Users authenticate once via your corporate IdP and receive short-lived credentials to access multiple AWS accounts with permission sets.',
    whatIs: 'Identity Center integrates with Okta, Azure AD, or other SAML/OIDC IdPs. Permission sets are IAM role templates assigned per account. Users see an access portal listing accounts they can enter. No long-lived IAM users. Cross-account roles are assumed via Identity Center — central audit of who accessed what account.',
    why: 'Landing zones fail without identity foundation. Interviewers ask how 500 engineers access 50 accounts without 500×50 IAM users. Answer: SSO permission sets with least privilege per OU.',
    frame: 'Say: corporate IdP → Identity Center → permission sets → account roles. No IAM users.',
    terms: [['Identity Center','IAM Identity Center','AWS SSO service for multi-account access','Okta SAML federation'],['Permission set','SSO permission set','IAM role template for account access','ReadOnly vs PowerUser per OU'],['IdP','Identity Provider','Corporate directory — Okta, Azure AD','SAML assertion to AWS'],['Access portal','AWS access portal','User UI to pick account and role','User clicks Prod → AdminAccess']],
    steps: [
      { title: 'Configure IdP federation', body: 'SAML 2.0 or OIDC trust between corporate IdP and Identity Center.' },
      { title: 'Create permission sets', body: 'Map job roles: Developer, ReadOnly, SecurityAudit — least privilege.' },
      { title: 'Assign to accounts', body: 'Assign permission sets per account or OU via groups.' },
      { title: 'Audit access', body: 'CloudTrail logs sts:AssumeRoleWithSAML from Identity Center.' }
    ],
    diagTitle: 'SSO flow', diag: 'sequenceDiagram\n  User->>IdP: Login\n  IdP->>IdentityCenter: SAML assertion\n  User->>IdentityCenter: Pick account+role\n  IdentityCenter->>Account: AssumeRole short-lived creds',
    snippets: [
      { language: 'bash', label: 'Create permission set', code: 'aws sso-admin create-permission-set \\\n  --name DeveloperAccess \\\n  --session-duration PT8H', explanation: 'Template for developer role in workload accounts.' },
      { language: 'bash', label: 'Attach managed policy', code: 'aws sso-admin attach-managed-policy-to-permission-set \\\n  --permission-set-arn arn:aws:sso:::permissionSet/ps-abc \\\n  --managed-policy-arn arn:aws:iam::aws:policy/PowerUserAccess', explanation: 'Least privilege — prefer custom policy over PowerUser in prod.' },
      { language: 'bash', label: 'Assign to account', code: 'aws sso-admin create-account-assignment \\\n  --instance-arn arn:aws:sso:::instance/ssoins-abc \\\n  --permission-set-arn arn:aws:sso:::permissionSet/ps-abc \\\n  --principal-id group-dev \\\n  --principal-type GROUP \\\n  --target-id 123456789012 \\\n  --target-type AWS_ACCOUNT', explanation: 'Dev group gets DeveloperAccess in dev account only.' },
      { language: 'bash', label: 'CLI login via SSO', code: 'aws configure sso\naws sso login --profile prod-admin', explanation: 'Developers use short-lived creds — no access keys in ~/.aws/credentials.' }
    ],
    compare: [['Identity','Identity Center SSO','OAuth login to internal admin UI'],['Roles','Permission sets per account','RBAC middleware per route'],['Audit','CloudTrail AssumeRoleWithSAML','Auth logs in app DB']],
    mistakes: 'PowerUserAccess permission set on production accounts. IAM users alongside SSO — shadow access. No group-based assignment — manual per-user grants.',
    senior: 'How to prove it in production: zero IAM users with console access; permission set review quarterly; CloudTrail identity queries for break-glass usage only.',
    seniorRows: [['Group-based assignment','Scales to thousands','Group hygiene in IdP'],['ABAC permission sets','Fine-grained','Complex attribute rules'],['Separate IdP groups per OU','Clear blast radius','More groups to manage']],
    reject: 'IAM users with access keys for developers — rejected. Strong answer: Identity Center, permission sets, IdP groups, short-lived creds.',
    takeaways: ['Identity Center = corporate SSO to multi-account AWS access.','Permission sets are role templates — assign via IdP groups.','No long-lived IAM users for humans.','60s: IdP SAML to Identity Center, permission sets per role, assign groups to accounts, CloudTrail audit. Landing zone identity pillar.','Follow-up: how do CI/CD pipelines authenticate without IAM users?'],
    pitfalls: ['IAM user access keys for humans — rejected.','Strong answer: OIDC for CI, Identity Center for humans, roles everywhere.','PowerUser on prod accounts.','No periodic permission set review.'],
    related: ['landing-zone-concept','account-vending-guardrails','centralized-logging-baseline'],
    jsTs: [{ language: 'javascript', concept: 'OIDC for CI', note: 'GitHub Actions OIDC to AWS replaces IAM user keys — same federation principle as SSO.', futureTopicSlug: 'javascript/cloud/iam' },{ language: 'typescript', concept: 'Session tokens', note: 'SSO short-lived creds like JWT expiry — design apps for token refresh not static secrets.', futureTopicSlug: 'typescript/security/auth' }],
    sources: [CF, { title: 'IAM Identity Center', url: 'https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html' }],
    anim: 'flow', tag: 'auth-token'
  }),
  topic({
    prefix: p17, moduleId: m17, slug: 'centralized-logging-baseline', order: 5,
    title: 'Centralized logging baseline (audit and operations)',
    hook: 'Centralized logging aggregates CloudTrail, VPC Flow Logs, and application logs into a dedicated log-archive account. Security teams query one place; workload accounts cannot delete their audit trail.',
    whatIs: 'Landing zone baseline deploys organization CloudTrail to S3 in log-archive account with SSE-KMS. VPC Flow Logs, Config snapshots, and Security Hub findings replicate centrally. SCPs prevent member accounts from disabling CloudTrail. Amazon OpenSearch or Athena queries the archive. Lifecycle policies manage retention and cost.',
    why: 'Incident response without centralized logs is guesswork. Interviewers ask "how do you detect who deleted prod RDS?" Answer: org CloudTrail in immutable log-archive with SCP protection.',
    frame: 'Say: org CloudTrail to log-archive S3, SCP prevents disable, Flow Logs + Config centralized, Athena/OpenSearch query.',
    terms: [['CloudTrail','AWS CloudTrail','API audit log of account activity','Who deleted sg-abc at 3am'],['Log archive','Log archive account','Central security account for immutable logs','S3 bucket with Object Lock'],['Flow Logs','VPC Flow Logs','Network traffic metadata per ENI','REJECT on port 5432 from unknown IP'],['Object Lock','S3 Object Lock','WORM storage — logs cannot be deleted early','Compliance mode retention 7 years']],
    steps: [
      { title: 'Enable org CloudTrail', body: 'All regions, log file validation, KMS encryption, S3 in log-archive.' },
      { title: 'SCP protect logging', body: 'Deny cloudtrail:StopLogging and s3:DeleteObject on archive bucket.' },
      { title: 'Aggregate Flow Logs and Config', body: 'StackSet deploys to all accounts; central Kinesis Firehose optional.' },
      { title: 'Query and retain', body: 'Athena for ad-hoc; OpenSearch for SIEM; lifecycle to Glacier.' }
    ],
    diagTitle: 'Log aggregation', diag: 'flowchart LR\n  ACC1[Workload account] -->|CloudTrail| S3[Log archive S3]\n  ACC2[Workload account] -->|Flow Logs| S3\n  S3 --> ATH[Athena / OpenSearch]\n  SCP[SCP protect] -.-> S3',
    snippets: [
      { language: 'yaml', label: 'Org CloudTrail', code: 'OrgTrail:\n  Type: AWS::CloudTrail::Trail\n  Properties:\n    IsOrganizationTrail: true\n    IsMultiRegionTrail: true\n    EnableLogFileValidation: true\n    S3BucketName: org-cloudtrail-archive\n    KMSKeyId: !Ref TrailKey', explanation: 'Single trail for all org accounts — landing zone baseline.' },
      { language: 'json', label: 'SCP protect trail', code: '{\n  "Effect": "Deny",\n  "Action": ["cloudtrail:StopLogging","cloudtrail:DeleteTrail","s3:DeleteObject"],\n  "Resource": "*"\n}', explanation: 'Member accounts cannot disable audit or delete archive objects.' },
      { language: 'sql', label: 'Athena — who deleted ENI', code: 'SELECT eventtime, useridentity.arn, eventsource, eventname\nFROM cloudtrail_db.org_trail\nWHERE eventname = \'DeleteNetworkInterface\'\n  AND date = current_date\nORDER BY eventtime DESC;', explanation: 'Incident response query — proves centralized logging value.' },
      { language: 'yaml', label: 'S3 Object Lock', code: 'ArchiveBucket:\n  Type: AWS::S3::Bucket\n  Properties:\n    ObjectLockEnabled: true\n    LifecycleConfiguration:\n      Rules:\n        - Id: glacier-after-90d\n          Status: Enabled\n          Transitions:\n            - StorageClass: GLACIER\n              TransitionInDays: 90', explanation: 'Immutable retention for compliance; lifecycle controls cost.' }
    ],
    compare: [['Audit','Org CloudTrail central S3','App audit log table per service'],['Query','Athena SQL on parquet','ELK stack self-hosted'],['Protection','SCP + Object Lock','DB user cannot DELETE audit rows']],
    mistakes: 'CloudTrail only in management account, not org-wide. Logs in same account as workload — attacker deletes trail. No log file validation enabled.',
    senior: 'How to prove it in production: 100% accounts in org trail; SCP simulator confirms trail protection; mean time to answer "who did X" < 15 min via Athena.',
    seniorRows: [['Central S3 + Athena','Low cost query','Slower than OpenSearch SIEM'],['OpenSearch SIEM','Real-time detection','Higher ops cost'],['Kinesis Firehose streaming','Near real-time','Pipeline complexity']],
    reject: 'Per-account CloudTrail with no central aggregation — rejected. Strong answer: org trail, log-archive account, SCP, Object Lock.',
    takeaways: ['Org CloudTrail to log-archive S3 — baseline for all landing zones.','SCP prevents disabling trail or deleting archive.','Athena/OpenSearch for incident queries.','60s: Org trail all regions, central S3 with KMS and Object Lock, SCP protect, Flow Logs aggregate, Athena for IR.','Follow-up: how long retain CloudTrail for SOC2?'],
    pitfalls: ['Workload account owns its only CloudTrail — attacker deletes it.','Strong answer: org trail, immutable archive, SCP deny stop/delete.','No log file validation — tampering undetected.','Infinite retention without lifecycle — cost explosion.'],
    related: ['landing-zone-concept','account-vending-guardrails','identity-foundation-sso'],
    jsTs: [{ language: 'javascript', concept: 'Structured audit logs', note: 'pino JSON logs with userId/action mirror CloudTrail fields for app-layer audit.', futureTopicSlug: 'javascript/cloud/observability' },{ language: 'typescript', concept: 'Audit middleware', note: 'Express middleware logging mutations complements CloudTrail for app-level actions.', futureTopicSlug: 'typescript/cloud/observability' }],
    sources: [CF, { title: 'Logging and monitoring in landing zones', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/migration-aws-environment/logging-and-monitoring.html' }],
    anim: 'timeline', tag: 'vpc-troubleshoot'
  })
];

topics17.forEach(t => writeTopic('17-cloud-foundation', t));

writeJson('17-cloud-foundation', 'mindmap.json', {
  moduleId: m17, title: 'Cloud foundation — concept map',
  intro: 'Cloud foundations use landing zones to govern multi-account AWS estates. Account vending, SCP guardrails, hub-spoke networking, Identity Center SSO, and centralized logging form the enterprise baseline from AWS Cloud Foundation prescriptive guidance.',
  overviewDiagram: { type: 'mermaid', title: 'Foundation layers', source: 'flowchart TB\n  LZ[Landing Zone] --> OU[OU hierarchy]\n  LZ --> AV[Account vending]\n  LZ --> NET[Hub-spoke TGW]\n  LZ --> ID[Identity Center SSO]\n  LZ --> LOG[Centralized logging]' },
  conceptCards: [
    { id: 'c-lz', title: 'Landing zone', summary: 'Multi-account foundation with baselines.', example: 'Control Tower with Workloads OU', topicSlug: 'landing-zone-concept' },
    { id: 'c-guard', title: 'Guardrails', summary: 'SCPs + vending + Config detective.', example: 'SCP deny unapproved regions', topicSlug: 'account-vending-guardrails' },
    { id: 'c-net', title: 'Hub-spoke', summary: 'TGW hub, IPAM CIDR, inspection VPC.', example: 'Spoke prod VPC via TGW', topicSlug: 'network-foundation-hub-spoke' },
    { id: 'c-id', title: 'Identity SSO', summary: 'IdP federation, permission sets.', example: 'Okta group → dev account role', topicSlug: 'identity-foundation-sso' },
    { id: 'c-log', title: 'Central logging', summary: 'Org CloudTrail, log-archive, SCP.', example: 'Athena who-deleted query', topicSlug: 'centralized-logging-baseline' }
  ],
  revisionDiagram: { type: 'mermaid', title: 'Foundation revision map', source: 'mindmap\n  root((Cloud Foundation))\n    Landing zone\n      OU hierarchy\n      Management account\n      Shared services\n    Guardrails\n      SCP deny\n      Account Factory\n      Config detective\n    Networking\n      Hub spoke TGW\n      IPAM CIDR\n      Inspection VPC\n    Identity\n      Identity Center\n      Permission sets\n      IdP SAML\n    Logging\n      Org CloudTrail\n      Log archive\n      Object Lock SCP' }
});

writeJson('17-cloud-foundation', 'quick-overview.json', {
  moduleId: m17, title: 'Cloud foundation in one screen',
  rememberThis: [
    'Landing zone = governed multi-account AWS foundation.',
    'SCPs set permission ceiling — deny only, attach to OUs.',
    'Hub-spoke TGW + IPAM — never overlap CIDRs.',
    'Identity Center SSO — no IAM users for humans.',
    'Org CloudTrail to log-archive with SCP protection.'
  ],
  bullets: [
    'Control Tower automates standard landing zone.',
    'Account Factory vends compliant accounts in minutes.',
    'Segment TGW route tables for prod/dev.',
    'Permission sets assigned via IdP groups.',
    'Athena queries org CloudTrail for incident response.'
  ],
  rows: [
    { label: 'Landing zone', value: 'OU structure + baselines' },
    { label: 'Guardrails', value: 'SCPs + account vending' },
    { label: 'Network', value: 'Hub-spoke TGW + IPAM' },
    { label: 'Identity', value: 'Identity Center + permission sets' },
    { label: 'Logging', value: 'Org trail + log-archive' }
  ]
});

writeJson('17-cloud-foundation', 'interview.json', {
  moduleId: m17, title: 'Cloud foundation interview drills',
  items: [
    { question: 'Design a landing zone for 200 engineers and 40 workload accounts.', answer: 'OUs: Security (log-archive, audit), Infrastructure (shared networking, TGW hub), Workloads (dev/stage/prod sub-OUs), Sandbox. Control Tower or custom StackSets for baselines. Account Factory for vending. SCPs: deny unapproved regions, protect CloudTrail, deny public S3. IPAM allocates /20 per account. Identity Center with permission sets per OU. Org CloudTrail to log-archive.', followUps: ['Control Tower vs custom LZ?', 'How handle break-glass access?'], sixtySeconds: 'OUs, SCP guardrails, Account Factory, hub-spoke TGW, IPAM, Identity Center SSO, org CloudTrail central. No prod in management account.' },
    { question: 'Developer opened S3 bucket public in sandbox account. Org-wide prevention?', answer: 'SCP on Sandbox OU denying s3:PutBucketPublicAccessBlock removal and public ACLs. Config rule detecting public buckets with auto-remediation Lambda. S3 Block Public Access at account level via StackSet baseline. Detective + preventive layers. Sandbox SCP can be stricter than prod OU.', followUps: ['SCP vs S3 BPA account setting?', 'False positive on intentional static site?'], sixtySeconds: 'SCP deny public bucket APIs. Config detect + remediate. BPA account baseline via StackSet. Layer preventive and detective.' },
    { question: 'New team needs dev account with networking in 1 hour. Walk account vending.', answer: 'User requests via Service Catalog Account Factory product. Provisions account in Workloads-Dev OU. StackSets auto-deploy: CloudTrail config, Config rules, VPC with IPAM-allocated CIDR, TGW attachment to hub, baseline IAM roles. Identity Center assigns Developer permission set to team IdP group. Control Tower shows enrolled controls green.', followUps: ['StackSet vs Stack instances?', 'IPAM pool exhaustion?'], sixtySeconds: 'Account Factory → OU placement → StackSets baseline VPC/logging → TGW attach → Identity Center group assignment. Automated not manual console.' },
    { question: 'Hub-spoke: should all internet egress go through central NAT in hub?', answer: 'Tradeoff. Centralized: single egress IP for allow-listing, inspection via Network Firewall, simpler governance. Risk: hub SPOF, cross-AZ data charges, latency. Distributed NAT per spoke: better AZ resilience (Reliability pillar) but many IPs and harder egress filtering. Enterprise often centralizes for inspection; document Reliability HRI if single NAT.', followUps: ['Inspection VPC with GWLB?', 'TGW route table segmentation?'], sixtySeconds: 'Central NAT = governance and inspection, SPOF risk. Distributed = resilience, more cost/complexity. Document tradeoff in WAFR.' },
    { question: 'How do 500 engineers access AWS without 500 IAM users?', answer: 'Corporate IdP (Okta/Azure AD) federates to IAM Identity Center via SAML. IdP groups map to permission sets. Developer group gets custom developer policy in dev accounts only. ReadOnly for prod. Access portal shows allowed accounts. CLI via aws sso login. CloudTrail logs AssumeRoleWithSAML. CI/CD uses OIDC to IAM roles — not human SSO.', followUps: ['Permission set vs IAM role?', 'Session duration best practice?'], sixtySeconds: 'IdP → Identity Center → permission sets → account roles. Group-based. No IAM users. OIDC for pipelines.' },
    { question: 'Security team needs to know who terminated prod EC2 at 2am across 30 accounts.', answer: 'Query org CloudTrail in log-archive S3 via Athena: filter eventName TerminateInstances, eventTime range, sort by userIdentity.arn. Identity Center shows which human assumed which role. SCP ensured trail was not disabled. If logs missing, that account was not enrolled — landing zone gap.', followUps: ['CloudTrail vs CloudWatch Logs?', 'Object Lock compliance mode?'], sixtySeconds: 'Org CloudTrail central S3, Athena query by eventName/time, userIdentity.arn identifies actor. SCP prevents trail tampering.' },
    { question: 'SCP blocks team from deploying to eu-central-1 but product needs GDPR residency there.', answer: 'SCP is OU-scoped. Create EU-Workloads OU with SCP allowing only eu-central-1 (deny other regions). Move or vend account into that OU. Do not weaken global SCP — segment by residency requirement. IPAM pool for EU CIDRs. Document in landing zone standards.', followUps: ['SCP simulator before attach?', 'Multi-region SCP patterns?'], sixtySeconds: 'Residency-specific OU with tailored SCP. Do not remove global guardrail — add OU exception scoped to EU workloads.' },
    { question: 'What is difference between landing zone and Well-Architected Framework?', answer: 'Landing zone is organizational foundation — accounts, guardrails, networking, identity, logging. Well-Architected evaluates workload design within those accounts. Landing zone enables Security/Operational Excellence pillars at scale; WAFR reviews individual services inside vendored accounts.', followUps: ['Control Tower controls list?', 'Customizations for regulated industry?'], sixtySeconds: 'Landing zone = multi-account foundation and guardrails. Well-Architected = workload design review. Complementary — LZ enables pillar compliance at scale.' },
    { question: 'Detective vs preventive guardrail — give one example each.', answer: 'Preventive: SCP denies cloudtrail:StopLogging — action blocked before it happens. Detective: AWS Config rule flags unencrypted EBS volume — detected after creation, remediate via SSM or Lambda. Landing zones need both: SCP stops worst cases, Config catches drift and misconfig.', followUps: ['Config auto-remediation risks?', 'Security Hub aggregation?'], sixtySeconds: 'Preventive SCP blocks API. Detective Config detects non-compliance. Both required — SCP cannot catch everything.' }
  ]
});

console.log('Module 17 done');

// Module 18
const m18 = 'aws-18-saas-and-interview';
const p18 = 'aws-18';

const topics18 = [
  topic({
    prefix: p18, moduleId: m18, slug: 'tenancy-models-silo-pool-bridge', order: 1,
    title: 'Tenancy models (silo, pool, and bridge)',
    hook: 'SaaS tenancy models describe how you isolate customers. Silo dedicates resources per tenant; pool shares infrastructure with logical isolation; bridge mixes both — pooled compute with siloed data or premium tiers on dedicated stacks.',
    whatIs: 'Silo model: separate database, compute, or account per tenant — maximum isolation, highest cost. Pool model: shared application and database with tenant_id column partitioning — best economies of scale. Bridge model: pooled control plane with tiered data isolation — free tier pooled, enterprise silo. AWS SaaS Lens maps these to Well-Architected tradeoffs.',
    why: 'Top SaaS architecture interview question: "how do you isolate tenants?" Wrong answer ignores blast radius and cost. Right answer names model, tradeoffs, and migration path between tiers.',
    frame: 'Say: silo = dedicated, pool = shared with logical isolation, bridge = tiered mix.',
    terms: [['Silo','Silo tenancy','Dedicated resources per tenant','Enterprise customer own RDS instance'],['Pool','Pooled tenancy','Shared infra, logical isolation','tenant_id on every row'],['Bridge','Bridge tenancy','Mix pooled and silo by tier','Free pooled, premium silo DB'],['Tenant','SaaS tenant','Customer organization using your product','Acme Corp tenant_id=42']],
    steps: [
      { title: 'Classify tenant tiers', body: 'Free/starter → pool. Enterprise/regulated → silo or bridge.' },
      { title: 'Design isolation boundary', body: 'Network, compute, data — which layers silo vs pool.' },
      { title: 'Implement tenant context', body: 'Every request carries tenant_id; enforce in middleware and DB queries.' },
      { title: 'Plan tier migration', body: 'Path from pool to silo without data loss — export/import or logical replication.' }
    ],
    diagTitle: 'Tenancy models', diag: 'flowchart TB\n  POOL[Pooled tier\\nshared DB tenant_id] --> BRIDGE[Bridge tier\\npooled app silo DB]\n  BRIDGE --> SILO[Silo tier\\ndedicated stack per tenant]',
    snippets: [
      { language: 'typescript', label: 'Tenant context middleware', code: 'export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {\n  const tenantId = req.headers[\'x-tenant-id\'] as string;\n  if (!tenantId) return res.status(400).json({ error: \'Missing tenant\' });\n  req.tenantId = tenantId;\n  next();\n}', explanation: 'Every pooled request must resolve tenant context before data access.' },
      { language: 'sql', label: 'Pooled row-level isolation', code: 'CREATE TABLE orders (\n  tenant_id UUID NOT NULL,\n  order_id UUID NOT NULL,\n  amount DECIMAL,\n  PRIMARY KEY (tenant_id, order_id)\n);\nCREATE INDEX idx_orders_tenant ON orders(tenant_id);', explanation: 'Composite key ensures queries always scope by tenant.' },
      { language: 'yaml', label: 'Silo — dedicated stack per tenant', code: 'Resources:\n  TenantDb:\n    Type: AWS::RDS::DBInstance\n    Properties:\n      DBInstanceIdentifier: !Sub tenant-${TenantId}-db\n      DBInstanceClass: db.r6g.large', explanation: 'CloudFormation per-tenant stack for silo enterprise tier.' },
      { language: 'typescript', label: 'Repository always scopes tenant', code: 'async getOrders(tenantId: string): Promise<Order[]> {\n  return this.db.query(\n    \'SELECT * FROM orders WHERE tenant_id = $1\',\n    [tenantId]\n  );\n}', explanation: 'Missing tenant_id in query is cross-tenant data leak — top SaaS bug.' }
    ],
    compare: [['Isolation','Silo dedicated stack','Single DB with user_id column'],['Cost','Pool amortizes infra','Per-customer VM costly'],['Upgrade','Bridge tier migration path','Hard cutover from shared to dedicated']],
    mistakes: 'Pool model without tenant_id on every table and query. Silo for all customers on day one — burn rate kills startup. No migration path from pool to silo.',
    senior: 'How to prove it in production: integration tests that attempt cross-tenant access must fail; per-tier cost attribution; silo provisioning time SLA for enterprise onboarding.',
    seniorRows: [['Pool default','Lowest cost to start','Blast radius if bug'],['Silo enterprise','Compliance ready','Ops overhead per tenant'],['Bridge tiered','Revenue-aligned isolation','Complex routing logic']],
    reject: 'One model for all tiers without tradeoff discussion — rejected. Strong answer: pool for scale, silo for enterprise, bridge for tiered product.',
    takeaways: ['Silo = dedicated, pool = shared logical isolation, bridge = tiered mix.','Pool requires tenant_id on every query — no exceptions.','Bridge aligns isolation with pricing tiers.','60s: Pool for scale and cost. Silo for compliance and blast radius. Bridge tiers free pooled to enterprise silo. SaaS Lens framework.','Follow-up: how migrate tenant from pool to silo?'],
    pitfalls: ['Missing tenant_id filter — cross-tenant data leak, instant rejection.','Strong answer: middleware tenant context, composite keys, integration tests for isolation.','Silo everything day one — unsustainable burn.','No enterprise upgrade path documented.'],
    related: ['vpc-per-tenant-vs-pool','data-partitioning-strategies','saas-reference-architecture'],
    jsTs: [{ language: 'javascript', concept: 'Multi-tenant Express', note: 'Subdomain acme.app.com resolves tenant — same pattern as pooled SaaS routing.', futureTopicSlug: 'javascript/saas/multi-tenant' },{ language: 'typescript', concept: 'Branded types for tenantId', note: 'type TenantId = string & { __brand: \'TenantId\' } prevents passing wrong ID at compile time.', futureTopicSlug: 'typescript/saas/tenancy' }],
    sources: [SAAS, { title: 'SaaS architecture fundamentals', url: 'https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-architecture-fundamentals.html' }],
    anim: 'compare', tag: 'saas-tenant-routing'
  }),
  topic({
    prefix: p18, moduleId: m18, slug: 'vpc-per-tenant-vs-pool', order: 2,
    title: 'VPC per tenant versus pooled VPC',
    hook: 'Network isolation for SaaS ranges from one shared Virtual Private Cloud (VPC) with security group rules to a dedicated VPC (or AWS account) per tenant. The choice drives cost, compliance, and operational complexity.',
    whatIs: 'Pooled VPC: all tenants share VPC, subnets, and compute; isolation is application-layer (tenant_id) plus security groups. VPC-per-tenant: each enterprise customer gets dedicated VPC, often in their own account via account vending. Hybrid: pooled app tier, dedicated data VPC connected via PrivateLink. SaaS Lens recommends pool for most, silo VPC for regulated enterprise.',
    why: 'Healthcare and finance tenants demand network isolation proofs. Interviewers ask when VPC-per-tenant is worth 10x operational cost. Answer: compliance requirement or contractual isolation — not default.',
    frame: 'Say: pooled VPC default for scale; VPC-per-tenant or account-per-tenant for enterprise compliance.',
    terms: [['Pooled VPC','Shared VPC model','One VPC hosts all tenant workloads','ECS cluster multi-tenant'],['VPC per tenant','Dedicated VPC per tenant','Network boundary per customer','Enterprise Acme VPC 10.50.0.0/16'],['Account per tenant','Silo AWS account','Strongest isolation — separate account','Regulated tenant own account'],['PrivateLink','AWS PrivateLink','Private connectivity between VPCs/services','Silo DB VPC exposes endpoint']],
    steps: [
      { title: 'Assess compliance needs', body: 'SOC2 pooled OK; some contracts require network isolation.' },
      { title: 'Design pooled baseline', body: 'Shared VPC, namespace isolation, SG segmentation per service tier.' },
      { title: 'Provision silo VPC on demand', body: 'Step Functions + CloudFormation vend VPC/account for enterprise signup.' },
      { title: 'Connect via TGW or PrivateLink', body: 'Hub-spoke or PrivateLink endpoint for silo data access from pooled app.' }
    ],
    diagTitle: 'VPC isolation levels', diag: 'flowchart LR\n  POOL[Pooled VPC\\nall tenants] --> HYBRID[Hybrid\\npooled app]\n  HYBRID -->|PrivateLink| SILO[Silo VPC\\ntenant DB]',
    snippets: [
      { language: 'yaml', label: 'Pooled VPC baseline', code: 'SharedVpc:\n  Type: AWS::EC2::VPC\n  Properties:\n    CidrBlock: 10.0.0.0/16\n    Tags:\n      - Key: saas-model\n        Value: pooled', explanation: 'Single VPC for multi-tenant compute — default SaaS pattern.' },
      { language: 'yaml', label: 'Per-tenant VPC stack', code: 'TenantVpc:\n  Type: AWS::EC2::VPC\n  Properties:\n    CidrBlock: !Ref TenantCidr\n    Tags:\n      - Key: tenant-id\n        Value: !Ref TenantId', explanation: 'Vended on enterprise contract — IPAM allocates CIDR.' },
      { language: 'bash', label: 'PrivateLink endpoint connection', code: 'aws ec2 create-vpc-endpoint-connection-notification \\\n  --connection-notification-arn arn:aws:sns:us-east-1:123:notify \\\n  --service-id vpce-svc-tenantdb', explanation: 'Pooled app reaches silo tenant DB without public internet.' },
      { language: 'yaml', label: 'Step Functions vend tenant account', code: 'ProvisionTenant:\n  Type: AWS::StepFunctions::StateMachine\n  Properties:\n    Definition:\n      StartAt: CreateAccount\n      States:\n        CreateAccount:\n          Type: Task\n          Resource: arn:aws:states:::aws-sdk:organizations:createAccount\n          Next: DeployBaseline', explanation: 'Automate silo account + VPC provisioning on enterprise signup.' }
    ],
    compare: [['Network','Pooled VPC + app isolation','VPC per customer like Heroku private spaces'],['Ops','One VPC to patch','N VPCs to maintain'],['Compliance','App-layer isolation','Network boundary audit ready']],
    mistakes: 'VPC-per-tenant for 10k small customers — ops nightmare. Pooled VPC with no SG segmentation between services. CIDR overlap when vending tenant VPCs without IPAM.',
    senior: 'How to prove it in production: enterprise onboarding provisions silo VPC in < 4 hours automated; pooled tier has zero cross-tenant network paths in penetration test.',
    seniorRows: [['Pooled VPC','Lowest network ops cost','Weakest network isolation'],['Account per tenant','Strongest boundary','Highest ops per customer'],['Hybrid PrivateLink','Balance isolation and scale','Connection management complexity']],
    reject: 'VPC per tenant for all customers by default — rejected as cost-prohibitive. Strong answer: pooled default, silo for enterprise/regulatory, automated vending.',
    takeaways: ['Pooled VPC = shared network, app-layer tenant isolation.','VPC/account per tenant for enterprise compliance — automate provisioning.','Hybrid: pooled app + PrivateLink to silo data VPC.','60s: Default pooled VPC for scale. Enterprise gets vended VPC or account. IPAM for CIDR. PrivateLink connects hybrid. SaaS Lens guidance.','Follow-up: account-per-tenant vs VPC-per-tenant?'],
    pitfalls: ['VPC per tenant for everyone — unsustainable ops at scale.','Strong answer: tiered network isolation aligned to contract and compliance.','CIDR overlap without IPAM.','No automation for silo provisioning — manual 2-week onboarding.'],
    related: ['tenancy-models-silo-pool-bridge','tenant-routing-blast-radius','saas-reference-architecture'],
    jsTs: [{ language: 'javascript', concept: 'Shared hosting', note: 'Pooled VPC like shared Node process — isolation is logical unless separate instances.', futureTopicSlug: 'javascript/saas/hosting' },{ language: 'typescript', concept: 'Environment separation', note: 'Dedicated VPC like separate deployment env — stronger boundary than namespace alone.', futureTopicSlug: 'typescript/saas/deployment' }],
    sources: [SAAS, { title: 'Tenant isolation', url: 'https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/tenant-isolation.html' }],
    anim: 'network-flow', tag: 'saas-tenant-routing'
  }),
  topic({
    prefix: p18, moduleId: m18, slug: 'tenant-routing-blast-radius', order: 3,
    title: 'Tenant routing and blast radius',
    hook: 'Tenant routing directs each customer request to the correct isolated resources. Blast radius is how much damage one tenant failure or breach affects others — the core SaaS reliability and security interview topic.',
    whatIs: 'Routing layers: DNS (tenant.app.com), API Gateway custom domain + mapping, ALB host-header rules, CloudFront alternate domain names, or application middleware resolving tenant from JWT/subdomain. Blast radius containment: separate databases, rate limits per tenant, circuit breakers, and silo tiers for critical customers. SaaS Lens Reliability and Security pillars emphasize per-tenant failure isolation.',
    why: 'A bug that leaks Tenant A data to Tenant B ends careers. A noisy tenant crashing shared compute affects all customers. Interviewers want routing mechanism plus blast radius controls named explicitly.',
    frame: 'Say: route by subdomain/JWT/header; contain blast radius with per-tenant limits, silo tiers, and fault isolation.',
    terms: [['Blast radius','Failure blast radius','Scope of impact when one component fails','DB outage affects one tenant vs all'],['Tenant routing','Tenant request routing','Directing request to correct tenant context','acme.app.com → tenant 42'],['Noisy neighbor','Noisy neighbor problem','One tenant consumes disproportionate shared resources','Tenant floods API throttling others'],['Circuit breaker','Per-tenant circuit breaker','Stop calls to failing tenant dependency','Isolate bad tenant webhook endpoint']],
    steps: [
      { title: 'Resolve tenant identity', body: 'Subdomain, custom domain, JWT claim, or API key maps to tenant_id.' },
      { title: 'Route to correct stack', body: 'ALB rule, Lambda authorizer, or router service for silo vs pool tier.' },
      { title: 'Enforce per-tenant limits', body: 'API Gateway usage plan, WAF rate limit keyed on tenant, SQS per-tenant queues.' },
      { title: 'Contain failures', body: 'Bulkhead pattern: separate connection pools, timeouts, circuit breakers per tenant.' }
    ],
    diagTitle: 'Routing and blast radius', diag: 'flowchart TB\n  REQ[Request acme.app.com] --> RTR[Tenant router]\n  RTR --> POOL[Pooled tier]\n  RTR --> SILO[Silo tier]\n  POOL --> LIMIT[Per-tenant rate limit]\n  SILO --> ISO[Isolated resources]',
    snippets: [
      { language: 'yaml', label: 'ALB host-header routing', code: 'ListenerRule:\n  Properties:\n    Conditions:\n      - Field: host-header\n        Values: [\'acme.app.example.com\']\n    Actions:\n      - Type: forward\n        TargetGroupArn: !Ref AcmeSiloTargetGroup', explanation: 'Enterprise silo tenant gets dedicated target group.' },
      { language: 'typescript', label: 'JWT tenant claim resolution', code: 'function resolveTenant(auth: JwtPayload): string {\n  const tenantId = auth[\'custom:tenant_id\'];\n  if (!tenantId) throw new UnauthorizedError(\'Missing tenant claim\');\n  return tenantId;\n}', explanation: 'Cognito custom attribute or OIDC claim carries tenant identity.' },
      { language: 'yaml', label: 'API Gateway usage plan per tier', code: 'PremiumPlan:\n  Type: AWS::ApiGateway::UsagePlan\n  Properties:\n    UsagePlanName: premium-tier\n    Throttle:\n      RateLimit: 1000\n      BurstLimit: 2000\n    Quota:\n      Limit: 1000000\n      Period: MONTH', explanation: 'Different rate limits per SaaS tier — fairness control.' },
      { language: 'typescript', label: 'Per-tenant circuit breaker', code: 'const breakers = new Map<string, CircuitBreaker>();\n\nfunction getBreaker(tenantId: string) {\n  if (!breakers.has(tenantId)) {\n    breakers.set(tenantId, new CircuitBreaker(callWebhook, { timeout: 3000 }));\n  }\n  return breakers.get(tenantId)!;\n}', explanation: 'One tenant bad webhook does not trip breaker for all tenants.' }
    ],
    compare: [['Routing','Subdomain → tenant_id','Host header in Express router'],['Blast radius','Silo tier isolation','One bad npm dep crashes all tenants'],['Rate limit','Per-tenant API GW plan','express-rate-limit per API key']],
    mistakes: 'Tenant ID only in URL path — attacker changes path to access other tenant. Shared rate limit bucket for all tenants. No silo path for enterprise despite SLA.',
    senior: 'How to prove it in production: chaos test kills one tenant silo — others unaffected; pen test cross-tenant access fails; per-tenant p99 tracked separately.',
    seniorRows: [['Subdomain routing','Clear tenant identity','Wildcard cert management'],['JWT claim','Stateless routing','Token forgery if not validated'],['Silo on failure','Minimal blast radius','Higher cost for affected tier only']],
    reject: 'Tenant ID from client body without auth validation — rejected as insecure. Strong answer: signed JWT claim or verified subdomain mapping.',
    takeaways: ['Route tenants via subdomain, custom domain, or signed JWT claim.','Blast radius: silo tiers, per-tenant limits, circuit breakers, bulkheads.','Never trust client-supplied tenant_id without authentication.','60s: Resolve tenant from subdomain/JWT. Route pool vs silo. Per-tenant rate limits and circuit breakers. Chaos test proves isolation.','Follow-up: what if one tenant DDoSes your shared ALB?'],
    pitfalls: ['tenant_id from query string without auth — cross-tenant access vulnerability.','Strong answer: signed claim, middleware enforcement, integration tests.','Shared rate limit — one tenant blocks all.','No silo escalation path when enterprise signs.'],
    related: ['tenancy-models-silo-pool-bridge','noisy-neighbor-fairness','saas-reference-architecture'],
    jsTs: [{ language: 'javascript', concept: 'Subdomain routing', note: 'Express vhost or host header check mirrors ALB host-header tenant routing.', futureTopicSlug: 'javascript/saas/routing' },{ language: 'typescript', concept: 'Branded tenant context', note: 'AsyncLocalStorage for tenant context in Node — propagate without passing param everywhere.', futureTopicSlug: 'typescript/saas/context' }],
    sources: [SAAS, { title: 'Reliability pillar — SaaS Lens', url: 'https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/reliability.html' }],
    anim: 'request-path', tag: 'saas-tenant-routing'
  }),
  topic({
    prefix: p18, moduleId: m18, slug: 'data-partitioning-strategies', order: 4,
    title: 'Data partitioning strategies (row, schema, database)',
    hook: 'Data partitioning decides how tenant data coexists in storage. Row-level (shared tables), schema-per-tenant, or database-per-tenant each trade isolation, cost, and query complexity differently.',
    whatIs: 'Row-level pooling: one schema, tenant_id column on every table — simplest, highest leak risk if queries miss filter. Schema-per-tenant: separate PostgreSQL schema per tenant — better isolation, migration complexity. Database-per-tenant: separate RDS instance or DynamoDB table per tenant — silo model, enterprise tier. DynamoDB partition key design can embed tenant_id for natural isolation.',
    why: 'Interviewers ask "how do you prevent cross-tenant data leaks in a pooled database?" and "when move enterprise customer to dedicated DB?" Partitioning strategy is the answer.',
    frame: 'Say: row pool for scale, schema/db per tenant for isolation, DynamoDB tenant in partition key.',
    terms: [['Row-level','Row-level partitioning','tenant_id column filters all queries','WHERE tenant_id = $1'],['Schema-per-tenant','Schema per tenant','Separate PG schema per customer','tenant_acme.orders table'],['Database-per-tenant','Database per tenant','Dedicated RDS per enterprise','acme-prod-db instance'],['Partition key','DynamoDB partition key','Hash key including tenant_id','pk = TENANT#42#ORDER#99']],
    steps: [
      { title: 'Choose default strategy', body: 'Row-level pool for freemium; document upgrade triggers.' },
      { title: 'Enforce query scoping', body: 'ORM global filter, Row Level Security (RLS) in PostgreSQL, code review rules.' },
      { title: 'Plan silo migration', body: 'pg_dump tenant schema → restore to dedicated RDS; dual-write cutover.' },
      { title: 'Design DynamoDB keys', body: 'Tenant prefix in pk: TENANT#<id>#ENTITY#<id> for natural isolation.' }
    ],
    diagTitle: 'Partitioning levels', diag: 'flowchart TB\n  ROW[Row-level pool\\ntenant_id column] --> SCHEMA[Schema per tenant]\n  SCHEMA --> DB[Database per tenant]',
    snippets: [
      { language: 'sql', label: 'PostgreSQL Row Level Security', code: 'ALTER TABLE orders ENABLE ROW LEVEL SECURITY;\nCREATE POLICY tenant_isolation ON orders\n  USING (tenant_id = current_setting(\'app.tenant_id\')::uuid);', explanation: 'DB-enforced isolation even if app forgets WHERE clause.' },
      { language: 'sql', label: 'Schema per tenant', code: 'CREATE SCHEMA tenant_acme;\nCREATE TABLE tenant_acme.orders (order_id UUID, amount DECIMAL);', explanation: 'Namespace isolation — migration scripts run per schema.' },
      { language: 'typescript', label: 'DynamoDB tenant partition key', code: 'const item = {\n  pk: `TENANT#${tenantId}#ORDER#${orderId}`,\n  sk: \'METADATA\',\n  amount: 99.00\n};', explanation: 'Tenant in pk prevents cross-tenant GetItem without knowing key.' },
      { language: 'bash', label: 'Export tenant schema for silo migration', code: 'pg_dump -h pooled-db -n tenant_acme -Fc -f acme.dump\npg_restore -h acme-dedicated-db -d acme acme.dump', explanation: 'Bridge model: migrate enterprise from pool schema to dedicated DB.' }
    ],
    compare: [['Isolation','RLS + tenant_id','Separate MongoDB database per customer'],['Scale','Row pool single DB','DB per tenant ops at 10k tenants'],['Migration','Schema export to silo DB','ETL to new cluster']],
    mistakes: 'ORM query without tenant filter — classic data leak. Database-per-tenant for 50k free users. No RLS backup when relying only on application code.',
    senior: 'How to prove it in production: automated tests inject wrong tenant_id and assert  zero rows returned; RLS enabled on all pooled tables; migration runbook tested quarterly.',
    seniorRows: [['Row + RLS','Scale + DB-enforced safety','RLS performance overhead'],['Schema per tenant','Middle isolation','Connection pool per schema costly'],['DB per tenant','Maximum isolation','Ops and cost per customer']],
    reject: 'Trusting developers to always add WHERE tenant_id — rejected. Strong answer: RLS + middleware + integration tests + code review.',
    takeaways: ['Row pool default; schema or DB per tenant for enterprise silo.','PostgreSQL RLS enforces tenant isolation at database layer.','DynamoDB: embed tenant_id in partition key design.','60s: Row-level for scale with RLS safety net. Schema/DB per tenant for silo. Test cross-tenant access fails. Migration runbook for tier upgrades.','Follow-up: RLS performance impact at scale?'],
    pitfalls: ['No tenant filter in ORM query — data leak, interview failure.','Strong answer: RLS, middleware tenant context, automated isolation tests.','DB per tenant for all free users — cost kill.','RLS not enabled — single bug leaks all data.'],
    related: ['tenancy-models-silo-pool-bridge','vpc-per-tenant-vs-pool','noisy-neighbor-fairness'],
    jsTs: [{ language: 'javascript', concept: 'Prisma middleware', note: 'Prisma $use middleware injects tenant_id filter on every query — app-layer RLS equivalent.', futureTopicSlug: 'javascript/orm/prisma' },{ language: 'typescript', concept: 'Type-safe queries', note: 'Repository pattern requiring TenantId parameter prevents unscoped queries at compile time.', futureTopicSlug: 'typescript/saas/data' }],
    sources: [SAAS, { title: 'Data partitioning', url: 'https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/data-partitioning.html' }],
    anim: 'compare', tag: 'redis-cache'
  }),
  topic({
    prefix: p18, moduleId: m18, slug: 'noisy-neighbor-fairness', order: 5,
    title: 'Noisy neighbor and fairness controls',
    hook: 'In pooled SaaS, one tenant can monopolize shared CPU, database connections, or API rate limits — starving others. Fairness controls throttle, queue, and isolate noisy neighbors before they become everyone problem.',
    whatIs: 'Noisy neighbor sources: batch import flooding shared DB connections, runaway cron job consuming Lambda concurrency, webhook retry storm, DynamoDB hot partition from one tenant skewed key. Controls: per-tenant rate limits (API Gateway usage plans, WAF rate rules), reserved concurrency per tier, connection pool limits per tenant, SQS per-tenant queues with backpressure, and autoscaling with max caps per tenant.',
    why: 'SaaS SLO promises apply per customer, not average. Interviewers ask "tenant uploads 10M row CSV and slows everyone — fix?" Answer with fairness controls, not "buy bigger database."',
    frame: 'Say: per-tenant rate limits, reserved concurrency, connection caps, queue isolation, monitor per-tenant metrics.',
    terms: [['Noisy neighbor','Noisy neighbor','Tenant disproportionately consuming shared resources','CSV import exhausting connection pool'],['Fairness','Resource fairness','Equitable access to shared capacity','Per-tenant rate limit bucket'],['Reserved concurrency','Lambda reserved concurrency','Guaranteed and capped Lambda capacity per function/tenant','Premium tier 100 reserved'],['Backpressure','Backpressure','Slow producer when consumer overloaded','SQS depth triggers throttle on upload API']],
    steps: [
      { title: 'Instrument per-tenant metrics', body: 'CloudWatch custom metrics: requests, DB connections, queue depth per tenant_id.' },
      { title: 'Apply rate limits', body: 'API Gateway usage plan, WAF rate-based rule with tenant label, token bucket in app.' },
      { title: 'Isolate heavy workloads', body: 'Batch jobs to per-tenant SQS → dedicated Lambda with reserved concurrency cap.' },
      { title: 'Alert and throttle', body: 'Alarm on tenant exceeding 3x normal; auto-throttle or move to silo queue.' }
    ],
    diagTitle: 'Fairness controls', diag: 'flowchart LR\n  T1[Tenant A burst] --> RL[Rate limiter]\n  T2[Tenant B normal] --> RL\n  RL --> POOL[Shared compute]\n  RL -->|exceeds| QUEUE[Per-tenant queue]',
    snippets: [
      { language: 'typescript', label: 'Token bucket per tenant', code: 'class TenantRateLimiter {\n  private buckets = new Map<string, { tokens: number; last: number }>();\n  allow(tenantId: string, rate = 100): boolean {\n    const b = this.buckets.get(tenantId) ?? { tokens: rate, last: Date.now() };\n    const elapsed = (Date.now() - b.last) / 1000;\n    b.tokens = Math.min(rate, b.tokens + elapsed * rate);\n    b.last = Date.now();\n    if (b.tokens < 1) return false;\n    b.tokens -= 1;\n    this.buckets.set(tenantId, b);\n    return true;\n  }\n}', explanation: 'App-layer fairness before request hits shared DB.' },
      { language: 'yaml', label: 'Lambda reserved concurrency cap', code: 'ImportFunction:\n  Type: AWS::Lambda::Function\n  Properties:\n    ReservedConcurrentExecutions: 50\n    Environment:\n      Variables:\n        MAX_TENANT_CONNECTIONS: 10', explanation: 'Cap total import Lambda concurrency — prevents pool exhaustion.' },
      { language: 'typescript', label: 'Per-tenant connection pool', code: 'const pools = new Map<string, Pool>();\nfunction getPool(tenantId: string): Pool {\n  if (!pools.has(tenantId)) {\n    pools.set(tenantId, new Pool({ max: 5, connectionString: sharedDbUrl }));\n  }\n  return pools.get(tenantId)!;\n}', explanation: 'Limit DB connections per tenant — noisy import cannot take all 100 connections.' },
      { language: 'bash', label: 'CloudWatch per-tenant metric', code: 'aws cloudwatch put-metric-data \\\n  --namespace SaaS/Tenants \\\n  --metric-name ApiRequests \\\n  --dimensions Name=TenantId,Value=acme \\\n  --value 1', explanation: 'Per-tenant dashboards detect noisy neighbor before customers complain.' }
    ],
    compare: [['Fairness','Per-tenant rate limit + queue','Global rate limit hurts all'],['Isolation','Reserved concurrency cap','Single thread pool for all jobs'],['Detection','Per-tenant CloudWatch metrics','Single global CPU metric misses culprit']],
    mistakes: 'Global rate limit only — punishes innocent tenants when one misbehaves. No concurrency cap on batch Lambda. Ignoring DynamoDB hot partition from one tenant key skew.',
    senior: 'How to prove it in production: per-tenant p99 dashboard; chaos test one tenant 10x load — others stay within SLO; auto-throttle triggered in drill.',
    seniorRows: [['Per-tenant queues','Strong isolation','More queues to manage'],['Shared queue + priority','Simpler','Harder to enforce fairness'],['Auto silo escalation','Permanent fix for repeat offender','Sales/Ops coordination']],
    reject: 'Scale up RDS when one tenant noisy — rejected as unfair cost pass-through. Strong answer: throttle offender, per-tenant limits, queue isolation.',
    takeaways: ['Noisy neighbor = one tenant starves shared pool resources.','Per-tenant rate limits, concurrency caps, connection pools, queues.','Monitor per-tenant metrics — global averages hide offenders.','60s: Instrument per tenant. Rate limit API. Cap Lambda/DB connections. Queue heavy jobs. Alert on 3x normal. Throttle before scale-up.','Follow-up: DynamoDB hot partition from one tenant?'],
    pitfalls: ['Global throttle when one tenant noisy — punishes everyone.','Strong answer: per-tenant limits, identify offender via metrics, isolate workload.','Unlimited Lambda concurrency on import function.','No per-tenant dashboard — blind to offender.'],
    related: ['tenant-routing-blast-radius','data-partitioning-strategies','saas-reference-architecture'],
    jsTs: [{ language: 'javascript', concept: 'Bottleneck library', note: 'bottleneck npm limits concurrent jobs per tenant — same fairness pattern as Lambda reserved concurrency.', futureTopicSlug: 'javascript/concurrency/rate-limit' },{ language: 'typescript', concept: 'p-queue per tenant', note: 'Map of p-queue instances keyed by tenantId isolates async job throughput.', futureTopicSlug: 'typescript/concurrency/queues' }],
    sources: [SAAS, { title: 'Performance Efficiency — SaaS Lens', url: 'https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/performance-efficiency.html' }],
    anim: 'flow', tag: 'high-concurrency'
  }),
  topic({
    prefix: p18, moduleId: m18, slug: 'saas-reference-architecture', order: 6,
    title: 'SaaS reference architecture (control plane and data plane)',
    hook: 'SaaS reference architecture splits control plane (onboarding, billing, tenant management) from data plane (tenant-facing application logic). The control plane provisions and configures tenant resources; the data plane serves end-user traffic.',
    whatIs: 'Control plane: tenant signup, tier assignment, provisioning Step Functions, billing integration, admin API. Data plane: multi-tenant application serving customer users — APIs, UI, background jobs. AWS patterns: control plane in management account or shared services; data plane pooled ECS/Lambda with tenant context; silo resources vended by control plane workflows. SaaS Lens and AWS SaaS Factory reference architectures document this split.',
    why: 'Senior architects draw two boxes: control plane and data plane. Interviewers ask how onboarding a new tenant works end-to-end. Confusing the two leads to provisioning logic in request hot path.',
    frame: 'Say: control plane manages tenants; data plane serves users; provisioning is async workflow not sync API call.',
    terms: [['Control plane','SaaS control plane','Manages tenants, config, provisioning, billing','Signup triggers Step Functions'],['Data plane','SaaS data plane','Serves end-user traffic per tenant','Orders API with tenant context'],['Provisioning','Tenant provisioning','Async workflow creating tenant resources','Create schema, Cognito pool, usage plan'],['Onboarding','Tenant onboarding','Signup to first successful API call','< 5 min self-serve target']],
    steps: [
      { title: 'Tenant signs up', body: 'Control plane API creates tenant record, assigns tier, enqueues provisioning.' },
      { title: 'Provision resources', body: 'Step Functions: Cognito app client, schema/DB, usage plan, DNS record.' },
      { title: 'Activate tenant', body: 'Status ACTIVE — data plane accepts traffic for tenant_id.' },
      { title: 'Serve users', body: 'Data plane routes requests with tenant context; control plane not in hot path.' }
    ],
    diagTitle: 'Control vs data plane', diag: 'flowchart TB\n  CP[Control plane\\nsignup billing admin] -->|provisions| DP[Data plane\\nuser APIs]\n  USER[End user] --> DP\n  ADMIN[Tenant admin] --> CP',
    snippets: [
      { language: 'yaml', label: 'Step Functions tenant provisioning', code: 'ProvisionTenant:\n  Type: AWS::StepFunctions::StateMachine\n  Properties:\n    Definition:\n      StartAt: CreateTenantRecord\n      States:\n        CreateTenantRecord:\n          Type: Task\n          Resource: arn:aws:lambda:...:create-tenant\n          Next: ProvisionResources\n        ProvisionResources:\n          Type: Parallel\n          Branches:\n            - StartAt: CreateSchema\n            - StartAt: CreateCognitoClient\n          Next: ActivateTenant\n        ActivateTenant:\n          Type: Task\n          Resource: arn:aws:lambda:...:activate-tenant\n          End: true', explanation: 'Async provisioning — signup API returns fast, workflow completes in background.' },
      { language: 'typescript', label: 'Control plane signup API', code: 'async function signup(dto: SignupDto) {\n  const tenant = await db.tenants.create({ name: dto.name, tier: \'free\', status: \'PROVISIONING\' });\n  await sfn.startExecution({ stateMachineArn: PROVISION_ARN, input: JSON.stringify({ tenantId: tenant.id }) });\n  return { tenantId: tenant.id, status: \'PROVISIONING\' };\n}', explanation: 'Never block signup on full provisioning — return status and poll.' },
      { language: 'typescript', label: 'Data plane guards tenant status', code: 'async function handleOrder(req: TenantRequest) {\n  const tenant = await cache.getTenant(req.tenantId);\n  if (tenant.status !== \'ACTIVE\') throw new ServiceUnavailableError(\'Tenant not ready\');\n  return orderService.create(req.tenantId, req.body);\n}', explanation: 'Data plane rejects traffic until control plane marks tenant ACTIVE.' },
      { language: 'yaml', label: 'EventBridge tenant lifecycle events', code: 'TenantCreatedRule:\n  Type: AWS::Events::Rule\n  Properties:\n    EventPattern:\n      source: [saas.controlplane]\n      detail-type: [TenantActivated]\n    Targets:\n      - Arn: !GetAtt WelcomeEmailLambda.Arn\n        Id: WelcomeEmail', explanation: 'Decouple control plane events from data plane side effects.' }
    ],
    compare: [['Split','Control vs data plane','Admin API vs user API in same Express app'],['Provision','Async Step Functions','Sync signup blocking 30s'],['Events','EventBridge tenant lifecycle','In-process EventEmitter']],
    mistakes: 'Provisioning in synchronous signup request — timeout and poor UX. Control plane logic in every data plane request path. No tenant status gate — traffic hits half-provisioned tenant.',
    senior: 'How to prove it in production: p99 signup-to-ACTIVE < 5 min; control plane error rate separate from data plane SLO; provisioning workflow idempotent on retry.',
    seniorRows: [['Separate accounts','Strong CP/DP isolation','Cross-account complexity'],['Same account separate services','Simpler ops','Weaker blast radius separation'],['Cell-based architecture','Scale data plane horizontally','Complex routing']],
    reject: 'Monolith mixing signup admin and user API with no plane separation — rejected at senior level. Strong answer: control plane provisions async; data plane serves with tenant gate.',
    takeaways: ['Control plane = tenant lifecycle; data plane = end-user traffic.','Provision async via Step Functions — never block signup.','Data plane checks tenant ACTIVE before serving.','60s: CP handles signup, billing, provisioning workflow. DP serves users with tenant context. EventBridge for lifecycle. SaaS Lens reference architecture.','Follow-up: how offboard tenant and delete data?'],
    pitfalls: ['Sync provisioning on signup — timeouts and failures block user.','Strong answer: async workflow, PROVISIONING status, poll until ACTIVE.','No idempotent provisioning — retry creates duplicate resources.','Control plane in data plane hot path — coupling and scale issues.'],
    related: ['tenancy-models-silo-pool-bridge','tenant-routing-blast-radius','data-partitioning-strategies'],
    jsTs: [{ language: 'javascript', concept: 'Admin vs user routes', note: 'Separate Express routers for /admin (control) and /api (data) mirror plane split.', futureTopicSlug: 'javascript/saas/architecture' },{ language: 'typescript', concept: 'Domain events', note: 'TenantActivated event decouples provisioning completion from welcome email — EventBridge pattern locally.', futureTopicSlug: 'typescript/architecture/events' }],
    sources: [SAAS, { title: 'SaaS control plane and data plane', url: 'https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-control-plane-and-data-plane.html' }],
    anim: 'flow', tag: 'saas-tenant-routing'
  })
];

topics18.forEach(t => writeTopic('18-saas-and-interview', t));

writeJson('18-saas-and-interview', 'mindmap.json', {
  moduleId: m18, title: 'SaaS on AWS — concept map',
  intro: 'Building SaaS on AWS requires explicit tenancy models, network and data isolation, fairness controls, and control plane / data plane separation. The SaaS Lens extends Well-Architected with multi-tenant patterns senior interviewers expect you to defend with blast radius and cost tradeoffs.',
  overviewDiagram: { type: 'mermaid', title: 'SaaS architecture', source: 'flowchart TB\n  CP[Control plane] -->|provision| DP[Data plane]\n  DP --> POOL[Pooled tier]\n  DP --> SILO[Silo tier]\n  POOL --> DATA[Row partition + RLS]\n  SILO --> DED[Dedicated DB/VPC]' },
  conceptCards: [
    { id: 'c-tenancy', title: 'Tenancy models', summary: 'Silo, pool, bridge by tier.', example: 'Free pool, enterprise silo', topicSlug: 'tenancy-models-silo-pool-bridge' },
    { id: 'c-vpc', title: 'VPC isolation', summary: 'Pooled vs VPC-per-tenant.', example: 'PrivateLink to silo DB', topicSlug: 'vpc-per-tenant-vs-pool' },
    { id: 'c-route', title: 'Routing & blast radius', summary: 'Subdomain/JWT routing, per-tenant limits.', example: 'ALB host-header to silo TG', topicSlug: 'tenant-routing-blast-radius' },
    { id: 'c-data', title: 'Data partitioning', summary: 'Row, schema, DB per tenant.', example: 'PostgreSQL RLS', topicSlug: 'data-partitioning-strategies' },
    { id: 'c-noisy', title: 'Noisy neighbor', summary: 'Per-tenant rate limits and queues.', example: 'Token bucket per tenant', topicSlug: 'noisy-neighbor-fairness' },
    { id: 'c-ref', title: 'Reference architecture', summary: 'Control plane vs data plane.', example: 'Step Functions provisioning', topicSlug: 'saas-reference-architecture' }
  ],
  revisionDiagram: { type: 'mermaid', title: 'SaaS revision map', source: 'mindmap\n  root((SaaS on AWS))\n    Tenancy\n      Silo dedicated\n      Pool shared\n      Bridge tiered\n    Network\n      Pooled VPC\n      VPC per tenant\n      PrivateLink hybrid\n    Routing\n      Subdomain JWT\n      Blast radius\n      Per-tenant limits\n    Data\n      Row tenant_id RLS\n      Schema per tenant\n      DB per tenant\n    Fairness\n      Rate limits\n      Concurrency caps\n      Per-tenant metrics\n    Architecture\n      Control plane\n      Data plane\n      Async provisioning' }
});

writeJson('18-saas-and-interview', 'quick-overview.json', {
  moduleId: m18, title: 'SaaS on AWS in one screen',
  rememberThis: [
    'Silo / pool / bridge — match isolation to pricing tier.',
    'Pooled default; VPC or DB per tenant for enterprise.',
    'Never trust client tenant_id — use signed JWT or verified subdomain.',
    'PostgreSQL RLS + middleware for row-level pool safety.',
    'Control plane provisions async; data plane serves users.'
  ],
  bullets: [
    'Cross-tenant data leak = top SaaS security failure.',
    'Per-tenant rate limits before scaling shared infra.',
    'DynamoDB: tenant_id in partition key.',
    'Step Functions for tenant onboarding workflow.',
    'SaaS Lens maps to Well-Architected six pillars.'
  ],
  rows: [
    { label: 'Tenancy', value: 'Silo / pool / bridge' },
    { label: 'Network', value: 'Pooled VPC vs per-tenant' },
    { label: 'Routing', value: 'Subdomain, JWT, blast radius' },
    { label: 'Data', value: 'Row + RLS, schema, dedicated DB' },
    { label: 'Fairness', value: 'Per-tenant limits and queues' },
    { label: 'Architecture', value: 'Control plane + data plane' }
  ]
});

writeJson('18-saas-and-interview', 'interview.json', {
  moduleId: m18, title: 'SaaS on AWS interview drills',
  items: [
    { question: 'Design multi-tenant SaaS on AWS for freemium and enterprise tiers.', answer: 'Pool model default: shared VPC, ECS/Lambda data plane, row-level DB with RLS and tenant_id on every query. Route by subdomain acme.app.com. Per-tenant API rate limits. Enterprise bridge: vended dedicated RDS + VPC via control plane Step Functions, PrivateLink from pooled app. Control plane handles signup async provisioning. Cognito custom tenant claim in JWT.', followUps: ['When move from pool to silo?', 'Cross-tenant pen test approach?'], sixtySeconds: 'Pool for free with RLS. Enterprise silo DB/VPC vended. Control plane async provision. Subdomain routing. Per-tenant limits. SaaS Lens.' },
    { question: 'Tenant A reports seeing Tenant B data. How investigate and prevent?', answer: 'Incident: identify API logs with wrong tenant_id in response, find missing WHERE clause or auth bypass. Immediate: disable endpoint, notify affected tenants. Root cause: ORM query without tenant filter or client-supplied tenant_id trusted. Prevent: PostgreSQL RLS, middleware tenant context, integration tests asserting cross-tenant returns zero rows, code review rule for unscoped queries.', followUps: ['RLS vs app-layer only?', 'Audit log requirements?'], sixtySeconds: 'Leak = missing tenant scope. Fix query. Add RLS, middleware, isolation tests. Never trust client tenant_id.' },
    { question: 'One tenant CSV import slows entire platform. Fix without just scaling RDS.', answer: 'Identify offender via per-tenant CloudWatch metrics on DB connections and API rate. Throttle tenant upload API with token bucket. Move import to per-tenant SQS queue with Lambda reserved concurrency cap (50). Limit per-tenant connection pool to 5. Alert on 3x normal tenant usage. Offer silo tier if repeat enterprise offender.', followUps: ['DynamoDB hot partition same problem?', 'Fair queue vs priority queue?'], sixtySeconds: 'Per-tenant metrics find offender. Rate limit upload. Queue + concurrency cap. Connection pool per tenant. Throttle not just scale.' },
    { question: 'Walk tenant onboarding from signup to first API call.', answer: 'Signup hits control plane API → tenant record PROVISIONING → Step Functions parallel: create DB schema, Cognito app client, API usage plan, Route53 subdomain. On success → status ACTIVE → EventBridge TenantActivated. Data plane accepts requests with tenant JWT claim. User polls /status until ACTIVE then calls API. Target < 5 min self-serve.', followUps: ['Idempotent provisioning on retry?', 'Offboarding data deletion?'], sixtySeconds: 'CP async Step Functions provision. Status gate. DP serves when ACTIVE. EventBridge lifecycle. Never sync block signup.' },
    { question: 'Enterprise contract requires network isolation. Architecture change?', answer: 'Bridge from pool: vend dedicated VPC or account via landing zone Account Factory. IPAM allocates CIDR. Deploy silo RDS in tenant VPC. Pooled app connects via PrivateLink endpoint. ALB host-header routes enterprise subdomain to silo target group or dedicated stack. Document in SaaS Lens silo tier. Automate — manual 2-week setup fails enterprise sales.', followUps: ['Account per tenant vs VPC per tenant?', 'Cost model for silo tier?'], sixtySeconds: 'Vend VPC/account automated. PrivateLink to silo data. Host-header routing. IPAM CIDR. Pool remains for standard tier.' },
    { question: 'Compare row-level, schema-per-tenant, and database-per-tenant partitioning.', answer: 'Row-level: one schema, tenant_id column, RLS — best scale, leak risk if filter missed. Schema-per-tenant: PG schema namespace — middle isolation, connection overhead. Database-per-tenant: dedicated RDS — silo enterprise, highest ops cost. DynamoDB: tenant in partition key regardless. Default row+RLS; upgrade enterprise to dedicated DB with pg_dump migration.', followUps: ['RLS performance at 1M rows?', 'DynamoDB vs RDS for SaaS?'], sixtySeconds: 'Row+RLS for pool scale. Schema middle. DB per tenant for silo. Test cross-tenant fails. Migration runbook for upgrades.' },
    { question: 'How does SaaS Lens relate to core Well-Architected pillars?', answer: 'SaaS Lens adds tenant isolation, noisy neighbor, tiering, onboarding/offboarding questions atop six pillars. Security: per-tenant access control. Reliability: blast radius containment. Performance: fairness and partition key design. Cost: pool vs silo unit economics. Use both in WAFR for multi-tenant products.', followUps: ['Serverless Lens overlap?', 'WAFR HRI examples for SaaS?'], sixtySeconds: 'SaaS Lens extends six pillars with multi-tenant specifics. Isolation, fairness, tiering, control/data plane. Use in WAFR for SaaS products.' },
    { question: 'Design blast radius containment for pooled tier.', answer: 'Layers: auth JWT tenant claim validated; middleware enforces; RLS at DB; per-tenant rate limits and connection caps; circuit breakers per tenant for external calls; separate SQS queues for batch; CloudWatch per-tenant dashboards; chaos test kill one tenant workload — others within SLO. Enterprise escape hatch to silo tier.', followUps: ['Shared ALB DDoS affects all?', 'Cell-based architecture?'], sixtySeconds: 'Auth, middleware, RLS, per-tenant limits, queues, circuit breakers, metrics, chaos test. Silo tier for escape.' },
    { question: 'Control plane vs data plane — what goes where?', answer: 'Control plane: signup, billing, tier change, provisioning workflows, admin APIs, tenant config. Data plane: end-user CRUD, real-time features, tenant-scoped business logic. Never provision in data plane request path. EventBridge connects planes. Separate scaling, monitoring, and deployment for each.', followUps: ['Same account or separate?', 'Multi-region control plane?'], sixtySeconds: 'CP = lifecycle and provision async. DP = user traffic with tenant context. Decouple with events. Separate SLOs.' },
    { question: 'VPC per tenant for 5000 customers — viable?', answer: 'No for standard tier — ops nightmare (5000 VPCs, TGW attachments, patching). Viable only for top enterprise subset (<50) with automation and premium pricing. Default pooled VPC with app-layer isolation. Use bridge: 4950 pooled, 50 silo VPCs vended on contract. IPAM and Step Functions automate silo; never manual.', followUps: ['Heroku-style multi-tenant comparison?', 'Kubernetes namespace vs VPC?'], sixtySeconds: '5000 VPCs not viable. Pool default. Silo automate for enterprise few. IPAM + Step Functions. Cost model must support silo ops.' }
  ]
});

console.log('Module 18 done — all modules generated');
