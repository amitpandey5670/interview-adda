#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const modulesDir = path.join(root, 'data/aws/modules');

function writeJson(filePath, data) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function buildTopic({ id, slug, title, moduleId, order, hook, scenarioTag, animationHint, relatedTopicIds, glossary, steps, diagram, snippets, comparisonRows, pitfallsBody, seniorProse, seniorRows, rejectionBody, takeaways, pitfalls, jsTs, sources }) {
  return {
    id,
    slug,
    title,
    moduleId,
    order,
    hook,
    sections: [
      {
        heading: 'What is this?',
        blocks: [
          { type: 'prose', text: glossary.prose },
          {
            type: 'glossary',
            title: 'Key terms',
            entries: glossary.entries,
          },
        ],
      },
      {
        heading: 'Why does it matter?',
        blocks: [
          { type: 'prose', text: glossary.why },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Interview framing',
            body: glossary.framing,
          },
        ],
      },
      {
        heading: 'How it works step by step',
        blocks: [
          { type: 'steps', title: steps.title, items: steps.items },
          {
            type: 'diagram',
            diagram: { type: 'mermaid', title: diagram.title, source: diagram.source },
          },
        ],
      },
      {
        heading: 'Code walkthrough',
        blocks: snippets.map((s) => ({ type: 'snippet', snippet: s })),
      },
      {
        heading: 'Compare with JavaScript and TypeScript',
        blocks: [
          {
            type: 'comparisonTable',
            title: 'Runtime and deployment parallels',
            headers: ['Aspect', 'AWS pattern', 'JavaScript / TypeScript'],
            rows: comparisonRows,
          },
        ],
      },
      {
        heading: 'Common mistakes',
        blocks: [
          {
            type: 'callout',
            variant: 'warning',
            title: 'Pitfalls to avoid',
            body: pitfallsBody,
          },
        ],
      },
      {
        heading: 'Senior interview depth',
        blocks: [
          { type: 'prose', text: seniorProse },
          {
            type: 'comparisonTable',
            title: 'Tradeoffs at senior level',
            headers: ['Pattern', 'Win', 'Cost / risk'],
            rows: seniorRows,
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'What gets you rejected in interviews',
            body: rejectionBody,
          },
        ],
      },
    ],
    interviewTakeaways: takeaways,
    commonPitfalls: pitfalls,
    relatedTopicIds,
    jsTsCorrelations: jsTs,
    officialSources: sources,
    animationHint,
    scenarioTag,
  };
}

const MODULES = [
  {
    folder: '09-ec2-compute',
    module: {
      id: 'aws-09-ec2-compute',
      slug: 'ec2-compute',
      title: 'EC2 compute (instances, scaling, storage, networking)',
      order: 9,
      stage: 'intermediate',
      summary:
        'Elastic Compute Cloud (EC2) is AWS managed virtual machines: Amazon Machine Images (AMIs), instance types and purchase options, Elastic Network Interfaces (ENIs) in Virtual Private Clouds (VPCs), Auto Scaling Groups (ASGs) for elasticity, Elastic Block Store (EBS) versus instance store, and systematic networking troubleshooting for production outages.',
      officialHubs: [
        { title: 'Amazon EC2 User Guide', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html' },
        { title: 'Amazon EC2 Auto Scaling', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html' },
      ],
      topics: [
        { id: 'aws-09-ec2-instances-amis', slug: 'ec2-instances-amis', title: 'EC2 instances, AMIs, and launch templates', order: 1 },
        { id: 'aws-09-eni-vpc-attachment', slug: 'eni-vpc-attachment', title: 'Elastic Network Interfaces (ENI) and VPC attachment', order: 2 },
        { id: 'aws-09-auto-scaling-groups', slug: 'auto-scaling-groups', title: 'Auto Scaling Groups (ASG) and launch configurations', order: 3 },
        { id: 'aws-09-ebs-vs-instance-store', slug: 'ebs-vs-instance-store', title: 'EBS volumes versus instance store (ephemeral)', order: 4 },
        { id: 'aws-09-ec2-networking-troubleshoot', slug: 'ec2-networking-troubleshoot', title: 'EC2 networking troubleshooting playbook', order: 5 },
      ],
    },
    mindmap: {
      intro:
        'EC2 delivers resizable compute in your VPC. You launch from Amazon Machine Images (AMIs), attach Elastic Network Interfaces (ENIs) for networking, scale with Auto Scaling Groups (ASGs), persist data on Elastic Block Store (EBS) or accept ephemeral instance store, and debug connectivity with a layered checklist.',
      overviewDiagram: {
        type: 'mermaid',
        title: 'EC2 in a VPC',
        source:
          'flowchart TB\n  AMI[AMI / Launch template] --> EC2[EC2 instance]\n  subgraph VPC\n    EC2 --> ENI[Primary ENI in subnet]\n    EC2 --> EBS[EBS root + data volumes]\n    ASG[Auto Scaling Group] --> EC2\n  end\n  ENI --> RT[Route table + SG]\n  RT --> ALB[ALB / Internet]',
      },
      conceptCards: [
        { id: 'card-ami', title: 'Instances & AMIs', summary: 'Instance type = CPU/RAM/network profile. AMI = bootable template. Launch templates version infra.', example: 't3.medium from Amazon Linux 2023 AMI in private subnet', topicSlug: 'ec2-instances-amis' },
        { id: 'card-eni', title: 'ENI attachment', summary: 'Every instance has a primary ENI in a subnet. Secondary ENIs for multi-homing or Lambda.', example: 'Move ENI to standby instance for fast failover', topicSlug: 'eni-vpc-attachment' },
        { id: 'card-asg', title: 'Auto Scaling', summary: 'ASG maintains desired capacity across AZs using health checks and scaling policies.', example: 'Target tracking on ALB request count per target', topicSlug: 'auto-scaling-groups' },
        { id: 'card-ebs', title: 'EBS vs instance store', summary: 'EBS persists across stop/start; instance store is local NVMe, lost on stop/terminate.', example: 'gp3 root volume + io2 for database on EC2', topicSlug: 'ebs-vs-instance-store' },
        { id: 'card-net', title: 'Networking troubleshoot', summary: 'Check SG, NACL, route table, ENI, public IP, and OS firewall in order.', example: 'VPC Reachability Analyzer for path proof', topicSlug: 'ec2-networking-troubleshoot' },
      ],
      revisionDiagram: {
        type: 'mermaid',
        title: 'EC2 compute revision map',
        source:
          'mindmap\n  root((EC2 compute))\n    Instances AMIs\n      Instance families\n      Launch templates\n      User data bootstrap\n      IMDS v2\n    ENI VPC\n      Primary vs secondary\n      Multiple IPs\n      Source dest check\n      Lambda ENIs\n    Auto Scaling\n      Desired min max\n      Health checks\n      Target tracking\n      Instance refresh\n    EBS vs store\n      gp3 io2 st1\n      Encrypt KMS\n      Ephemeral NVMe\n    Troubleshoot\n      SG stateful\n      NACL stateless\n      Route tables\n      Flow logs',
      },
    },
    quickOverview: {
      rememberThis: [
        'AMI + instance type + subnet + security group = launch decision set.',
        'Primary ENI determines subnet, private IP, and route table association.',
        'ASG spreads instances across AZs; use target tracking for most web workloads.',
        'EBS survives stop/start; instance store does not — pick per workload.',
        'Troubleshoot networking outside-in: route → NACL → SG → OS.',
      ],
      bullets: [
        'Use launch templates (not launch configurations) for versioned, reusable launches.',
        'IMDSv2 required token stops SSRF credential theft from compromised apps.',
        'Placement groups: cluster for HPC, spread for critical singletons, partition for large distributed systems.',
        'Disable source/dest check only for NAT instances or firewalls — not app servers.',
        'Instance store offers higher IOPS at the cost of durability.',
      ],
      rows: [
        { label: 'AMI', value: 'Bootable image snapshot — OS, apps, and EBS mappings' },
        { label: 'ENI', value: 'Virtual NIC in a subnet — carries private (and optional public) IP' },
        { label: 'ASG', value: 'Maintains fleet size with policies and health checks' },
        { label: 'EBS', value: 'Network-attached block storage — persists independently' },
        { label: 'Instance store', value: 'Physically attached disks — high perf, ephemeral' },
      ],
    },
    interview: [
      { question: 'Your ASG keeps replacing healthy-looking instances. What do you investigate?', answer: 'Check ASG health check type (EC2 vs ELB). If ELB, failing target group health checks trigger replacement even when the OS is up. Verify security group allows health check port from ALB, application listens on registered port, grace period is long enough for boot, and status checks versus custom health. CloudWatch alarms on UnHealthyHostCount confirm. Strong answer: distinguish EC2 status check failure from load balancer health failure.', followUps: ['What is a lifecycle hook used for?', 'How does instance refresh differ from rolling ASG update?'], sixtySeconds: 'ELB health check failing → ASG cycles instances. Check TG port, SG, grace period, app readiness. EC2 status check is separate from ALB health.' },
      { question: 'When would you choose instance store over EBS for a database on EC2?', answer: 'Instance store NVMe gives lowest latency and highest IOPS for scratch, cache, or sharded workloads where replication handles durability (Cassandra, Kafka). Never for sole copy of data. EBS gp3/io2 when you need snapshots, resize, survive stop/start, or Multi-Attach (io2 only). Production proof: CloudWatch VolumeQueueLength and instance store metrics; benchmark with fio before committing.', followUps: ['What happens to instance store on stop versus terminate?', 'Can you snapshot instance store?'], sixtySeconds: 'Instance store = fast ephemeral. EBS = durable network disk. DB on instance store only with replication. Snapshots are EBS-only.' },
      { question: 'Walk through attaching a secondary ENI for a multi-homed security appliance.', answer: 'Create ENI in management subnet and data subnet, attach as device index 1+, assign security groups per role, disable source/dest check on the appliance ENI, route tables send inspection traffic through appliance private IP. Primary ENI keeps SSH/management path. Document MAC and device names in user data. Compare to on-prem dual-NIC firewall — same routing intent.', followUps: ['Can you move an ENI between instances?', 'How many ENIs per instance type?'], sixtySeconds: 'Secondary ENI in target subnet, SG per role, source/dest check off for routing appliance. Primary ENI for management.' },
      { question: 'New EC2 in a private subnet cannot pull container images from ECR. Debug layers.', answer: 'Private subnet needs NAT or VPC interface endpoint for ECR API and ECR DKR (docker pull). Security group egress 443. Route 0.0.0.0/0 to NAT or endpoints in route table. IAM instance profile with ecr:GetAuthorizationToken and ecr:BatchGetImage. DNS resolves ECR — use VPC DNS. SSM session for shell: curl ECR endpoint. Flow logs show REJECT on NACL or SG.', followUps: ['Which endpoints replace NAT for ECR?', 'Does Lambda in VPC share this problem?'], sixtySeconds: 'ECR needs API + DKR endpoints or NAT. IAM role for pull. SG egress 443. Route table and DNS. Same pattern for Lambda in VPC.' },
      { question: 'How do launch templates improve on launch configurations?', answer: 'Launch templates are versioned, support mixed instances policy in ASG, carry advanced networking (ENI specs), IMDSv2 defaults, tag propagation, and latest features. Launch configurations are legacy and immutable — change requires new LC. Production uses templates with default version and explicit $Latest/$Default in ASG. Infrastructure as Code: CloudFormation/AWS::EC2::LaunchTemplate.', followUps: ['How do you roll out a new AMI with zero downtime?', 'What is a capacity reservation?'], sixtySeconds: 'Launch templates = versioned, full feature set. LC is legacy. ASG instance refresh or blue/green with new template version.' },
      { question: 'An instance has a public IP but SSH times out. Ordered checklist?', answer: 'Internet Gateway attached, subnet route 0.0.0.0/0 → igw, instance auto-assign public IP or Elastic IP, security group inbound 22 from your IP (not 0.0.0.0/0 in prod — use SSM), NACL allows ephemeral return, host firewall, correct key pair, no accidental private-only subnet. VPC Reachability Analyzer documents path. Prefer SSM Session Manager over SSH in interviews.', followUps: ['Does a security group on the ALB affect EC2 SSH?', 'What do flow logs show for SG reject?'], sixtySeconds: 'IGW + public route + public IP + SG/NACL + key. Use SSM not SSH in prod. Flow logs and Reachability Analyzer prove the path.' },
      { question: 'Design ASG for a stateful session web app on EC2.', answer: 'Do not rely on instance stickiness alone — externalize sessions to ElastiCache or DynamoDB. ASG across AZs behind ALB, target group with health check on /health, deregistration delay for connection drain, warm pool optional for scale-out latency. EBS per instance for local cache only. Strong rejection: sticky sessions without shared store fails when instance terminates.', followUps: ['When is warm pool worth the cost?', 'How does connection draining work?'], sixtySeconds: 'External session store. Multi-AZ ASG + ALB. Health checks and drain delay. No sticky-only state on disk.' },
      { question: 'What gets you rejected drawing EC2 architecture on a whiteboard?', answer: 'Single AZ ASG, public IP on every app server instead of ALB, database on instance store without replication, security group 0.0.0.0/0 SSH, ignoring IMDSv2, and ASG health check type mismatch. Strong diagram: private subnets, ALB public, NAT per AZ, EBS encrypted, instance profile not long-lived keys.', followUps: ['How does Systems Manager replace SSH?', 'When is Nitro Enclaves relevant?'], sixtySeconds: 'Reject: single AZ, SSH open world, DB on ephemeral disk. Draw ALB, private ASG, NAT per AZ, EBS encrypt, IMDSv2.' },
    ],
    topics: [
      {
        id: 'aws-09-ec2-instances-amis',
        slug: 'ec2-instances-amis',
        title: 'EC2 instances, AMIs, and launch templates',
        order: 1,
        hook: 'An Amazon Machine Image (AMI) is the boot blueprint; the instance type is the hardware profile. Together they define what runs, how fast, and what it costs.',
        scenarioTag: 'high-concurrency',
        animationHint: 'compare',
        relatedTopicIds: ['aws-09-eni-vpc-attachment', 'aws-09-auto-scaling-groups', 'aws-09-ebs-vs-instance-store', 'aws-11-lambda-vs-ec2-fargate'],
        glossary: {
          prose: 'Amazon Elastic Compute Cloud (EC2) provides virtual machines in AWS regions. An Amazon Machine Image (AMI) captures the root volume template — operating system, patches, and baked application bits. Instance types (families like t3, m6i, c7g) encode vCPU, memory, network bandwidth, and optional accelerators. Launch templates version the full launch specification: AMI, type, key pair, network interfaces, storage, tags, and Instance Metadata Service (IMDS) settings.',
          why: 'Wrong instance family wastes money (GPU for CRUD API) or causes throttling (burstable t3 CPU credits exhausted). AMIs drift without pipelines — golden AMI builds via EC2 Image Builder keep CVE patches consistent. Launch templates are how Auto Scaling Groups and blue/green deploys reference immutable infra versions.',
          framing: 'Say: AMI = what boots, instance type = capacity profile, launch template = versioned launch contract with IMDSv2 required and instance profile for AWS API access.',
          entries: [
            { term: 'AMI', longForm: 'Amazon Machine Image', plainDefinition: 'Template for the root volume and launch permissions.', example: 'Amazon Linux 2023 AMI with SSM agent preinstalled.' },
            { term: 'Instance type', longForm: 'EC2 instance type', plainDefinition: 'Named hardware profile: vCPU, RAM, network, storage options.', example: 'm6i.large — 2 vCPU, 8 GiB, general purpose.' },
            { term: 'Launch template', longForm: 'EC2 launch template', plainDefinition: 'Versioned launch spec replacing legacy launch configurations.', example: 'Version 3 switches AMI after Image Builder pipeline.' },
            { term: 'IMDSv2', longForm: 'Instance Metadata Service version 2', plainDefinition: 'Session-oriented metadata access requiring a PUT token first.', example: 'HttpTokens: required blocks SSRF from stealing IAM role creds.' },
          ],
        },
        steps: {
          title: 'From AMI to running instance',
          items: [
            { title: 'Select AMI and type', body: 'Pick region-local AMI; match workload to family (compute, memory, burstable).' },
            { title: 'Configure networking', body: 'Subnet, security groups, public IP assignment, primary ENI settings in template.' },
            { title: 'Attach storage mappings', body: 'Root gp3 volume size, encryption, additional EBS or instance store from type.' },
            { title: 'Bootstrap', body: 'User data script runs at first boot — idempotent cloud-init or PowerShell.' },
          ],
        },
        diagram: { title: 'Launch template to instance', source: 'flowchart LR\n  LT[Launch template v2] --> LTspec[AMI + type + SG + EBS]\n  LTspec --> Run[RunInstances / ASG]\n  Run --> Inst[EC2 instance]\n  Inst --> IMDS[IMDSv2 token]\n  Inst --> Profile[Instance profile IAM role]' },
        snippets: [
          { language: 'yaml', label: 'Launch template with IMDSv2', code: 'LaunchTemplate:\n  Type: AWS::EC2::LaunchTemplate\n  Properties:\n    LaunchTemplateData:\n      ImageId: ami-0abcdef1234567890\n      InstanceType: m6i.large\n      IamInstanceProfile:\n        Arn: !GetAtt InstanceProfile.Arn\n      MetadataOptions:\n        HttpTokens: required\n        HttpEndpoint: enabled\n      BlockDeviceMappings:\n        - DeviceName: /dev/xvda\n          Ebs:\n            VolumeSize: 30\n            VolumeType: gp3\n            Encrypted: true', explanation: 'HttpTokens required enforces IMDSv2. Encrypted gp3 root is production baseline.' },
          { language: 'bash', label: 'Launch instance from template', code: 'aws ec2 run-instances \\\n  --launch-template LaunchTemplateName=web-app,Version=2 \\\n  --subnet-id subnet-0abc123 \\\n  --security-group-ids sg-0web456 \\\n  --tag-specifications \'ResourceType=instance,Tags=[{Key=Name,Value=web-1}]\'', explanation: 'Template carries AMI and type; subnet and SG can override per launch.' },
          { language: 'bash', label: 'Create AMI from golden instance', code: 'aws ec2 create-image \\\n  --instance-id i-0golden \\\n  --name "web-app-golden-2026-09-14" \\\n  --no-reboot\naws ec2 describe-images --owners self --filters "Name=name,Values=web-app-golden-*"', explanation: 'Image Builder automates this; manual AMI for labs. no-reboot risks filesystem consistency — prefer staged pipeline.' },
          { language: 'bash', label: 'IMDSv2 token fetch from instance', code: 'TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" \\\n  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")\ncurl -sH "X-aws-ec2-metadata-token: $TOKEN" \\\n  http://169.254.169.254/latest/meta-data/iam/security-credentials/web-role', explanation: 'Proves IMDSv2 path. Apps and SDKs use instance profile automatically when configured.' },
        ],
        comparisonRows: [
          ['Boot image', 'AMI is region-specific copied image', 'Docker image / VM template — not portable across clouds without rebuild'],
          ['Sizing', 'Discrete instance types — vertical scale = change type', 'Node process scales vertically until memory cap — no instance type picker'],
          ['Metadata', 'IMDS exposes role credentials and user data', 'No EC2 metadata — use env vars and secret managers in Node'],
          ['Bootstrap', 'cloud-init user data at boot', 'npm start in Dockerfile CMD — runs every container start'],
        ],
        pitfallsBody: 'Using long-lived access keys on instances instead of instance profiles. Leaving IMDSv1 enabled on internet-facing apps. Baking secrets into AMIs instead of fetching at boot from Secrets Manager.',
        seniorProse: 'Burstable t3/t4g instances accumulate CPU credits — sustained 100% CPU causes throttle visible in CPUSurplusCreditBalance CloudWatch metric. Graviton (c7g/m7g) needs ARM-built binaries. How to prove it in production: CloudWatch agent for mem/disk, SSM Inventory for AMI age, AWS Compute Optimizer rightsizing recommendations, and golden AMI pipeline age alarm > 30 days.',
        seniorRows: [
          ['Reserved / Savings Plans', '40–70% cost cut for steady state', 'Commitment risk if architecture shifts to containers'],
          ['Spot instances', 'Deep discount for fault-tolerant batch', 'Two-minute interruption notice — need checkpointing'],
          ['Dedicated Hosts', 'License compliance (BYOL SQL Server)', 'Highest cost — only for license or placement rules'],
          ['Nitro instances', 'Higher network/disk performance, bare-metal-like', 'Some legacy drivers incompatible'],
        ],
        rejectionBody: "Saying 'pick t2.micro for production API' without mentioning CPU credits or network limits. Strong answer: map workload to family, enforce IMDSv2, golden AMI pipeline, instance profile, encrypted EBS.",
        takeaways: [
          'AMI defines the boot disk template; instance type defines compute, memory, and network capacity.',
          'Launch templates are versioned — prefer them over deprecated launch configurations for ASG integration.',
          'Require IMDSv2 and instance profiles; never embed access keys in user data or AMIs.',
          '60s: AMI + instance type + launch template version = reproducible EC2. IMDSv2 required. Golden AMI pipeline. Instance profile not keys.',
          'Follow-up: how do you roll out a new AMI across an ASG without downtime?',
        ],
        pitfalls: [
          "Saying AMIs are global — saying that gets you rejected because AMIs are regional; copy across regions for DR.",
          'Strong answer: AMI copy, launch template new version, ASG instance refresh with min healthy 90%.',
          'Embedding database connection strings in user data instead of Secrets Manager.',
          'Using burstable instances for CPU-saturated APIs without credit monitoring.',
        ],
        jsTs: [
          { language: 'javascript', concept: 'Process vs EC2 instance', note: 'A Node.js server on EC2 is one OS process tree on a VM you patch and scale via ASG. Unlike serverless, you own the kernel, libc, and long-lived connections.', futureTopicSlug: 'aws/ec2/compute-model' },
          { language: 'typescript', concept: 'Config at boot vs build time', note: 'TypeScript apps often bake env at Docker build; on EC2, user data fetches SSM parameters at boot — similar to runtime config injection but at VM layer not container layer.', futureTopicSlug: 'aws/ec2/bootstrap' },
        ],
        sources: [
          { title: 'Amazon EC2 instance types', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html' },
          { title: 'Configure the instance metadata service', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html' },
        ],
      },
    ],
  },
  {
    folder: '10-s3-storage',
    module: {
      id: 'aws-10-s3-storage',
      slug: 's3-storage',
      title: 'Amazon S3 object storage (buckets, durability, security, events)',
      order: 10,
      stage: 'intermediate',
      summary:
        'Amazon Simple Storage Service (S3) stores objects in buckets with virtually unlimited scale. Learn bucket naming, keys and prefixes, durability and consistency models, storage classes and lifecycle, bucket policies and access control, and event-driven patterns including static website hosting and Lambda triggers.',
      officialHubs: [
        { title: 'Amazon S3 User Guide', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html' },
        { title: 'S3 security best practices', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html' },
      ],
      topics: [
        { id: 'aws-10-s3-buckets-keys-prefixes', slug: 's3-buckets-keys-prefixes', title: 'S3 buckets, object keys, and prefixes', order: 1 },
        { id: 'aws-10-s3-durability-consistency', slug: 's3-durability-consistency', title: 'S3 durability, availability, and consistency', order: 2 },
        { id: 'aws-10-s3-storage-classes', slug: 's3-storage-classes', title: 'S3 storage classes and lifecycle policies', order: 3 },
        { id: 'aws-10-s3-security-policies', slug: 's3-security-policies', title: 'S3 security — bucket policies, ACLs, and encryption', order: 4 },
        { id: 'aws-10-s3-events-hosting', slug: 's3-events-hosting', title: 'S3 event notifications and static website hosting', order: 5 },
      ],
    },
    mindmap: {
      intro:
        'S3 is object storage: buckets hold objects addressed by keys. Prefixes organize keys like folders but are not true directories. Eleven nines durability, strong read-after-write for new objects, storage classes for cost tiers, policies for access, and events for serverless pipelines.',
      overviewDiagram: {
        type: 'mermaid',
        title: 'S3 object model',
        source:
          'flowchart LR\n  B[Bucket my-app-data] --> K1[Key reports/2026/jan.csv]\n  B --> K2[Key assets/logo.png]\n  K1 --> SC[Storage class STANDARD_IA]\n  B --> POL[Bucket policy + encryption]\n  B --> EVT[Event notification to Lambda]',
      },
      conceptCards: [
        { id: 'card-keys', title: 'Keys & prefixes', summary: 'Flat namespace; prefix is key substring before delimiter. No real folders.', example: 'logs/app/2026/01/01.json — prefix logs/app/', topicSlug: 's3-buckets-keys-prefixes' },
        { id: 'card-dur', title: 'Durability', summary: '99.999999999% durability; strong consistency for new PUTs since Dec 2020.', example: 'Cross-Region Replication for DR not backup substitute', topicSlug: 's3-durability-consistency' },
        { id: 'card-class', title: 'Storage classes', summary: 'Standard, IA, Glacier tiers — lifecycle transitions by age or prefix.', example: 'Intelligent-Tiering for unknown access patterns', topicSlug: 's3-storage-classes' },
        { id: 'card-sec', title: 'Security', summary: 'Block Public Access default. Bucket policy + IAM. SSE-S3 or SSE-KMS.', example: 'Deny unencrypted PutObject in bucket policy', topicSlug: 's3-security-policies' },
        { id: 'card-events', title: 'Events & hosting', summary: 's3:ObjectCreated:* to SQS, SNS, Lambda. Static website for SPA behind CloudFront.', example: 'CSV upload triggers Lambda ETL', topicSlug: 's3-events-hosting' },
      ],
      revisionDiagram: {
        type: 'mermaid',
        title: 'S3 revision map',
        source:
          'mindmap\n  root((S3 storage))\n    Buckets keys\n      Global unique name\n      Key prefix layout\n      Multipart upload\n    Durability consistency\n      11 nines\n      Strong read after write\n      Versioning\n      CRR\n    Storage classes\n      Standard IA Glacier\n      Lifecycle rules\n      Intelligent Tiering\n    Security\n      Block public access\n      Bucket policy IAM\n      SSE KMS\n    Events hosting\n      Lambda SQS SNS\n      Static website\n      CloudFront OAC',
      },
    },
    quickOverview: {
      rememberThis: [
        'Bucket names are globally unique; keys are flat — prefixes are naming convention only.',
        'S3 guarantees 99.999999999% durability; enable versioning for accidental delete protection.',
        'Block all public access unless CloudFront OAC serves private bucket content.',
        'Lifecycle rules move prefixes to cheaper classes — Glacier retrieval has latency and cost.',
        'Event notifications are at-least-once — consumers must be idempotent.',
      ],
      bullets: [
        'Use SSE-KMS for audit trails; SSE-S3 for simplicity when KMS cost not needed.',
        'ListObjectsV2 with prefix is how you "list a folder" — no directory inode.',
        'Multipart upload required for objects > 5 GB; abort incomplete uploads via lifecycle.',
        'Static website hosting index/error documents — pair with CloudFront for HTTPS SPA.',
        'Cross-Region Replication needs versioning on source and distinct destination bucket.',
      ],
      rows: [
        { label: 'Bucket', value: 'Global unique container in a Region' },
        { label: 'Object key', value: 'Full path string identifying object within bucket' },
        { label: 'Prefix', value: 'Key substring used for organization and lifecycle filters' },
        { label: 'Storage class', value: 'Cost/retrieval profile — Standard, IA, Glacier, etc.' },
        { label: 'Version ID', value: 'Unique version when versioning enabled — delete adds delete marker' },
      ],
    },
    interview: [
      { question: 'Explain why S3 has no real folders and how you design a multi-tenant key layout.', answer: 'S3 is a flat key-value store. Slashes in keys simulate folders for console and ListObjects prefix. Design tenantId/env/module/date/file.ext prefixes for lifecycle and IAM condition keys on s3:prefix. Strong answer: never rely on delimiter alone for security — use bucket policy conditions and separate buckets for hard isolation.', followUps: ['How does S3 Inventory help?', 'When separate buckets per tenant?'], sixtySeconds: 'Flat keys with prefix convention. Tenant in key path + IAM conditions. Separate buckets for hard isolation.' },
      { question: 'A team says S3 is eventually consistent. Correct them for 2026.', answer: 'Since December 2020, S3 provides strong read-after-write consistency for PUTs and DELETEs of objects — new objects immediately readable. Overwrites and deletes are strongly consistent. Legacy interview answer about eventual consistency is outdated. Still at-least-once for event notifications and ListObjects can be paginated stale for massive buckets.', followUps: ['What about cross-region replication lag?', 'Does strong consistency apply to LIST?'], sixtySeconds: 'New object PUT strongly consistent since 2020. Events still at-least-once. CRR has replication lag.' },
      { question: 'Design lifecycle for logs: hot 30 days, warm 90 days, archive 7 years.', answer: 'Prefix logs/ rule: transition to STANDARD_IA at 30 days, GLACIER_IR or GLACIER at 90 days, DEEP_ARCHIVE at 365 days if compliance allows. Expire noncurrent versions after 2555 days if versioning on. Monitor transition costs and minimum storage duration penalties (IA 30 days, Glacier 90). Weak answer: one Glacier transition day 1 — retrieval pain.', followUps: ['Intelligent-Tiering vs explicit rules?', 'Minimum billable days on IA?'], sixtySeconds: 'Staged transitions by prefix. Watch minimum storage durations. Versioning + noncurrent expiry for compliance.' },
      { question: 'Bucket policy vs IAM policy for S3 access — when which?', answer: 'IAM identity policy grants user/role access to resources they call. Bucket policy is resource-based — required for cross-account access, CloudFront OAC Principal, deny unencrypted uploads, and public access blocks exceptions. Production uses both: IAM least privilege for app role, bucket policy for service principals and guardrails. S3 ACLs legacy — avoid except rare cross-account object ACL cases.', followUps: ['Example OAC bucket policy Principal?', 'What does Block Public Access override?'], sixtySeconds: 'IAM for identities. Bucket policy for cross-account, CloudFront OAC, deny rules. ACLs legacy.' },
      { question: 'User uploads CSV to S3; Lambda must process within seconds. Architecture?', answer: 'Enable event notification s3:ObjectCreated:Put on prefix uploads/ to Lambda. Lambda idempotent on object key + etag. For large files use S3 trigger + SQS buffer if burst exceeds concurrency. IAM: Lambda role s3:GetObject on bucket, bucket policy optional. Failure: DLQ on async invoke. Compare with polling — events are push and cheaper.', followUps: ['Can you filter by suffix .csv?', 'What about duplicate events?'], sixtySeconds: 'ObjectCreated to Lambda on prefix. Idempotent handler. SQS buffer if needed. DLQ on failures.' },
      { question: 'Static React site on S3 — why still need CloudFront?', answer: 'S3 website endpoint is HTTP only on website hosting, no WAF, no edge cache, no custom TLS on bare bucket endpoint easily. CloudFront adds HTTPS, OAC private bucket, cache, geo, WAF. SPA: custom error 403/404 to index.html. Weak: public bucket website — security and scale gap.', followUps: ['OAC vs public bucket?', 'How invalidate on deploy?'], sixtySeconds: 'CloudFront for HTTPS, OAC, cache, WAF. S3 website HTTP only. Versioned asset filenames.' },
      { question: 'Object deleted but compliance needs recovery. What S3 features apply?', answer: 'Versioning retains prior versions — delete adds delete marker. MFA Delete protects delete marker removal. Object Lock (WORM) for legal hold/compliance mode. Cross-Region Replication for geographic redundancy not undo delete without versioning. Strong: versioning + lifecycle noncurrent transition, not backup substitute for ransomware — use Object Lock and restricted IAM.', followUps: ['Compliance vs Governance mode?', 'Replication time control?'], sixtySeconds: 'Versioning + delete markers. Object Lock for WORM. CRR for DR not undelete without versions.' },
      { question: 'Cost spike on S3 GET requests. Investigation path?', answer: 'CloudWatch S3 request metrics, Storage Lens, access logs to Athena. Common causes: app polling ListObjects in loop, missing CloudFront cache, lifecycle re-listing, misconfigured sync job. Fix: CloudFront for static, S3 Select vs full download, prefix design reducing LIST scope, Intelligent-Tiering monitoring fee if enabled wrongly.', followUps: ['ListObjects cost vs GetObject?', 'When S3 Select?'], sixtySeconds: 'Metrics + access logs. Stop LIST polling. CloudFront cache static. Fix sync jobs and prefix scope.' },
    ],
  },
  {
    folder: '11-lambda-serverless',
    module: {
      id: 'aws-11-lambda-serverless',
      slug: 'lambda-serverless',
      title: 'AWS Lambda and serverless compute patterns',
      order: 11,
      stage: 'intermediate',
      summary:
        'AWS Lambda runs code without provisioning servers. Understand the execution environment and /tmp lifecycle, cold starts and provisioned concurrency, VPC ENI placement, event sources and triggers, concurrency limits with Dead Letter Queues (DLQs), and when to choose Lambda versus EC2 or AWS Fargate.',
      officialHubs: [
        { title: 'AWS Lambda developer guide', url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html' },
        { title: 'Lambda best practices', url: 'https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html' },
      ],
      topics: [
        { id: 'aws-11-lambda-execution-environment', slug: 'lambda-execution-environment', title: 'Lambda execution environment and lifecycle', order: 1 },
        { id: 'aws-11-lambda-cold-starts', slug: 'lambda-cold-starts', title: 'Lambda cold starts and provisioned concurrency', order: 2 },
        { id: 'aws-11-lambda-in-vpc', slug: 'lambda-in-vpc', title: 'Lambda in a VPC (ENIs, endpoints, cold start)', order: 3 },
        { id: 'aws-11-lambda-triggers', slug: 'lambda-triggers', title: 'Lambda triggers and event sources', order: 4 },
        { id: 'aws-11-lambda-concurrency-dlq', slug: 'lambda-concurrency-dlq', title: 'Lambda concurrency, throttling, and DLQ', order: 5 },
        { id: 'aws-11-lambda-vs-ec2-fargate', slug: 'lambda-vs-ec2-fargate', title: 'Lambda versus EC2 and Fargate — when to choose', order: 6 },
      ],
    },
    mindmap: {
      intro:
        'Lambda executes handlers in ephemeral sandboxes scaled by AWS. Cold starts initialize runtime; warm invocations reuse environment until frozen. VPC access creates ENIs. Triggers connect S3, API Gateway, SQS, EventBridge, and more. Concurrency caps and DLQs handle failure modes. Compare with long-running EC2 and containerized Fargate for sustained load.',
      overviewDiagram: {
        type: 'mermaid',
        title: 'Lambda invoke path',
        source:
          'flowchart LR\n  T[Trigger S3 API SQS] --> L[Lambda service]\n  L --> E[Execution environment]\n  E --> H[Handler code]\n  E --> VPC[VPC ENI optional]\n  H --> AWS[AWS SDK calls]\n  L --> DLQ[DLQ on async failure]',
      },
      conceptCards: [
        { id: 'card-exec', title: 'Execution env', summary: 'Frozen container reuse; /tmp 512MB–10GB; state not guaranteed across invocations.', example: 'Reuse SDK client outside handler for warm perf', topicSlug: 'lambda-execution-environment' },
        { id: 'card-cold', title: 'Cold starts', summary: 'Init runtime + handler load. Provisioned concurrency keeps environments warm.', example: 'Java/.NET larger init than Node/Python', topicSlug: 'lambda-cold-starts' },
        { id: 'card-vpc', title: 'VPC Lambda', summary: 'Hyperplane ENIs in subnets for RDS access. Needs NAT or endpoints for AWS APIs.', example: '/24 subnet sizing for peak concurrency', topicSlug: 'lambda-in-vpc' },
        { id: 'card-trig', title: 'Triggers', summary: 'Sync vs async invoke. Event source mappings poll SQS/Kinesis.', example: 'S3 ObjectCreated async with retry + DLQ', topicSlug: 'lambda-triggers' },
        { id: 'card-conc', title: 'Concurrency & DLQ', summary: 'Account and function reserved concurrency. Async failures to DLQ after retries.', example: 'Reserved concurrency=10 protects downstream DB', topicSlug: 'lambda-concurrency-dlq' },
        { id: 'card-compare', title: 'vs EC2/Fargate', summary: 'Lambda for event-driven burst; EC2/Fargate for steady TCP, long jobs, custom kernel.', example: 'WebSocket server on EC2 not Lambda', topicSlug: 'lambda-vs-ec2-fargate' },
      ],
      revisionDiagram: {
        type: 'mermaid',
        title: 'Lambda revision map',
        source:
          'mindmap\n  root((Lambda serverless))\n    Execution env\n      Sandbox reuse\n      Tmp storage\n      Init outside handler\n    Cold start\n      Provisioned concurrency\n      SnapStart Java\n      ARM Graviton2\n    VPC\n      ENI hyperplane\n      Endpoints vs NAT\n      Subnet IP planning\n    Triggers\n      Sync async\n      Event source mapping\n      S3 SQS EventBridge\n    Concurrency DLQ\n      Reserved limits\n      Throttling 429\n      Async retry DLQ\n    vs EC2 Fargate\n      Duration 15 min cap\n      WebSockets long lived\n      Fargate for containers',
      },
    },
    quickOverview: {
      rememberThis: [
        'Initialize SDK clients and connections outside the handler — reuse on warm invocations.',
        'Cold starts add init latency; provisioned concurrency pre-warms for latency-sensitive APIs.',
        'Lambda in VPC needs endpoints or NAT for most AWS APIs; plan subnet IP capacity.',
        'Async invokes retry twice then DLQ — sync invokes return errors to caller immediately.',
        '15-minute max timeout — long batch jobs often belong on Fargate or EC2.',
      ],
      bullets: [
        'Function memory scales CPU proportionally — profiling finds cost/latency sweet spot.',
        'Do not treat /tmp as durable — only for ephemeral scratch between invocations in same environment.',
        'Reserved concurrency subtracts from account pool — can throttle other functions if mis-set.',
        'Event source mapping batching improves throughput for SQS and Kinesis consumers.',
        'Lambda layers share dependencies across functions — watch deployment package size limit.',
      ],
      rows: [
        { label: 'Cold start', value: 'First invoke or after scale-out creates new execution environment' },
        { label: 'Provisioned concurrency', value: 'Pre-initialized environments ready before traffic arrives' },
        { label: 'DLQ', value: 'Queue or topic capturing failed async invocations after retries exhausted' },
        { label: 'Reserved concurrency', value: 'Guaranteed concurrent executions cap for a function' },
        { label: 'Event source mapping', value: 'Lambda polls stream or queue and invokes with batch' },
      ],
    },
    interview: [
      { question: 'Explain what persists between two Lambda invocations on the same execution environment.', answer: 'Static init code, global variables, and /tmp contents may persist until AWS recycles the environment — not guaranteed. Never rely on in-memory state for correctness. Database connection pools can reuse TCP if still open. Strong answer: design stateless handlers; externalize session to DynamoDB or ElastiCache; treat warm reuse as optimization only.', followUps: ['When is /tmp cleared?', 'Connection pool stale connections?'], sixtySeconds: 'Globals and /tmp may persist warm — not guaranteed. Stateless design. External store for session. Init outside handler for perf.' },
      { question: 'API Gateway + Lambda P99 spikes on cold starts. Mitigations?', answer: 'Provisioned concurrency on function alias, reduce package size, ARM Graviton2, SnapStart for Java, avoid VPC unless needed, keep handler lean. CloudWatch InitDuration metric proves cold contribution. Tradeoff: provisioned concurrency cost 24/7. Weak: only increase memory without measuring init.', followUps: ['SnapStart limitations?', 'Lambda@Edge cold starts?'], sixtySeconds: 'Provisioned concurrency. Smaller package. Avoid VPC if possible. InitDuration metric. ARM/SnapStart for JVM.' },
      { question: 'Lambda in VPC cannot reach S3 or DynamoDB. Fix without NAT Gateway cost?', answer: 'Add VPC gateway endpoint for S3 and interface endpoints for DynamoDB (and other APIs). Route tables for gateway endpoint automatic. SG on interface endpoints allow 443 from Lambda SG. Strong: split functions — VPC only for RDS access; public API functions outside VPC use IAM to S3.', followUps: ['Gateway vs interface endpoint?', 'Hyperplane ENI impact on cold start?'], sixtySeconds: 'S3 gateway endpoint free. Interface endpoints for DynamoDB. Or run non-VPC Lambda for AWS API calls.' },
      { question: 'S3 upload triggers Lambda twice for one file. Is that a bug?', answer: 'S3 event notifications are at-least-once — duplicates possible on retry or rare double delivery. Not a bug if handler is idempotent using object key + versionId/etag conditional write. Compare with SQS event source mapping partial batch failures. Weak: assume exactly-once from S3 events.', followUps: ['How idempotency with DynamoDB?', 'EventBridge vs S3 notification?'], sixtySeconds: 'S3 events at-least-once. Idempotent handler on key+etag. DynamoDB conditional write for dedup.' },
      { question: 'Function throttled with 429 — account limit or function limit?', answer: 'Check ConcurrentExecutions metric vs account limit (default 1000 soft). Reserved concurrency on one function reduces pool for others — can cause throttling elsewhere. Burst limits apply per Region. Fix: request limit increase, tune reserved concurrency, SQS buffer to smooth spikes, optimize duration to free concurrency faster.', followUps: ['What is unreserved concurrency?', 'Does provisioned concurrency count against limit?'], sixtySeconds: 'Check account vs reserved concurrency. 429 = no capacity. SQS buffer. Limit increase. Faster handlers free slots.' },
      { question: 'When would you reject Lambda for a new microservice?', answer: 'Sustained high QPS with minimal idle (EC2/Fargate cheaper), WebSocket/long-lived TCP, execution >15 min, custom kernel or GPU drivers, strict predictable latency without provisioned concurrency budget, legacy monolith lift without decomposition. Strong: Lambda for event-driven, spiky, short work; Fargate for containerized steady services; EC2 for full control.', followUps: ['Lambda vs Fargate cost crossover?', 'Step Functions for long workflows?'], sixtySeconds: 'Reject Lambda for long TCP, >15 min jobs, steady 24/7 load, kernel/GPU needs. Use Fargate/EC2.' },
      { question: 'Configure DLQ for async Lambda invoked by S3.', answer: 'Set DeadLetterConfig TargetArn to SQS queue or SNS topic on function. IAM lambda:SendMessage to DLQ. Async invoke retries twice (1 min, 2 min) then DLQ. Monitor DLQ depth alarm. Redrive after fix. Sync API Gateway invokes return 502 to client — different path. Event source mapping failures use separate DLQ on mapping for SQS.', followUps: ['Retry count configurable?', 'Difference mapping DLQ vs function DLQ?'], sixtySeconds: 'DeadLetterConfig on function for async. Alarms on DLQ depth. Mapping has own DLQ for poll failures.' },
      { question: 'Compare Lambda provisioned concurrency vs EC2 ASG for a Node API.', answer: 'Provisioned concurrency: no server patch burden, scales to zero possible without PC, 15 min cap, per-invoke billing + PC hourly. EC2 ASG: always-on cost, full OS control, WebSockets, predictable per-hour with Reserved Instances, you manage AMI and scaling policies. Crossover: steady traffic 24/7 often cheaper on small ASG; spiky or low traffic Lambda wins.', followUps: ['Lambda on Graviton pricing?', 'ALB vs API Gateway with Lambda?'], sixtySeconds: 'Steady load → EC2 ASG often cheaper. Spiky/short → Lambda. PC adds fixed cost. EC2 for WebSockets and long jobs.' },
    ],
  },
];

const TOPIC_DEFS = buildAllTopicDefs();

function buildAllTopicDefs() {
  const defs = {};
  for (const mod of MODULES) {
    for (const t of mod.topics ?? []) {
      if (t.glossary) {
        defs[t.id] = t;
      }
    }
  }
  Object.assign(defs, buildRemainingTopics());
  return defs;
}

function buildRemainingTopics() {
  return {
    'aws-09-eni-vpc-attachment': mkEni(),
    'aws-09-auto-scaling-groups': mkAsg(),
    'aws-09-ebs-vs-instance-store': mkEbs(),
    'aws-09-ec2-networking-troubleshoot': mkNetTrouble(),
    'aws-10-s3-buckets-keys-prefixes': mkS3Keys(),
    'aws-10-s3-durability-consistency': mkS3Durability(),
    'aws-10-s3-storage-classes': mkS3Classes(),
    'aws-10-s3-security-policies': mkS3Security(),
    'aws-10-s3-events-hosting': mkS3Events(),
    'aws-11-lambda-execution-environment': mkLambdaExec(),
    'aws-11-lambda-cold-starts': mkLambdaCold(),
    'aws-11-lambda-in-vpc': mkLambdaVpc(),
    'aws-11-lambda-triggers': mkLambdaTriggers(),
    'aws-11-lambda-concurrency-dlq': mkLambdaConcurrency(),
    'aws-11-lambda-vs-ec2-fargate': mkLambdaCompare(),
  };
}

function mkEni() {
  return {
    id: 'aws-09-eni-vpc-attachment', slug: 'eni-vpc-attachment', title: 'Elastic Network Interfaces (ENI) and VPC attachment', order: 2,
    hook: 'Every EC2 instance connects to your VPC through an Elastic Network Interface (ENI). The ENI owns the private IP, security groups, and subnet placement.',
    scenarioTag: 'vpc-troubleshoot', animationHint: 'network-flow',
    relatedTopicIds: ['aws-09-ec2-instances-amis', 'aws-09-ec2-networking-troubleshoot', 'aws-11-lambda-in-vpc'],
    glossary: { prose: 'An Elastic Network Interface (ENI) is a virtual network card in a Virtual Private Cloud (VPC) subnet. Each EC2 instance has a primary ENI (device index 0) created at launch. You can attach secondary ENIs for multi-homed designs, move ENIs between instances for failover, or assign multiple private IPv4 addresses and IPv6 addresses per ENI. Security groups attach to ENIs, not instances directly.', why: 'Lambda functions in a VPC create ENIs in subnets — scaling Lambda can exhaust IP addresses or ENI limits. Source/destination check must be disabled on firewalls and NAT instances so they can forward traffic. Misplaced ENI = wrong route table association and broken connectivity.', framing: 'Say: ENI lives in one subnet, carries SGs and MAC address. Primary ENI defines instance network identity. Secondary ENI for traffic inspection or hot standby.', entries: [{ term: 'ENI', longForm: 'Elastic Network Interface', plainDefinition: 'VPC virtual NIC with private IP, MAC, and security groups.', example: 'eni-0abc in subnet-10.0.10.0/24' }, { term: 'Primary ENI', longForm: 'Primary network interface', plainDefinition: 'Device index 0 — deleted when instance terminates.', example: 'Launched with instance in chosen subnet.' }, { term: 'Source/dest check', longForm: 'Source/destination check', plainDefinition: 'When true, instance must be source or dest of traffic — false for routers.', example: 'NAT appliance ENI needs check disabled.' }, { term: 'Trunking', longForm: 'ENA trunking', plainDefinition: 'Higher ENI density for container hosts on supported types.', example: 'ECS on EC2 with awsvpc mode.' }] },
    steps: { title: 'ENI lifecycle', items: [{ title: 'Create or launch', body: 'Primary ENI auto-created in selected subnet with primary private IP.' }, { title: 'Attach secondary', body: 'Create ENI in target subnet, attach to running instance as eth1.' }, { title: 'Apply security groups', body: 'Up to five SGs per ENI — stateful rules evaluate per ENI.' }, { title: 'Route traffic', body: 'Subnet route table associated with ENI subnet determines egress path.' }] },
    diagram: { title: 'Primary and secondary ENI', source: 'flowchart TB\n  EC2[EC2 instance]\n  EC2 --> ENI0[Primary ENI subnet A]\n  EC2 --> ENI1[Secondary ENI subnet B]\n  ENI0 --> SGA[SG app-tier]\n  ENI1 --> SGB[SG inspection]\n  ENI0 --> RTA[Route table A]\n  ENI1 --> RTB[Route table B]' },
    snippets: [
      { language: 'bash', label: 'Create and attach secondary ENI', code: 'aws ec2 create-network-interface \\\n  --subnet-id subnet-data \\\n  --groups sg-inspect\naws ec2 attach-network-interface \\\n  --network-interface-id eni-0sec \\\n  --instance-id i-0app \\\n  --device-index 1', explanation: 'Secondary ENI can live in different subnet for inspection or management plane.' },
      { language: 'bash', label: 'Disable source/dest check for NAT', code: 'aws ec2 modify-network-interface-attribute \\\n  --network-interface-id eni-0nat \\\n  --no-source-dest-check', explanation: 'Required when instance forwards packets between other hosts.' },
      { language: 'yaml', label: 'Launch template with multiple ENIs', code: 'NetworkInterfaces:\n  - DeviceIndex: 0\n    SubnetId: !Ref PrivateSubnetA\n    Groups: [!Ref AppSecurityGroup]\n  - DeviceIndex: 1\n    SubnetId: !Ref PrivateSubnetB\n    Groups: [!Ref DataSecurityGroup]', explanation: 'Defines multi-homed instance at launch — avoids manual attach race at boot.' },
      { language: 'bash', label: 'List ENIs for instance', code: 'aws ec2 describe-network-interfaces \\\n  --filters Name=attachment.instance-id,Values=i-0app \\\n  --query \'NetworkInterfaces[].{Id:NetworkInterfaceId,Subnet:SubnetId,IP:PrivateIpAddress,Device:Attachment.DeviceIndex}\'', explanation: 'First step when debugging wrong subnet or missing secondary ENI.' },
    ],
    comparisonRows: [['Network identity', 'ENI holds IP and MAC in VPC', 'Container has virtual eth inside task — like secondary ENI per task in awsvpc'], ['Security', 'SG on ENI — stateful', 'App firewall in code — no VPC SG unless deployed on EC2/ECS'], ['Mobility', 'Detach ENI, attach to standby instance', 'Blue/green by redeploying container to new host'], ['Limits', 'ENI per instance type quota', 'No ENI concept on Lambda outside VPC']],
    pitfallsBody: 'Forgetting Lambda in VPC consumes subnet IPs via ENIs. Leaving source/dest check enabled on a routing appliance. Attaching ENI in subnet without available IPs.',
    seniorProse: 'Hyperplane ENIs reduced Lambda cold start for VPC functions but still plan IP capacity (/28 subnets exhaust fast). How to prove it in production: describe-network-interfaces filtered by description "AWS Lambda" for IP burn rate; VPC Reachability Analyzer for path through multi-ENI appliance.',
    seniorRows: [['Hot standby ENI', 'Fast failover by ENI reattach', 'Manual or scripted — not automatic like Multi-AZ RDS'], ['Multiple IPs on one ENI', 'Host many TLS certs or containers', 'Complex OS-level binding'], ['ENA Express', 'Lower latency P99 on supported instances', 'Instance type and region dependent'], ['IPv6 only ENI', 'Simplifies address management', 'App and peer support required']],
    rejectionBody: "Saying security groups attach to EC2 instances — they attach to ENIs. Strong answer: primary ENI subnet sets route table; SG is stateful per ENI; Lambda VPC mode creates ENIs.",
    takeaways: ['ENI is the VPC network identity — subnet, private IP, MAC, and security groups.', 'Primary ENI is created with the instance; secondary ENIs enable multi-homed and failover patterns.', 'Disable source/dest check only on routing/NAT appliances — not ordinary app servers.', '60s: ENI in one subnet, SGs on ENI. Primary at launch. Lambda VPC burns ENIs and IPs. Source/dest off for routers only.', 'Follow-up: how does Lambda ENI scaling affect subnet sizing?'],
    pitfalls: ['Saying SG attaches to instance — rejected; SG attaches to ENI.', 'Strong answer: check ENI subnet route table and SG for each interface separately.', '/28 subnet for Lambda without calculating ENI peak concurrency.', 'Moving ENI without updating OS network config on Linux secondary interface.'],
    jsTs: [{ language: 'javascript', concept: 'Listen address binding', note: 'Node server binds 0.0.0.0 on all interfaces — on multi-ENI EC2, ensure traffic hits correct SG by binding specific private IP.', futureTopicSlug: 'aws/ec2/multi-homed' }, { language: 'typescript', concept: 'VPC Lambda ENIs', note: 'Lambda in VPC is like a headless function with hidden ENIs — unlike a long-running Express server you SSH into.', futureTopicSlug: 'aws/lambda/vpc-eni' }],
    sources: [{ title: 'Elastic network interfaces', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html' }, { title: 'Lambda VPC networking', url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html' }],
  };
}

function mkAsg() {
  return {
    id: 'aws-09-auto-scaling-groups', slug: 'auto-scaling-groups', title: 'Auto Scaling Groups (ASG) and launch configurations', order: 3,
    hook: 'An Auto Scaling Group (ASG) maintains a fleet of EC2 instances across Availability Zones — replacing unhealthy nodes and scaling on demand using launch templates and policies.',
    scenarioTag: 'high-concurrency', animationHint: 'flow',
    relatedTopicIds: ['aws-09-ec2-instances-amis', 'aws-09-ebs-vs-instance-store', 'aws-11-lambda-vs-ec2-fargate'],
    glossary: { prose: 'Amazon EC2 Auto Scaling Groups wrap EC2 instances with desired, minimum, and maximum capacity across subnets in multiple Availability Zones (AZs). Launch templates define how new instances boot. Scaling policies adjust capacity on schedules, step scaling, or target tracking (CPU, request count per target). Health checks can be EC2 status or Elastic Load Balancer (ELB) target health.', why: 'ASGs are the elasticity layer for stateless web tiers. Wrong health check type causes churn; missing connection draining drops user sessions. Senior interviews test Multi-AZ subnet selection, mixed instances policy, and instance refresh for AMI rollouts.', framing: 'Say: ASG = fleet manager across AZs. Launch template versions AMI. Target tracking for most APIs. Externalize session state.', entries: [{ term: 'ASG', longForm: 'Auto Scaling Group', plainDefinition: 'Maintains EC2 fleet size with health checks and scaling policies.', example: 'web-asg desired=6 min=3 max=12 across 3 AZs.' }, { term: 'Target tracking', longForm: 'Target tracking scaling policy', plainDefinition: 'Maintains metric near a target like 70% CPU or ALB requests per target.', example: 'ALBRequestCountPerTarget target 1000.' }, { term: 'Instance refresh', longForm: 'ASG instance refresh', plainDefinition: 'Rolling replacement of instances with new launch template version.', example: 'MinHealthyPercentage 90 during AMI deploy.' }, { term: 'Warm pool', longForm: 'ASG warm pool', plainDefinition: 'Pre-initialized stopped instances for faster scale-out.', example: 'Pool of 5 stopped instances for flash sale.' }] },
    steps: { title: 'ASG lifecycle', items: [{ title: 'Define launch template', body: 'Versioned AMI, instance type, SG, user data, IMDSv2.' }, { title: 'Create ASG', body: 'Attach subnets in multiple AZs, set desired/min/max, health check type.' }, { title: 'Attach load balancer', body: 'Register target group; set grace period for boot before health fails.' }, { title: 'Add scaling policy', body: 'Target tracking on CPU or ALB request count; optional scheduled scaling.' }] },
    diagram: { title: 'ASG with ALB', source: 'flowchart TB\n  ALB[Application Load Balancer] --> TG[Target group]\n  ASG[Auto Scaling Group] --> EC2a[EC2 AZ-a]\n  ASG --> EC2b[EC2 AZ-b]\n  TG --> EC2a\n  TG --> EC2b\n  Policy[Target tracking policy] --> ASG\n  LT[Launch template v3] --> ASG' },
    snippets: [
      { language: 'yaml', label: 'ASG with launch template and target tracking', code: 'WebAsg:\n  Type: AWS::AutoScaling::AutoScalingGroup\n  Properties:\n    MinSize: 2\n    MaxSize: 10\n    DesiredCapacity: 4\n    VPCZoneIdentifier: [!Ref PrivateSubnetA, !Ref PrivateSubnetB]\n    LaunchTemplate:\n      LaunchTemplateId: !Ref WebLaunchTemplate\n      Version: !GetAtt WebLaunchTemplate.LatestVersionNumber\n    TargetGroupARNs: [!Ref WebTargetGroup]\n    HealthCheckType: ELB\n    HealthCheckGracePeriod: 300\nWebScalingPolicy:\n  Type: AWS::AutoScaling::ScalingPolicy\n  Properties:\n    AutoScalingGroupName: !Ref WebAsg\n    PolicyType: TargetTrackingScaling\n    TargetTrackingConfiguration:\n      PredefinedMetricSpecification:\n        PredefinedMetricType: ALBRequestCountPerTarget\n      TargetValue: 1000', explanation: 'ELB health check replaces instances failing target group checks. Grace period allows boot before evaluation.' },
      { language: 'bash', label: 'Start instance refresh', code: 'aws autoscaling start-instance-refresh \\\n  --auto-scaling-group-name web-asg \\\n  --preferences \'{"MinHealthyPercentage":90,"InstanceWarmup":300}\'', explanation: 'Rolls new launch template version without manual instance termination.' },
      { language: 'bash', label: 'Describe scaling activities', code: 'aws autoscaling describe-scaling-activities \\\n  --auto-scaling-group-name web-asg \\\n  --max-records 10 \\\n  --query \'Activities[].{Status:StatusCode,Cause:Cause,Time:StartTime}\'', explanation: 'Shows why instances launched or terminated — first step when ASG churns.' },
      { language: 'bash', label: 'Set desired capacity', code: 'aws autoscaling set-desired-capacity \\\n  --auto-scaling-group-name web-asg \\\n  --desired-capacity 8 \\\n  --honor-cooldown', explanation: 'Manual scale for drills; policies normally adjust automatically.' },
    ],
    comparisonRows: [['Scale trigger', 'CloudWatch metric or schedule', 'HPA in Kubernetes or manual pm2 cluster'], ['Health', 'ELB or EC2 status checks', 'K8s liveness probe restarts pod'], ['Replacement', 'New EC2 from launch template', 'New container on existing or new node'], ['State', 'Instances ephemeral — externalize sessions', 'In-memory session lost on pod restart unless sticky + store']],
    pitfallsBody: 'Single-AZ ASG loses Availability Zone failure resilience. ELB health check with grace period zero terminates instances mid-boot. Sticky sessions without shared store break on scale-in.',
    seniorProse: 'Mixed instances policy combines On-Demand base with Spot for cost — capacity-optimized allocation reduces interruption. How to prove it in production: CloudWatch GroupDesiredCapacity vs InServiceInstances, UnHealthyHostCount on target group, and ScalingActivities for replacement causes.',
    seniorRows: [['Target tracking ALB', 'Request-based scale for web', 'Needs healthy target registration'], ['Spot in ASG', 'Up to 90% savings for stateless', 'Interruption handling required'], ['Warm pool', 'Fast scale-out', 'Cost for stopped EBS volumes'], ['Lifecycle hooks', 'Drain connections before terminate', 'Complex automation via SSM or Lambda']],
    rejectionBody: "Saying ASG health check EC2 is enough for ALB-backed apps — ELB health check required when traffic flows through load balancer. Strong answer: Multi-AZ subnets, grace period, external session store.",
    takeaways: ['ASG spans multiple AZ subnets for high availability.', 'Use launch templates and instance refresh for versioned AMI rollouts.', 'Match health check type to traffic path — ELB for ALB-backed apps.', '60s: Multi-AZ ASG + launch template + ELB health + grace period. External sessions. Target tracking scale.', 'Follow-up: how does warm pool change scale-out latency?'],
    pitfalls: ['Single AZ ASG — rejected in HA interviews.', 'Strong answer: min 2 AZ subnets, desired spread, AZ rebalance enabled.', 'Relying on sticky sessions without Redis/DynamoDB session store.', 'Using deprecated launch configurations for new builds.'],
    jsTs: [{ language: 'javascript', concept: 'PM2 cluster vs ASG', note: 'PM2 cluster scales processes on one VM; ASG scales VMs behind ALB — different failure domain and cost model.', futureTopicSlug: 'aws/ec2/scaling' }, { language: 'typescript', concept: 'Graceful shutdown', note: 'SIGTERM handler in Node drains connections — ASG lifecycle hook can delay terminate until drain completes, like server.close() before exit.', futureTopicSlug: 'aws/ec2/lifecycle-hooks' }],
    sources: [{ title: 'Auto Scaling groups', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html' }, { title: 'Target tracking scaling policies', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html' }],
  };
}

function mkEbs() {
  return {
    id: 'aws-09-ebs-vs-instance-store', slug: 'ebs-vs-instance-store', title: 'EBS volumes versus instance store (ephemeral)', order: 4,
    hook: 'Elastic Block Store (EBS) is network-attached durable block storage; instance store is physically local NVMe that disappears when the instance stops or terminates.',
    scenarioTag: 'datasync-migration', animationHint: 'compare',
    relatedTopicIds: ['aws-09-ec2-instances-amis', 'aws-09-auto-scaling-groups', 'aws-10-s3-storage-classes'],
    glossary: { prose: 'Amazon Elastic Block Store (EBS) volumes attach to EC2 over the network — gp3, io2, st1, sc1 types with snapshots and encryption. Instance store volumes come with specific instance types as local NVMe disks — highest IOPS and lowest latency but ephemeral. Root volume is usually EBS; instance store appears as additional block devices mapped at launch.', why: 'Choosing wrong storage causes data loss on stop/terminate or insufficient IOPS for databases. Snapshots enable backup and AMI creation for EBS only. Interview scenarios pit cost, durability, and performance tradeoffs.', framing: 'Say: EBS = durable network disk with snapshots. Instance store = fast ephemeral — only with replication or cache workloads.', entries: [{ term: 'EBS', longForm: 'Elastic Block Store', plainDefinition: 'Network block storage persisting independently of instance lifecycle.', example: 'gp3 100 GiB encrypted root volume.' }, { term: 'Instance store', longForm: 'EC2 instance store', plainDefinition: 'Local NVMe/SSD tied to hardware — lost on stop or terminate.', example: 'i3.large exposes 475 GB NVMe instance store.' }, { term: 'gp3', longForm: 'General Purpose SSD gp3', plainDefinition: 'Default EBS type — baseline IOPS and throughput configurable.', example: '3000 IOPS / 125 MB/s baseline on gp3.' }, { term: 'Snapshot', longForm: 'EBS snapshot', plainDefinition: 'Incremental point-in-time backup stored in S3.', example: 'Daily snapshot lifecycle to warm archive.' }] },
    steps: { title: 'Pick storage for workload', items: [{ title: 'Durability requirement', body: 'Sole copy of data → EBS with snapshots. Cache/scratch → instance store OK.' }, { title: 'Performance profile', body: 'Benchmark IOPS/latency — io2 for sustained DB, instance store for Kafka/Cassandra.' }, { title: 'Lifecycle', body: 'Stop/start preserves EBS; instance store cleared on stop for most types.' }, { title: 'Encrypt and attach', body: 'Enable encryption at rest with AWS KMS; attach data volumes at launch or runtime.' }] },
    diagram: { title: 'EBS vs instance store attachment', source: 'flowchart LR\n  EC2[EC2 instance]\n  EC2 --> EBS[EBS gp3 root\\npersists stop/start]\n  EC2 --> IS[Instance store NVMe\\nephemeral]\n  EBS --> SNAP[EBS snapshot]\n  IS --> X[Lost on stop/terminate]' },
    snippets: [
      { language: 'bash', label: 'Create encrypted gp3 volume and attach', code: 'VOL=$(aws ec2 create-volume \\\n  --availability-zone ap-south-1a \\\n  --size 100 \\\n  --volume-type gp3 \\\n  --encrypted \\\n  --query VolumeId --output text)\naws ec2 attach-volume \\\n  --volume-id $VOL \\\n  --instance-id i-0app \\\n  --device /dev/sdf', explanation: 'Volume AZ must match instance AZ. Encrypt by default in production.' },
      { language: 'bash', label: 'Snapshot EBS volume', code: 'aws ec2 create-snapshot \\\n  --volume-id vol-0data \\\n  --description "nightly-db-backup"\naws ec2 describe-snapshots --owner-ids self --filters Name=volume-id,Values=vol-0data', explanation: 'Snapshots are incremental and stored durably — basis for DR and AMI.' },
      { language: 'yaml', label: 'Launch template block device mappings', code: 'BlockDeviceMappings:\n  - DeviceName: /dev/xvda\n    Ebs:\n      VolumeSize: 50\n      VolumeType: gp3\n      Encrypted: true\n      DeleteOnTermination: true\n  - DeviceName: /dev/xvdb\n    Ebs:\n      VolumeSize: 500\n      VolumeType: io2\n      Iops: 10000', explanation: 'Root gp3 plus io2 data volume. Instance store types use VirtualName not Ebs block.' },
      { language: 'bash', label: 'List instance store devices', code: 'aws ec2 describe-instance-types \\\n  --instance-types i3.large \\\n  --query \'InstanceTypes[0].InstanceStorageInfo\'', explanation: 'Confirm instance store presence before relying on local NVMe.' },
    ],
    comparisonRows: [['Durability', 'EBS survives stop/start', 'Instance store lost on stop/terminate'], ['Performance', 'Network latency — gp3/io2 tunable', 'Local NVMe — lowest latency'], ['Backup', 'Snapshots and AMIs', 'No snapshot — replicate in app'], ['Resize', 'Modify volume size/type online', 'Fixed at instance type']],
    pitfallsBody: 'Storing sole database copy on instance store. Forgetting DeleteOnTermination=false loses data volumes on terminate. io1/io2 cost surprise without IOPS planning.',
    seniorProse: 'Multi-Attach io2 only for clustered filesystems (Oracle RAC patterns). How to prove it in production: CloudWatch VolumeQueueLength, VolumeReadOps/WriteOps, and fio benchmarks before production cutover.',
    seniorRows: [['gp3 baseline', 'Cost-effective general purpose', 'Network latency vs local NVMe'], ['io2 Block Express', 'Highest EBS IOPS', 'Premium cost per IOPS'], ['Instance store RAID0', 'Max throughput scratch', 'No durability — node loss = data loss'], ['EBS-optimized instances', 'Dedicated EBS bandwidth', 'Required for high IOPS workloads']],
    rejectionBody: "Putting production database on instance store without replication gets rejected. Strong answer: EBS io2 + snapshots, or instance store only for replicated shards.",
    takeaways: ['EBS persists across stop/start; instance store is ephemeral on most instance types.', 'Snapshots and encryption apply to EBS — not instance store.', 'Match volume type to IOPS needs — gp3 default, io2 for databases.', '60s: EBS durable + snapshots. Instance store fast ephemeral. DB on EBS or replicated on local NVMe.', 'Follow-up: what happens to instance store on reboot vs stop?'],
    pitfalls: ['Database on instance store as sole copy — rejected.', 'Strong answer: EBS with snapshots or Cassandra/Kafka style replication on local disk.', 'Assuming all instance types have instance store.', 'Ignoring DeleteOnTermination on data EBS volumes.'],
    jsTs: [{ language: 'javascript', concept: 'Temp files vs persistent disk', note: 'os.tmpdir() on EC2 is local disk — like instance store scratch. EBS mounted /data is durable like a persistent volume in k8s.', futureTopicSlug: 'aws/ec2/storage' }, { language: 'typescript', concept: 'Log rotation on ephemeral disk', note: 'Writing logs to instance store risks loss on replace — ship to CloudWatch Logs or S3 like centralized logging in Node apps.', futureTopicSlug: 'aws/ec2/logging' }],
    sources: [{ title: 'Amazon EBS volume types', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-volume-types.html' }, { title: 'EC2 instance store', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html' }],
  };
}

function mkNetTrouble() {
  return {
    id: 'aws-09-ec2-networking-troubleshoot', slug: 'ec2-networking-troubleshoot', title: 'EC2 networking troubleshooting playbook', order: 5,
    hook: 'When an EC2 instance cannot be reached, debug outside-in: routing, Network ACLs (NACLs), security groups, ENI placement, then the operating system firewall.',
    scenarioTag: 'vpc-troubleshoot', animationHint: 'request-path',
    relatedTopicIds: ['aws-09-eni-vpc-attachment', 'aws-11-lambda-in-vpc', 'aws-11-lambda-triggers'],
    glossary: { prose: 'EC2 networking failures stem from layered controls: subnet route tables (Internet Gateway, NAT Gateway, VPC endpoints), stateless NACLs at subnet boundary, stateful security groups on ENIs, Elastic IP versus public IP assignment, and host iptables or Windows firewall. VPC Flow Logs and Reachability Analyzer provide evidence.', why: 'Random SG edits cause outages. Senior engineers follow a checklist instead of guessing. Same layers apply to Lambda in VPC reaching RDS.', framing: 'Say: route table proves path, NACL stateless both directions, SG stateful on ENI, then OS. Use Reachability Analyzer before SSH guessing.', entries: [{ term: 'Flow Logs', longForm: 'VPC Flow Logs', plainDefinition: 'Captures accepted/rejected IP traffic for VPC, subnet, or ENI.', example: 'REJECT count spikes on NACL deny rule.' }, { term: 'NACL', longForm: 'Network Access Control List', plainDefinition: 'Stateless subnet-level allow/deny rules with numbered priority.', example: 'Deny inbound 22 from 0.0.0.0/0 at NACL layer.' }, { term: 'Reachability Analyzer', longForm: 'VPC Reachability Analyzer', plainDefinition: 'Tests whether path between source and destination is allowed.', example: 'Prove ALB can reach EC2 on port 8080.' }, { term: 'Ephemeral ports', longForm: 'TCP ephemeral return ports', plainDefinition: 'Return traffic uses high ports — NACL must allow ephemeral range.', example: 'NACL outbound 1024-65535 for established connections.' }] },
    steps: { title: 'Outside-in debug order', items: [{ title: 'Confirm ENI subnet and IP', body: 'Primary ENI in intended subnet with correct private or public IP.' }, { title: 'Route table', body: 'Public: 0.0.0.0/0 → IGW. Private egress: NAT or endpoints.' }, { title: 'NACL then SG', body: 'NACL inbound/outbound allow required ports and ephemeral return.' }, { title: 'Application listen', body: 'Process bound to 0.0.0.0:port; OS firewall allows; target group port matches.' }] },
    diagram: { title: 'Troubleshoot layers', source: 'flowchart TB\n  Client[Client] --> IGW[Internet Gateway]\n  IGW --> RT[Route table]\n  RT --> NACL[NACL subnet]\n  NACL --> SG[Security group ENI]\n  SG --> OS[OS firewall + app listen]\n  Flow[VPC Flow Logs] -.-> NACL\n  Reach[VPC Reachability Analyzer] -.-> SG' },
    snippets: [
      { language: 'bash', label: 'VPC Reachability Analyzer path', code: 'aws ec2 create-network-insights-path \\\n  --source ip=10.0.1.5 \\\n  --destination ip=10.0.10.20,port=8080,protocol=tcp\naws ec2 start-network-insights-analysis \\\n  --network-insights-path-id nip-0abc', explanation: 'Proves whether routing and SG allow path before packet capture.' },
      { language: 'bash', label: 'Enable VPC Flow Logs', code: 'aws ec2 create-flow-logs \\\n  --resource-type NetworkInterface \\\n  --resource-ids eni-0app \\\n  --traffic-type REJECT \\\n  --log-destination-type cloud-watch-logs \\\n  --log-group-name /vpc/flow/reject', explanation: 'Filter REJECT first to find NACL or SG blocks quickly.' },
      { language: 'bash', label: 'Describe SG rules for ENI', code: 'aws ec2 describe-network-interfaces --network-interface-ids eni-0app \\\n  --query \'NetworkInterfaces[0].Groups\'\naws ec2 describe-security-groups --group-ids sg-0web', explanation: 'SG is stateful — confirm inbound and that return egress is allowed (default allow all egress).' },
      { language: 'bash', label: 'Test from instance with curl and ss', code: 'curl -s --connect-timeout 2 http://169.254.169.254/latest/meta-data/\nss -tlnp | grep 8080\nsudo iptables -L -n', explanation: 'On-instance checks: app listening, local firewall, metadata reachable (IMDS).' },
    ],
    comparisonRows: [['Layer', 'AWS VPC controls', 'Node.js app debugging'], ['Routing', 'Route table + IGW/NAT', 'Wrong HOST env or bind address'], ['Firewall', 'SG stateful, NACL stateless', 'No built-in — rely on VPC SG on EC2'], ['Evidence', 'Flow Logs, Reachability Analyzer', 'tcpdump, curl, netstat/ss']],
    pitfallsBody: 'Editing SG without checking NACL ephemeral return. Assuming public IP without IGW route. Debugging SSH when SSM Session Manager is the production access path.',
    seniorProse: 'Asymmetric routing breaks NACL return path — common with multi-ENI appliances. How to prove it in production: Flow Logs REJECT reason, Reachability Analyzer failed component, and TargetGroup UnHealthyHostCount correlated with deploy.',
    seniorRows: [['Flow Logs REJECT only', 'Fast signal on blocks', 'Volume and cost at full capture'], ['Reachability Analyzer', 'Pre-change validation', 'Not real-time continuous monitor'], ['SSM Session Manager', 'No inbound SSH required', 'IAM and VPC endpoints needed'], ['Traffic Mirroring', 'Deep packet inspection', 'Complex setup']],
    rejectionBody: "Opening SG 0.0.0.0/0 SSH as first fix gets rejected. Strong answer: layered checklist, Reachability Analyzer, SSM access, least privilege SG.",
    takeaways: ['Debug outside-in: route → NACL → SG → OS → application listen port.', 'NACLs are stateless — allow ephemeral return ports.', 'VPC Flow Logs and Reachability Analyzer provide evidence, not guesses.', '60s: Route IGW/NAT, NACL both ways, SG on ENI, app listens. Flow Logs REJECT. SSM not SSH.', 'Follow-up: why does NACL block work when SG allows?'],
    pitfalls: ['Fixing only SG when NACL blocks ephemeral return — weak answer.', 'Strong answer: check NACL inbound and outbound rules with ephemeral port range.', 'Public IP on instance in private subnet route table — no IGW path.', 'ALB health check port mismatch with app listen port.'],
    jsTs: [{ language: 'javascript', concept: 'app.listen port binding', note: 'Express app.listen(8080, "0.0.0.0") — binding localhost only breaks ALB health checks, like SG allowing traffic ENI never receives.', futureTopicSlug: 'aws/ec2/app-networking' }, { language: 'typescript', concept: 'Health check endpoint', note: '/health route must respond before ASG grace expires — similar to k8s readiness probe timing.', futureTopicSlug: 'aws/ec2/health-checks' }],
    sources: [{ title: 'VPC Flow Logs', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html' }, { title: 'Reachability Analyzer', url: 'https://docs.aws.amazon.com/vpc/latest/reachability/what-is-reachability-analyzer.html' }],
  };
}

function mkS3Keys() {
  return {
    id: 'aws-10-s3-buckets-keys-prefixes', slug: 's3-buckets-keys-prefixes', title: 'S3 buckets, object keys, and prefixes', order: 1,
    hook: 'An S3 bucket is a globally unique container; object keys are flat strings where prefixes like logs/2026/ organize data without real folders.',
    scenarioTag: 'saas-tenant-routing', animationHint: 'region-map',
    relatedTopicIds: ['aws-10-s3-durability-consistency', 'aws-10-s3-security-policies', 'aws-11-lambda-triggers'],
    glossary: { prose: 'Amazon S3 stores objects in buckets within an AWS Region. Bucket names are globally unique across all AWS accounts. Each object is identified by a key — a UTF-8 string that can include slashes to simulate folder hierarchy. Prefix is the substring before the delimiter for ListObjectsV2 filtering. There is no atomic rename — copy then delete.', why: 'Key layout affects lifecycle rules, IAM condition keys, and query performance. Multi-tenant SaaS often embeds tenantId in prefix. Wrong mental model of folders causes access and listing cost issues.', framing: 'Say: flat keys, prefix convention, ListObjects with delimiter for console tree view. Design keys for lifecycle and IAM s3:prefix conditions.', entries: [{ term: 'Bucket', longForm: 'S3 bucket', plainDefinition: 'Regional container with globally unique name holding objects.', example: 'my-company-data-prod-ap-south-1.' }, { term: 'Object key', longForm: 'S3 object key', plainDefinition: 'Unique string identifier for object within bucket.', example: 'tenants/acme/invoices/2026-01.pdf.' }, { term: 'Prefix', longForm: 'S3 key prefix', plainDefinition: 'Leading portion of key used for list filters and lifecycle.', example: 'tenants/acme/ lists all acme objects.' }, { term: 'Delimiter', longForm: 'ListObjects delimiter', plainDefinition: 'Character (usually /) grouping common prefixes in list response.', example: 'Delimiter / returns CommonPrefixes like tenants/acme/.' }] },
    steps: { title: 'Design key namespace', items: [{ title: 'Choose bucket boundary', body: 'Per env or per tenant isolation — separate buckets for hard boundaries.' }, { title: 'Define key pattern', body: 'tenantId/env/category/date/fileId.ext for lifecycle and IAM.' }, { title: 'Upload object', body: 'PutObject with key, optional metadata, storage class.' }, { title: 'List by prefix', body: 'ListObjectsV2 with Prefix and Delimiter — avoid full bucket scan.' }] },
    diagram: { title: 'Flat keys with prefix layout', source: 'flowchart TB\n  B[Bucket prod-data]\n  B --> K1[tenants/t1/reports/jan.csv]\n  B --> K2[tenants/t2/reports/jan.csv]\n  B --> K3[system/config/app.json]\n  P[Prefix tenants/t1/] -.-> K1' },
    snippets: [
      { language: 'bash', label: 'Create bucket and upload object', code: 'aws s3 mb s3://my-app-data-prod-123456789012-ap-south-1\naws s3 cp ./report.csv s3://my-app-data-prod-123456789012-ap-south-1/tenants/acme/reports/2026/report.csv', explanation: 'Bucket name must be globally unique. Key includes full logical path.' },
      { language: 'bash', label: 'List objects by prefix', code: 'aws s3api list-objects-v2 \\\n  --bucket my-app-data-prod-123456789012-ap-south-1 \\\n  --prefix tenants/acme/ \\\n  --delimiter / \\\n  --query \'{Keys:Contents[].Key,Prefixes:CommonPrefixes[].Prefix}\'', explanation: 'Delimiter groups pseudo-folders. Avoid listing entire bucket in hot paths.' },
      { language: 'yaml', label: 'CloudFormation S3 bucket', code: 'DataBucket:\n  Type: AWS::S3::Bucket\n  Properties:\n    BucketName: !Sub "${AWS::AccountId}-app-data-${AWS::Region}"\n    PublicAccessBlockConfiguration:\n      BlockPublicAcls: true\n      BlockPublicPolicy: true\n      IgnorePublicAcls: true\n      RestrictPublicBuckets: true', explanation: 'Block public access by default. Bucket name often includes account and region.' },
      { language: 'json', label: 'IAM condition on prefix', code: '{\n  "Effect": "Allow",\n  "Action": ["s3:GetObject", "s3:PutObject"],\n  "Resource": "arn:aws:s3:::my-bucket/tenants/${aws:PrincipalTag/tenantId}/*"\n}', explanation: 'Restrict principals to tenant prefix using session tags or IAM paths.' },
    ],
    comparisonRows: [['Namespace', 'Flat keys with prefix convention', 'Filesystem directories with inodes'], ['Listing', 'ListObjectsV2 paginated API', 'readdir — cheap locally, costly at scale in S3'], ['Rename', 'CopyObject + DeleteObject', 'fs.rename atomic on same volume'], ['Glob', 'No native glob — prefix filter only', 'glob npm package on local FS']],
    pitfallsBody: 'Treating console folders as real directories for permissions. Listing entire bucket in a loop — expensive and slow. Special characters in keys without URL encoding.',
    seniorProse: 'S3 Express One Zone for low-latency high-QPS within AZ — different bucket type. How to prove it in production: S3 Storage Lens top prefixes by request count, and CloudWatch NumberOfObjects per prefix via inventory.',
    seniorRows: [['Prefix per tenant', 'IAM and lifecycle scoping', 'Noisy neighbor LIST cost'], ['Separate buckets', 'Hard isolation', 'Operational overhead'], ['Hash prefix shard', 'Avoid hot partition on prefix', 'Key readability tradeoff'], ['S3 Inventory', 'Audit object metadata', 'Daily CSV delivery lag']],
    rejectionBody: "Saying S3 has folders like POSIX directories gets rejected. Strong answer: flat keys, prefix design, ListObjects with delimiter, IAM on prefix.",
    takeaways: ['Bucket names are globally unique; keys are flat strings.', 'Use prefix layout for tenant, env, and lifecycle — not real folders.', 'ListObjectsV2 with prefix/delimiter — never scan whole bucket in app hot path.', '60s: Flat keys. Prefix tenant/env/date. List with prefix. Separate buckets for hard isolation.', 'Follow-up: how do you secure multi-tenant keys?'],
    pitfalls: ['Believing folders enforce access — weak; IAM and bucket policy enforce access.', 'Strong answer: prefix in key + IAM condition + optional bucket per tenant.', 'Full bucket ListObjects in polling loop — cost and throttling.', 'Unencoded spaces and special chars breaking CloudFront origin paths.'],
    jsTs: [{ language: 'javascript', concept: 'path.join vs S3 key', note: 'Use string template for S3 keys — path.join uses OS separators. Keys always use forward slash.', futureTopicSlug: 'aws/s3/key-design' }, { language: 'typescript', concept: '@aws-sdk/client-s3 ListObjectsV2', note: 'Paginate with ContinuationToken — like async iterator over large arrays, do not assume single response.', futureTopicSlug: 'aws/s3/listing' }],
    sources: [{ title: 'Amazon S3 objects', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html' }, { title: 'Listing objects', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/ListingKeysUsingAPIs.html' }],
  };
}

function mkS3Durability() {
  return {
    id: 'aws-10-s3-durability-consistency', slug: 's3-durability-consistency', title: 'S3 durability, availability, and consistency', order: 2,
    hook: 'S3 promises 99.999999999% (11 nines) durability and strong read-after-write consistency for new objects — but versioning and replication still matter for operational recovery.',
    scenarioTag: 'datasync-migration', animationHint: 'timeline',
    relatedTopicIds: ['aws-10-s3-buckets-keys-prefixes', 'aws-10-s3-storage-classes', 'aws-10-s3-security-policies'],
    glossary: { prose: 'Amazon S3 replicates data across multiple facilities in a Region for durability. Availability SLA varies by storage class. Since December 2020, S3 provides strong read-after-write consistency for PUTs of new objects and overwrite PUTs and DELETEs. Versioning keeps multiple versions of an object; delete markers hide current version without purging history.', why: 'Interviewers still cite outdated eventual consistency. Versioning protects against accidental delete and overwrite. Cross-Region Replication (CRR) is DR geography, not a substitute for versioning within Region.', framing: 'Say: 11 nines durability in Region, strong consistency for new objects since 2020, versioning for ops recovery, CRR for geographic DR.', entries: [{ term: 'Durability', longForm: 'S3 durability', plainDefinition: 'Probability object persists — 99.999999999% over a year.', example: 'AWS manages replication — you do not pick AZ for Standard.' }, { term: 'Versioning', longForm: 'S3 versioning', plainDefinition: 'Keeps all versions of object; delete creates delete marker.', example: 'Restore previous version after accidental overwrite.' }, { term: 'CRR', longForm: 'Cross-Region Replication', plainDefinition: 'Async copy of objects to bucket in another Region.', example: 'us-east-1 to eu-west-1 for DR read access.' }, { term: 'Delete marker', longForm: 'S3 delete marker', plainDefinition: 'Zero-byte marker hiding current version when versioning on.', example: 'List shows deleted until marker removed.' }] },
    steps: { title: 'Protect object data', items: [{ title: 'Enable versioning', body: 'Required for replication and accidental delete recovery.' }, { title: 'Understand consistency', body: 'New PUT immediately readable; LIST may paginate large buckets.' }, { title: 'Configure replication', body: 'CRR rule with IAM role; destination bucket policy allows replication.' }, { title: 'Lifecycle noncurrent', body: 'Transition or expire old versions to control cost.' }] },
    diagram: { title: 'Versioning and replication', source: 'flowchart LR\n  PUT[PutObject v1] --> B[Bucket source]\n  B --> V[Version 1 stored]\n  PUT2[PutObject v2] --> V2[Version 2 current]\n  B --> CRR[Cross-Region Replication]\n  CRR --> DR[Bucket destination Region B]' },
    snippets: [
      { language: 'bash', label: 'Enable bucket versioning', code: 'aws s3api put-bucket-versioning \\\n  --bucket my-app-data \\\n  --versioning-configuration Status=Enabled\naws s3api get-bucket-versioning --bucket my-app-data', explanation: 'Once enabled, only suspended — not fully disabled without deleting versions.' },
      { language: 'bash', label: 'List object versions', code: 'aws s3api list-object-versions \\\n  --bucket my-app-data \\\n  --prefix reports/2026/jan.csv', explanation: 'Shows version IDs and delete markers for recovery.' },
      { language: 'yaml', label: 'CRR rule in CloudFormation', code: 'ReplicationConfiguration:\n  Role: !GetAtt ReplicationRole.Arn\n  Rules:\n    - Id: ReplicateAll\n      Status: Enabled\n      Priority: 1\n      Filter: {}\n      DeleteMarkerReplication:\n        Status: Enabled\n      Destination:\n        Bucket: !Sub arn:aws:s3:::${DestBucket}\n        StorageClass: STANDARD', explanation: 'Requires versioning on source and destination. Replication is asynchronous.' },
      { language: 'bash', label: 'Restore previous version', code: 'aws s3api copy-object \\\n  --bucket my-app-data \\\n  --copy-source my-app-data/reports/jan.csv?versionId=abc123VERSION \\\n  --key reports/jan.csv', explanation: 'Copy old version over current to restore without deleting history.' },
    ],
    comparisonRows: [['Consistency', 'Strong read-after-write new objects', 'MongoDB read concern / Postgres MVCC different model'], ['Delete', 'Delete marker with versioning', 'fs.unlink permanent unless backup'], ['Geo copy', 'CRR async to another Region', 'Manual rsync or DB replication lag'], ['Backup', 'Versioning + lifecycle', 'pg_dump scheduled backup']],
    pitfallsBody: 'Assuming delete removes data when versioning enabled — only adds delete marker. CRR without versioning on source fails. Expecting instant cross-Region read after write in source Region.',
    seniorProse: 'S3 Replication Time Control (RTC) SLA for predictable CRR lag. Object Lock WORM for compliance immutability. How to prove it in production: S3 Inventory version counts, replication metrics ReplicationLatency, and restore drill from delete marker.',
    seniorRows: [['Versioning only', 'Accidental delete recovery', 'Storage cost for all versions'], ['CRR + RTC', 'Geographic DR with SLA', 'Duplicate storage cost'], ['Object Lock', 'Regulatory immutability', 'Cannot delete until retention expires'], ['MFA Delete', 'Protect version purge', 'Operational friction']],
    rejectionBody: "Saying S3 is eventually consistent in 2026 gets rejected. Strong answer: strong for new PUTs since Dec 2020; versioning; CRR async.",
    takeaways: ['11 nines durability — AWS manages within Region.', 'Strong read-after-write for new object PUTs since December 2020.', 'Versioning enables undelete; delete marker hides current version.', '60s: Strong consistency new objects. Versioning for ops recovery. CRR async DR. Not backup alone.', 'Follow-up: difference delete marker and permanent delete?'],
    pitfalls: ['Outdated eventual consistency answer — rejected in modern interviews.', 'Strong answer: strong since 2020; LIST still paginate carefully at scale.', 'CRR without versioning enabled on source bucket.', 'No lifecycle on noncurrent versions — unbounded storage cost.'],
    jsTs: [{ language: 'javascript', concept: 'Immutable data patterns', note: 'Storing content-addressed keys (hash in filename) like git blobs — new version is new key, similar to S3 versioning without overwrite.', futureTopicSlug: 'aws/s3/immutable-keys' }, { language: 'typescript', concept: 'Optimistic concurrency', note: 'If-Match with versionId on CopyObject — like ETag checks in REST APIs for conflict detection.', futureTopicSlug: 'aws/s3/concurrency' }],
    sources: [{ title: 'S3 data consistency', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html#ConsistencyModel' }, { title: 'Versioning', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html' }],
  };
}

function mkS3Classes() {
  return {
    id: 'aws-10-s3-storage-classes', slug: 's3-storage-classes', title: 'S3 storage classes and lifecycle policies', order: 3,
    hook: 'S3 storage classes trade cost against retrieval latency — lifecycle rules automate transition from Standard to IA, Glacier, or Deep Archive.',
    scenarioTag: 'csv-import', animationHint: 'timeline',
    relatedTopicIds: ['aws-10-s3-durability-consistency', 'aws-10-s3-events-hosting', 'aws-09-ebs-vs-instance-store'],
    glossary: { prose: 'Amazon S3 Standard is default for frequent access. Standard-IA and One Zone-IA reduce cost for infrequent access with retrieval fee. Glacier Instant Retrieval, Flexible Retrieval, and Deep Archive archive tiers with minutes to hours retrieval. Intelligent-Tiering moves objects automatically. Lifecycle configuration transitions or expires by prefix and age.', why: 'Logs and backups accumulate — lifecycle prevents runaway Standard storage bills. Minimum storage duration charges apply when leaving IA or Glacier early. Wrong class causes retrieval latency in production incidents.', framing: 'Say: match access pattern to class. Lifecycle by prefix age. Watch minimum billable days and retrieval costs.', entries: [{ term: 'Standard-IA', longForm: 'S3 Standard-Infrequent Access', plainDefinition: 'Lower storage cost, retrieval fee, 30-day minimum.', example: 'Monthly reports accessed once a quarter.' }, { term: 'Glacier IR', longForm: 'S3 Glacier Instant Retrieval', plainDefinition: 'Archive with millisecond retrieval, higher storage cost than Flexible.', example: 'Medical images rarely accessed but need instant when needed.' }, { term: 'Lifecycle rule', longForm: 'S3 lifecycle configuration', plainDefinition: 'Automated transition or expiration based on age and prefix.', example: 'logs/ prefix to Glacier at 90 days, expire at 365.' }, { term: 'Intelligent-Tiering', longForm: 'S3 Intelligent-Tiering', plainDefinition: 'Auto-moves between frequent and infrequent tiers by access.', example: 'Unknown access pattern datasets.' }] },
    steps: { title: 'Lifecycle automation', items: [{ title: 'Classify data', body: 'Hot (Standard), warm (IA), cold (Glacier), archive (Deep Archive).' }, { title: 'Define prefix rules', body: 'Separate rules for logs/, backups/, assets/.' }, { title: 'Set transitions', body: 'Day 30 to IA, day 90 Glacier, expire noncurrent versions.' }, { title: 'Monitor', body: 'Storage Lens and cost explorer for early transition penalties.' }] },
    diagram: { title: 'Lifecycle transitions', source: 'flowchart LR\n  STD[Standard] -->|30 days| IA[Standard-IA]\n  IA -->|90 days| GL[Glacier Flexible]\n  GL -->|365 days| DA[Deep Archive]\n  NC[Noncurrent versions] -->|expire 90d| X[Deleted]' },
    snippets: [
      { language: 'json', label: 'Lifecycle configuration', code: '{\n  "Rules": [{\n    "ID": "logs-tiering",\n    "Status": "Enabled",\n    "Filter": { "Prefix": "logs/" },\n    "Transitions": [\n      { "Days": 30, "StorageClass": "STANDARD_IA" },\n      { "Days": 90, "StorageClass": "GLACIER" }\n    ],\n    "Expiration": { "Days": 2555 },\n    "NoncurrentVersionTransitions": [\n      { "NoncurrentDays": 30, "StorageClass": "STANDARD_IA" }\n    ]\n  }]\n}', explanation: 'Apply via put-bucket-lifecycle-configuration. Prefix filter scopes rule.' },
      { language: 'bash', label: 'Put lifecycle policy', code: 'aws s3api put-bucket-lifecycle-configuration \\\n  --bucket my-app-data \\\n  --lifecycle-configuration file://lifecycle.json', explanation: 'Validate JSON schema before apply — invalid rules rejected.' },
      { language: 'bash', label: 'Restore Glacier object', code: 'aws s3api restore-object \\\n  --bucket my-app-data \\\n  --key archive/2020/report.csv \\\n  --restore-request \'{"Days":7,"GlacierJobParameters":{"Tier":"Standard"}}\'', explanation: 'Flexible Retrieval Standard tier hours; Expedited minutes at premium.' },
      { language: 'bash', label: 'Upload with storage class', code: 'aws s3 cp backup.tar.gz s3://my-app-data/backups/ \\\n  --storage-class STANDARD_IA', explanation: 'Set class at upload for known infrequent data without waiting for lifecycle.' },
    ],
    comparisonRows: [['Cost model', 'Storage + retrieval + requests', 'EBS pay for provisioned GB regardless of read'], ['Latency', 'Glacier minutes to hours', 'EBS milliseconds'], ['Automation', 'Lifecycle by age/prefix', 'EBS snapshots manual or Data Lifecycle Manager'], ['Minimum duration', 'IA 30d, Glacier 90d penalties', 'EBS billed while attached']],
    pitfallsBody: 'Transition to Glacier then need immediate access — retrieval delay. Intelligent-Tiering monitoring fee on small objects. Lifecycle expire rule on wrong prefix deletes production data.',
    seniorProse: 'S3 Glacier Instant for archive with instant read vs Flexible for true archive. How to prove it in production: Storage Lens class breakdown, early deletion charge lines in Cost Explorer, restore drill timing.',
    seniorRows: [['Standard only', 'Simple hot data', 'Highest cost at scale'], ['Lifecycle tiering', 'Automatic cost optimization', 'Retrieval surprise on cold data'], ['Intelligent-Tiering', 'Unknown patterns', 'Small object monitoring fee'], ['One Zone-IA', 'Cheapest IA', 'AZ loss risk — not for DR copies']],
    rejectionBody: "Moving all data to Glacier day one gets rejected — retrieval pain. Strong answer: staged transitions, test restore, noncurrent version rules.",
    takeaways: ['Match storage class to access frequency and retrieval tolerance.', 'Lifecycle rules filter by prefix — design keys accordingly.', 'Minimum storage duration penalties on early deletion from IA/Glacier.', '60s: Standard hot. IA/Glacier cold with retrieval delay. Lifecycle by prefix age. Test restore.', 'Follow-up: Intelligent-Tiering vs explicit lifecycle?'],
    pitfalls: ['Glacier for data needed daily — weak answer.', 'Strong answer: Standard or IA for warm; Glacier for true archive with restore runbook.', 'No noncurrent version lifecycle with versioning on — cost explosion.', 'Expiring wrong prefix without MFA or policy guard.'],
    jsTs: [{ language: 'javascript', concept: 'TTL cache vs storage class', note: 'Redis TTL evicts hot cache; S3 lifecycle moves cold blobs — different layers of tiering in Node apps.', futureTopicSlug: 'aws/s3/tiering' }, { language: 'typescript', concept: 'Archive restore polling', note: 'Restore Glacier object then poll HeadObject Restore header — async pattern like waiting on Promise with backoff.', futureTopicSlug: 'aws/s3/restore' }],
    sources: [{ title: 'Storage classes', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html' }, { title: 'Lifecycle configuration', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html' }],
  };
}

function mkS3Security() {
  return {
    id: 'aws-10-s3-security-policies', slug: 's3-security-policies', title: 'S3 security — bucket policies, ACLs, and encryption', order: 4,
    hook: 'Block Public Access is the default guardrail; bucket policies and IAM grant access; server-side encryption protects data at rest — avoid legacy ACLs.',
    scenarioTag: 'auth-token', animationHint: 'request-path',
    relatedTopicIds: ['aws-10-s3-buckets-keys-prefixes', 'aws-10-s3-events-hosting', 'aws-11-lambda-triggers'],
    glossary: { prose: 'Amazon S3 security layers: Block Public Access settings, Identity and Access Management (IAM) identity policies, bucket policies (resource-based), optional Access Points, and legacy Access Control Lists (ACLs). Server-side encryption uses SSE-S3, SSE-KMS, or SSE-C. Presigned URLs grant time-limited access without making bucket public.', why: 'Public bucket data breaches dominate headlines. CloudFront Origin Access Control (OAC) requires bucket policy allowing distribution. KMS key policies add audit but throttling risk on hot buckets.', framing: 'Say: Block Public Access on, bucket policy for services and cross-account, IAM for users/roles, SSE-KMS for audit, presigned URLs for uploads.', entries: [{ term: 'Block Public Access', longForm: 'S3 Block Public Access', plainDefinition: 'Account/bucket setting overriding public ACLs and policies.', example: 'All four blocks enabled on new buckets.' }, { term: 'Bucket policy', longForm: 'S3 bucket policy', plainDefinition: 'JSON resource policy on bucket for cross-account and service principals.', example: 'Allow CloudFront OAC distribution ARN s3:GetObject.' }, { term: 'SSE-KMS', longForm: 'Server-side encryption with KMS', plainDefinition: 'Encryption using AWS KMS key — audit trail per decrypt.', example: 'aws:kms with customer managed CMK.' }, { term: 'Presigned URL', longForm: 'S3 presigned URL', plainDefinition: 'Temporary signed URL for GetObject or PutObject.', example: 'Browser direct upload without proxying through API.' }] },
    steps: { title: 'Secure bucket access', items: [{ title: 'Enable Block Public Access', body: 'All four settings at account and bucket level.' }, { title: 'Encrypt default', body: 'Default encryption SSE-S3 or SSE-KMS on bucket.' }, { title: 'Bucket policy least privilege', body: 'Specific principal, action, prefix condition.' }, { title: 'IAM for identities', body: 'Role for app/Lambda with s3:GetObject on needed prefix only.' }] },
    diagram: { title: 'S3 access decision path', source: 'flowchart TB\n  Req[Request] --> BPA{Block Public Access?}\n  BPA -->|public denied| Deny[Deny]\n  BPA --> IAM[IAM policy]\n  IAM --> BP[Bucket policy]\n  BP --> ACL[ACL legacy optional]\n  BP --> Allow[Allow if all pass + encryption OK]' },
    snippets: [
      { language: 'json', label: 'Deny unencrypted uploads', code: '{\n  "Sid": "DenyUnencrypted",\n  "Effect": "Deny",\n  "Principal": "*",\n  "Action": "s3:PutObject",\n  "Resource": "arn:aws:s3:::my-bucket/*",\n  "Condition": {\n    "StringNotEquals": {\n      "s3:x-amz-server-side-encryption": "aws:kms"\n    }\n  }\n}', explanation: 'Bucket policy guardrail — rejects PutObject without KMS encryption header.' },
      { language: 'json', label: 'CloudFront OAC bucket policy', code: '{\n  "Effect": "Allow",\n  "Principal": { "Service": "cloudfront.amazonaws.com" },\n  "Action": "s3:GetObject",\n  "Resource": "arn:aws:s3:::my-bucket/*",\n  "Condition": {\n    "StringEquals": {\n      "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1234567890"\n    }\n  }\n}', explanation: 'Only that CloudFront distribution reads objects — bucket stays private.' },
      { language: 'bash', label: 'Generate presigned upload URL', code: 'aws s3 presign s3://my-bucket/uploads/file.csv \\\n  --expires-in 3600', explanation: 'Client PUTs directly to S3 — API does not proxy bytes. Validate content type in app.' },
      { language: 'yaml', label: 'Default KMS encryption on bucket', code: 'SecureBucket:\n  Type: AWS::S3::Bucket\n  Properties:\n    BucketEncryption:\n      ServerSideEncryptionConfiguration:\n        - ServerSideEncryptionByDefault:\n            SSEAlgorithm: aws:kms\n            KMSMasterKeyID: !Ref DataKey\n          BucketKeyEnabled: true', explanation: 'Bucket Key reduces KMS API calls and cost for high throughput.' },
    ],
    comparisonRows: [['Public access', 'Block Public Access + private bucket', 'Express static files from public dir — different risk'], ['Auth', 'IAM + bucket policy + presigned URL', 'JWT auth middleware before file read'], ['Encryption at rest', 'SSE-S3/KMS automatic', 'App-level crypto before upload if client-side needed'], ['ACLs', 'Legacy — avoid', 'N/A']],
    pitfallsBody: 'Public Read bucket ACL for static site — use CloudFront OAC instead. Wildcard Principal * in bucket policy. KMS key policy missing for Lambda role causing AccessDenied on GetObject.',
    seniorProse: 'Access Points simplify policy for shared buckets with per-prefix IAM. Object Lambda for transform at read time. How to prove it in production: S3 server access logs or CloudTrail data events, IAM Access Analyzer findings on public buckets.',
    seniorRows: [['SSE-S3', 'Simple default encryption', 'No per-object KMS audit'], ['SSE-KMS CMK', 'Audit and key rotation control', 'KMS quota throttling hot buckets'], ['Bucket policy Deny', 'Guardrails on encryption/VPC', 'Policy size limit 20KB'], ['Presigned URL', 'Direct client upload/download', 'URL leak = temporary breach window']],
    rejectionBody: "Making bucket public for CloudFront gets rejected — use OAC. Strong answer: Block Public Access, OAC policy, SSE-KMS, presigned for uploads.",
    takeaways: ['Enable Block Public Access — default for new buckets.', 'Bucket policy for cross-account and service principals; IAM for roles.', 'Prefer SSE-KMS with bucket key for audit and cost balance.', '60s: Block public. OAC for CloudFront. IAM least privilege prefix. SSE-KMS. Presigned URLs for direct upload.', 'Follow-up: SSE-S3 vs SSE-KMS tradeoff?'],
    pitfalls: ['Public bucket for static assets — rejected.', 'Strong answer: private bucket + CloudFront OAC + bucket policy on distribution ARN.', 'Principal * without condition — overly broad.', 'Forgetting KMS key policy for Lambda execution role.'],
    jsTs: [{ language: 'javascript', concept: 'Presigned URL in Express', note: 'API returns presigned PUT URL — browser uploads direct to S3 like signed upload token pattern.', futureTopicSlug: 'aws/s3/presigned' }, { language: 'typescript', concept: 'getSignedUrl from SDK v3', note: 'S3Client + getSignedUrl — type-safe expiry and command; validate file type server-side after upload via S3 event.', futureTopicSlug: 'aws/s3/sdk-signing' }],
    sources: [{ title: 'Blocking public access', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html' }, { title: 'Bucket policies', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html' }],
  };
}

function mkS3Events() {
  return {
    id: 'aws-10-s3-events-hosting', slug: 's3-events-hosting', title: 'S3 event notifications and static website hosting', order: 5,
    hook: 'S3 can notify Lambda, SNS, or SQS on object events and serve static sites — pair website hosting with CloudFront for HTTPS production SPAs.',
    scenarioTag: 'csv-import', animationHint: 'flow',
    relatedTopicIds: ['aws-10-s3-security-policies', 'aws-11-lambda-triggers', 'aws-11-lambda-concurrency-dlq'],
    glossary: { prose: 'Amazon S3 event notifications fire on s3:ObjectCreated:*, s3:ObjectRemoved:*, and other events to AWS Lambda, Amazon SNS, Amazon SQS, or EventBridge. Filters by prefix and suffix. Static website hosting serves index.html and error document from bucket website endpoint — HTTP only; production uses CloudFront. Event delivery is at-least-once.', why: 'CSV upload pipelines trigger Lambda ETL. Duplicate events require idempotent handlers. Public website endpoint without CloudFront lacks HTTPS and WAF.', framing: 'Say: event notification prefix/suffix filter, async Lambda with DLQ, static site behind CloudFront OAC not public bucket.', entries: [{ term: 'Event notification', longForm: 'S3 event notification', plainDefinition: 'Configuration sending events to Lambda, SNS, or SQS.', example: 'uploads/*.csv ObjectCreated → Lambda.' }, { term: 'Website endpoint', longForm: 'S3 static website hosting', plainDefinition: 'Bucket configured with IndexDocument and ErrorDocument.', example: 'index.html + error.html for SPA routing helper.' }, { term: 'EventBridge', longForm: 'Amazon EventBridge S3 integration', plainDefinition: 'Alternative to legacy notifications with filtering and replay.', example: 'Rule matches Object Created for audit bus.' }, { term: 'Suffix filter', longForm: 'S3 notification suffix filter', plainDefinition: 'Limit events to keys ending with pattern like .csv.', example: '.json suffix only for config processor.' }] },
    steps: { title: 'Event-driven upload pipeline', items: [{ title: 'Configure notification', body: 'Prefix uploads/, suffix .csv, event s3:ObjectCreated:Put.' }, { title: 'Grant Lambda permission', body: 'S3 invokes Lambda — resource policy on function allows s3.amazonaws.com.' }, { title: 'Idempotent handler', body: 'Dedup on bucket+key+versionId or etag in DynamoDB.' }, { title: 'Static site optional', body: 'Website hosting for lab; CloudFront OAC for prod HTTPS SPA.' }] },
    diagram: { title: 'S3 event to Lambda', source: 'flowchart LR\n  User[User upload] --> S3[S3 PutObject uploads/data.csv]\n  S3 -->|ObjectCreated| L[Lambda processor]\n  L --> DB[(DynamoDB)]\n  L --> DLQ[DLQ on failure]\n  S3 --> CF[CloudFront OAC static assets]' },
    snippets: [
      { language: 'json', label: 'Notification configuration', code: '{\n  "LambdaFunctionConfigurations": [{\n    "Id": "CsvUpload",\n    "LambdaFunctionArn": "arn:aws:lambda:ap-south-1:123456789012:function:ProcessCsv",\n    "Events": ["s3:ObjectCreated:Put"],\n    "Filter": {\n      "Key": {\n        "FilterRules": [\n          { "Name": "prefix", "Value": "uploads/" },\n          { "Name": "suffix", "Value": ".csv" }\n        ]\n      }\n    }\n  }]\n}', explanation: 'Apply with put-bucket-notification-configuration. One config per bucket replaces previous.' },
      { language: 'bash', label: 'Allow S3 to invoke Lambda', code: 'aws lambda add-permission \\\n  --function-name ProcessCsv \\\n  --statement-id s3-invoke \\\n  --action lambda:InvokeFunction \\\n  --principal s3.amazonaws.com \\\n  --source-arn arn:aws:s3:::my-app-data \\\n  --source-account 123456789012', explanation: 'Required before notification succeeds — otherwise configuration errors.' },
      { language: 'yaml', label: 'Static website hosting bucket', code: 'WebsiteBucket:\n  Type: AWS::S3::Bucket\n  Properties:\n    WebsiteConfiguration:\n      IndexDocument: index.html\n      ErrorDocument: error.html\n    PublicAccessBlockConfiguration:\n      BlockPublicAcls: true\n      BlockPublicPolicy: true\n      IgnorePublicAcls: true\n      RestrictPublicBuckets: true', explanation: 'Website config without public access — serve via CloudFront OAC instead of public policy.' },
      { language: 'bash', label: 'Put notification from CLI', code: 'aws s3api put-bucket-notification-configuration \\\n  --bucket my-app-data \\\n  --notification-configuration file://notification.json', explanation: 'Test with sample upload to prefix and watch CloudWatch Logs for Lambda.' },
    ],
    comparisonRows: [['Trigger', 'S3 event push to Lambda', 'Express POST /upload receives file — synchronous'], ['Delivery', 'At-least-once events', 'HTTP once unless client retries'], ['Static hosting', 'S3 website + CloudFront', 'nginx serve dist/ on EC2'], ['Filter', 'Prefix and suffix on key', 'Route path in Express router']],
    pitfallsBody: 'Missing Lambda permission for S3 invoke. Assuming exactly-once S3 events. Public website bucket for production SPA without CloudFront HTTPS.',
    seniorProse: 'EventBridge replaces multiple notification configs with central routing and replay. SQS buffer between S3 and Lambda smooths bursts. How to prove it in production: Lambda Errors metric, DLQ depth, duplicate processing rate via idempotency table.',
    seniorRows: [['S3 → Lambda direct', 'Simple ETL trigger', 'Burst throttles Lambda concurrency'], ['S3 → SQS → Lambda', 'Buffer and backpressure', 'Extra component latency'], ['EventBridge', 'Filtering and multi-target', 'Slightly more setup'], ['CloudFront OAC site', 'HTTPS private bucket', 'Invalidation or versioned assets on deploy']],
    rejectionBody: "Public S3 website for prod React app gets rejected. Strong answer: CloudFront OAC, event-driven idempotent Lambda, DLQ.",
    takeaways: ['S3 events are at-least-once — idempotent Lambda handlers required.', 'Configure prefix/suffix filters to reduce noise and cost.', 'Static website hosting is HTTP — use CloudFront OAC for production HTTPS.', '60s: ObjectCreated to Lambda with filter. Add permission. Idempotent handler. CloudFront for static site.', 'Follow-up: S3 notification vs EventBridge?'],
    pitfalls: ['Exactly-once assumption from S3 events — rejected.', 'Strong answer: idempotent on key+etag; DLQ for failures.', 'Forgot lambda add-permission for S3 principal.', 'No DLQ on async Lambda processing uploads.'],
    jsTs: [{ language: 'javascript', concept: 'Multer upload vs S3 presigned', note: 'Direct S3 upload via presigned URL + S3 event replaces multer memory storage — scales without API server bytes.', futureTopicSlug: 'aws/s3/upload-patterns' }, { language: 'typescript', concept: 'S3Event handler type', note: 'Lambda S3Event from @types/aws-lambda — iterate Records array; batch may contain multiple objects.', futureTopicSlug: 'aws/lambda/s3-trigger' }],
    sources: [{ title: 'Event notifications', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html' }, { title: 'Static website hosting', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html' }],
  };
}

function mkLambdaExec() {
  return {
    id: 'aws-11-lambda-execution-environment', slug: 'lambda-execution-environment', title: 'Lambda execution environment and lifecycle', order: 1,
    hook: 'Each Lambda invocation runs in an ephemeral execution environment — reuse warm sandboxes for performance but never depend on in-memory state for correctness.',
    scenarioTag: 'auth-token', animationHint: 'stack-heap',
    relatedTopicIds: ['aws-11-lambda-cold-starts', 'aws-11-lambda-concurrency-dlq', 'aws-09-ec2-instances-amis'],
    glossary: { prose: 'AWS Lambda creates an execution environment — a Firecracker microVM sandbox running your runtime and handler. After invoke completes, AWS may freeze the environment for reuse. Initialization code outside the handler runs once per environment. /tmp provides 512 MB to 10 GB ephemeral disk. Memory setting scales CPU proportionally.', why: 'Global variables and open connections persist on warm invokes — useful for SDK client reuse, dangerous for tenant data leakage. /tmp is not durable across all invocations. Timeout and memory directly affect bill and CPU.', framing: 'Say: stateless handler, init outside handler for clients, /tmp scratch only, memory tunes CPU and cost.', entries: [{ term: 'Execution environment', longForm: 'Lambda execution environment', plainDefinition: 'Sandbox running one runtime instance until recycled.', example: 'Warm pool reuses env for next invoke.' }, { term: '/tmp', longForm: 'Lambda temporary storage', plainDefinition: 'Writable scratch space 512MB-10GB based on memory config.', example: 'Download CSV to /tmp for processing.' }, { term: 'Init phase', longForm: 'Lambda initialization', plainDefinition: 'Code outside handler runs on cold start before first invoke.', example: 'const client = new S3Client({}) outside handler.' }, { term: 'Memory', longForm: 'Lambda memory configuration', plainDefinition: '128 MB to 10 GB — also allocates proportional CPU.', example: '1769 MB ≈ 1 vCPU equivalent.' }] },
    steps: { title: 'Handler lifecycle', items: [{ title: 'Init', body: 'Runtime loads, top-level code runs — SDK clients, env validation.' }, { title: 'Invoke', body: 'Handler receives event, processes, returns sync or async result.' }, { title: 'Freeze', body: 'Environment frozen with memory state possibly preserved.' }, { title: 'Recycle', body: 'AWS discards environment unpredictably — design stateless.' }] },
    diagram: { title: 'Execution environment reuse', source: 'flowchart LR\n  Cold[Cold start\\ninit + handler] --> Freeze[Environment frozen]\n  Freeze --> Warm[Warm invoke\\nhandler only]\n  Warm --> Freeze\n  Freeze --> Recycle[Recycled\\nstate lost]' },
    snippets: [
      { language: 'yaml', label: 'Lambda function CloudFormation', code: 'ProcessFn:\n  Type: AWS::Lambda::Function\n  Properties:\n    Runtime: nodejs20.x\n    Handler: index.handler\n    MemorySize: 1024\n    Timeout: 30\n    EphemeralStorage:\n      Size: 1024\n    Environment:\n      Variables:\n        TABLE_NAME: !Ref OrdersTable\n    Role: !GetAtt LambdaRole.Arn', explanation: 'Memory and timeout are primary tuning knobs. EphemeralStorage expands /tmp.' },
      { language: 'javascript', label: 'Init outside handler (Node.js)', code: 'import { DynamoDBClient } from "@aws-sdk/client-dynamodb";\nimport { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";\n\nconst client = DynamoDBDocumentClient.from(new DynamoDBClient({}));\n\nexport const handler = async (event) => {\n  await client.send(new PutCommand({ TableName: process.env.TABLE_NAME, Item: event.detail }));\n  return { statusCode: 200 };\n};', explanation: 'Client created once per environment — reused on warm invokes.' },
      { language: 'bash', label: 'Update function configuration', code: 'aws lambda update-function-configuration \\\n  --function-name ProcessOrders \\\n  --memory-size 1769 \\\n  --timeout 60 \\\n  --ephemeral-storage Size=2048', explanation: 'Power tuning: profile duration vs memory cost in Lambda Power Tuning tool.' },
      { language: 'bash', label: 'Invoke and read log tail', code: 'aws lambda invoke --function-name ProcessOrders \\\n  --payload file://event.json out.json\naws logs tail /aws/lambda/ProcessOrders --since 5m', explanation: 'REPORT line shows Duration, Billed Duration, Memory Size, Max Memory Used.' },
    ],
    comparisonRows: [['Process model', 'Ephemeral sandbox per concurrent execution', 'Long-running Node process on EC2'], ['State', 'May persist warm — not guaranteed', 'In-memory cache reliable until restart'], ['Disk', '/tmp only within environment', 'Full filesystem on EC2 EBS'], ['Scale', 'AWS manages concurrency', 'You manage ASG or pm2 cluster']],
    pitfallsBody: 'Storing user session in global variable — leaks across invocations on same environment. Writing audit trail only to /tmp. Huge deployment package slowing init.',
    seniorProse: 'Lambda extensions run alongside function for observability agents. SnapStart for Java reduces init. How to prove it in production: CloudWatch Max Memory Used vs configured memory, InitDuration on cold starts, X-Ray subsegments for init vs handler.',
    seniorRows: [['Low memory', 'Cheap per ms', 'CPU throttled — slower duration'], ['High memory', 'More CPU — may reduce total cost', 'Over-provision waste if flat duration'], ['Large /tmp', 'Big file transform', 'Ephemeral — not shared across envs'], ['Arm64 Graviton2', 'Lower cost same perf for many runtimes', 'Native deps must be arm built']],
    rejectionBody: "Relying on global state for correctness gets rejected. Strong answer: stateless handler, external store, init reuse for clients only.",
    takeaways: ['Execution environments are ephemeral — design handlers stateless.', 'Initialize SDK clients outside handler for warm performance.', '/tmp is scratch only — not durable storage.', '60s: Stateless handler. Init outside handler. /tmp ephemeral. Memory scales CPU. Never trust warm globals for tenant data.', 'Follow-up: when does AWS recycle an environment?'],
    pitfalls: ['Global variable for per-user auth context — rejected (cross-tenant leak risk).', 'Strong answer: pass identity in event; store session in DynamoDB.', 'Assuming /tmp persists forever across all invokes.', '512MB default /tmp for large file processing without raising EphemeralStorage.'],
    jsTs: [{ language: 'javascript', concept: 'Module scope singleton', note: 'const db = connect() at module load mirrors Lambda init — same pattern on EC2 but lifecycle differs on recycle.', futureTopicSlug: 'aws/lambda/init-pattern' }, { language: 'typescript', concept: 'handler typing', note: 'APIGatewayProxyHandler types event/context — strict handler signature like Express RequestHandler but stateless.', futureTopicSlug: 'aws/lambda/typescript' }],
    sources: [{ title: 'Lambda execution environment', url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html' }, { title: 'Function configuration', url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-function-common.html' }],
  };
}

function mkLambdaCold() {
  return {
    id: 'aws-11-lambda-cold-starts', slug: 'lambda-cold-starts', title: 'Lambda cold starts and provisioned concurrency', order: 2,
    hook: 'A cold start creates a new execution environment — initialization latency matters for interactive APIs; provisioned concurrency keeps environments warm.',
    scenarioTag: 'high-concurrency', animationHint: 'timeline',
    relatedTopicIds: ['aws-11-lambda-execution-environment', 'aws-11-lambda-in-vpc', 'aws-11-lambda-vs-ec2-fargate'],
    glossary: { prose: 'Cold starts occur on first invoke or when Lambda scales concurrent executions beyond warm pool. Init includes runtime bootstrap and loading handler code. Provisioned concurrency pre-creates initialized environments. VPC-attached functions historically added ENI setup latency — improved with Hyperplane. Java and .NET typically longer init than Node.js and Python.', why: 'P99 latency SLAs fail if cold starts dominate traffic spikes. Provisioned concurrency has hourly cost even without traffic. Right-sizing package and avoiding unnecessary VPC attachment reduces init.', framing: 'Say: cold = init + handler; measure InitDuration; provisioned concurrency for steady low-latency; shrink package and avoid VPC if possible.', entries: [{ term: 'Cold start', longForm: 'Lambda cold start', plainDefinition: 'New execution environment creation and initialization delay.', example: 'First request after deploy spikes latency.' }, { term: 'Provisioned concurrency', longForm: 'Lambda provisioned concurrency', plainDefinition: 'Pre-warmed execution environments ready to invoke.', example: 'PC=10 on prod alias for API.' }, { term: 'InitDuration', longForm: 'CloudWatch InitDuration', plainDefinition: 'Metric for initialization time on cold invoke.', example: 'InitDuration 800ms of 1200ms total.' }, { term: 'SnapStart', longForm: 'Lambda SnapStart for Java', plainDefinition: 'Cached snapshot of initialized Java runtime.', example: 'Reduces Java cold start significantly.' }] },
    steps: { title: 'Reduce cold start impact', items: [{ title: 'Measure', body: 'CloudWatch InitDuration and duration P99 on new version.' }, { title: 'Optimize package', body: 'Tree-shake deps, Lambda layers for shared libs, avoid fat bundles.' }, { title: 'Avoid VPC if possible', body: 'Public Lambda for AWS API calls; VPC only for private RDS.' }, { title: 'Provision concurrency', body: 'Set on alias for prod; balance cost vs latency SLA.' }] },
    diagram: { title: 'Cold vs warm invoke', source: 'flowchart TB\n  Req[Request] --> HasWarm{Warm env available?}\n  HasWarm -->|yes| Handler[Handler only\\nlow latency]\n  HasWarm -->|no| Init[Init runtime + code\\nInitDuration]\n  Init --> Handler\n  PC[Provisioned concurrency] --> HasWarm' },
    snippets: [
      { language: 'bash', label: 'Put provisioned concurrency', code: 'aws lambda put-provisioned-concurrency-config \\\n  --function-name ApiHandler \\\n  --qualifier prod \\\n  --provisioned-concurrent-executions 20', explanation: 'Apply to published alias — not $LATEST. Bills hourly per PC unit.' },
      { language: 'yaml', label: 'Alias with provisioned concurrency', code: 'ProdAlias:\n  Type: AWS::Lambda::Alias\n  Properties:\n    FunctionName: !Ref ApiHandler\n    FunctionVersion: !GetAtt ApiHandlerVersion.Version\n    Name: prod\n    ProvisionedConcurrencyConfig:\n      ProvisionedConcurrentExecutions: 10', explanation: 'Blue/green: shift traffic between versions with weighted alias.' },
      { language: 'bash', label: 'Publish version and alias', code: 'aws lambda publish-version --function-name ApiHandler\naws lambda create-alias \\\n  --function-name ApiHandler \\\n  --name prod \\\n  --function-version 5', explanation: 'Provisioned concurrency requires published version or alias.' },
      { language: 'bash', label: 'CloudWatch InitDuration query', code: 'aws cloudwatch get-metric-statistics \\\n  --namespace AWS/Lambda \\\n  --metric-name InitDuration \\\n  --dimensions Name=FunctionName,Value=ApiHandler \\\n  --start-time 2026-09-14T00:00:00Z \\\n  --end-time 2026-09-14T23:59:59Z \\\n  --period 3600 \\\n  --statistics Average,Maximum', explanation: 'Correlate deploy times with init spikes.' },
    ],
    comparisonRows: [['Latency tail', 'Cold start init spike', 'EC2 always warm after boot'], ['Cost', 'Pay per invoke + PC hourly', 'EC2 hourly always on'], ['Scale out', 'New env per concurrent spike', 'ASG launch minutes'], ['Mitigation', 'PC, smaller package, SnapStart', 'Warm pool on ASG']],
    pitfallsBody: 'Provisioned concurrency on $LATEST — not supported. Enabling VPC for S3 access only — adds init without benefit. Ignoring InitDuration blaming handler code alone.',
    seniorProse: 'Lambda SnapStart for Java and upcoming patterns reduce init. Graviton2 arm64 often faster/cheaper. How to prove it in production: X-Ray cold trace flag, InitDuration alarm on new deploys, load test after publish before full traffic shift.',
    seniorRows: [['No PC', 'Lowest cost dev/staging', 'P99 spikes on traffic'], ['Partial PC', 'Warm baseline for API', 'Hourly cost 24/7'], ['Full PC match peak', 'Stable P99', 'Expensive if peak rare'], ['Split VPC functions', 'Only DB callers in VPC', 'Architecture complexity']],
    rejectionBody: "Blaming all latency on handler without InitDuration gets rejected. Strong answer: measure init, PC on alias, package diet, VPC only when needed.",
    takeaways: ['Cold starts add InitDuration before handler runs.', 'Provisioned concurrency on published alias pre-warms environments.', 'Shrink deployment package and limit VPC to reduce init.', '60s: InitDuration metric. PC on prod alias. Small package. VPC only for private resources. SnapStart for Java.', 'Follow-up: does PC scale automatically with traffic?'],
    pitfalls: ['PC on $LATEST — invalid configuration.', 'Strong answer: publish version, alias prod, PC on alias.', 'VPC for all functions including S3-only — unnecessary cold penalty.', 'Fat node_modules in deployment zip slowing init.'],
    jsTs: [{ language: 'javascript', concept: 'Dynamic import lazy load', note: 'await import() heavy modules inside handler defers init cost on warm paths — trade first cold vs steady state.', futureTopicSlug: 'aws/lambda/bundle-size' }, { language: 'typescript', concept: 'esbuild bundle for Lambda', note: 'Single tree-shaken dist/index.js reduces cold vs full node_modules — like webpack prod bundle for server.', futureTopicSlug: 'aws/lambda/esbuild' }],
    sources: [{ title: 'Understanding cold starts', url: 'https://docs.aws.amazon.com/lambda/latest/dg/runtimes-custom.html' }, { title: 'Provisioned concurrency', url: 'https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html' }],
  };
}

function mkLambdaVpc() {
  return {
    id: 'aws-11-lambda-in-vpc', slug: 'lambda-in-vpc', title: 'Lambda in a VPC (ENIs, endpoints, cold start)', order: 3,
    hook: 'Lambda functions in a VPC get Elastic Network Interfaces in your subnets to reach private resources like RDS — but AWS API calls need NAT Gateway or VPC endpoints.',
    scenarioTag: 'lambda-vpc', animationHint: 'network-flow',
    relatedTopicIds: ['aws-09-eni-vpc-attachment', 'aws-09-ec2-networking-troubleshoot', 'aws-11-lambda-cold-starts'],
    glossary: { prose: 'Configure Lambda with subnet IDs and security group IDs to attach Hyperplane ENIs in your Virtual Private Cloud (VPC). The function can then reach private IP resources such as Amazon RDS or ElastiCache. Without NAT Gateway or interface/gateway VPC endpoints, calls to public AWS APIs (S3, DynamoDB) fail or need endpoints. Subnet IP capacity must cover peak concurrent ENIs.', why: 'Classic interview trap: Lambda in private subnet cannot reach S3 — add gateway endpoint or NAT. /28 subnet exhausts under burst concurrency. Split architecture: VPC functions for DB, non-VPC for S3/API.', framing: 'Say: VPC Lambda for private RDS only. S3 gateway endpoint free. Size subnets for concurrency. Hyperplane reduced ENI cold start vs old model.', entries: [{ term: 'Hyperplane ENI', longForm: 'Lambda Hyperplane ENI', plainDefinition: 'Shared network infrastructure for Lambda VPC connectivity.', example: 'Faster scale than per-function ENI classic model.' }, { term: 'Gateway endpoint', longForm: 'S3 VPC gateway endpoint', plainDefinition: 'Route table entry for S3 without NAT — no hourly charge.', example: 'Private subnet route to com.amazonaws.region.s3.' }, { term: 'Interface endpoint', longForm: 'VPC interface endpoint', plainDefinition: 'PrivateLink ENI for AWS API — hourly and data charge.', example: 'com.amazonaws.region.dynamodb interface endpoint.' }, { term: 'Security group', longForm: 'Lambda VPC security group', plainDefinition: 'Controls traffic to/from function ENIs in subnet.', example: 'Outbound 5432 to RDS SG, egress 443 to endpoints.' }] },
    steps: { title: 'VPC Lambda setup', items: [{ title: 'Pick subnets', body: 'Private subnets in multiple AZs with enough free IPs for peak concurrency.' }, { title: 'Security groups', body: 'Lambda SG egress to RDS SG port; endpoint SG allows 443 from Lambda SG.' }, { title: 'Endpoints or NAT', body: 'S3/DynamoDB gateway endpoints; other APIs via interface endpoints or NAT.' }, { title: 'Test path', body: 'RDS connect from Lambda; S3 access via endpoint route table association.' }] },
    diagram: { title: 'Lambda VPC connectivity', source: 'flowchart TB\n  L[Lambda in VPC] --> ENI[Hyperplane ENI\\nprivate subnet]\n  ENI --> RDS[(RDS private)]\n  ENI --> EP[S3 gateway endpoint]\n  ENI --> IF[DynamoDB interface endpoint]\n  ENI -.->|without endpoint| NAT[NAT Gateway to internet APIs]' },
    snippets: [
      { language: 'yaml', label: 'Lambda VPC config', code: 'VpcLambda:\n  Type: AWS::Lambda::Function\n  Properties:\n    VpcConfig:\n      SecurityGroupIds:\n        - !Ref LambdaSecurityGroup\n      SubnetIds:\n        - !Ref PrivateSubnetA\n        - !Ref PrivateSubnetB\n    Runtime: nodejs20.x\n    Handler: index.handler', explanation: 'Subnets must be private with route to endpoints or NAT for AWS API access.' },
      { language: 'yaml', label: 'S3 gateway endpoint', code: 'S3Endpoint:\n  Type: AWS::EC2::VPCEndpoint\n  Properties:\n    ServiceName: !Sub com.amazonaws.${AWS::Region}.s3\n    VpcId: !Ref AppVpc\n    RouteTableIds:\n      - !Ref PrivateRouteTableA\n      - !Ref PrivateRouteTableB\n    VpcEndpointType: Gateway', explanation: 'Associate gateway endpoint with route tables used by Lambda subnets.' },
      { language: 'bash', label: 'Update function VPC config', code: 'aws lambda update-function-configuration \\\n  --function-name DbWriter \\\n  --vpc-config SubnetIds=subnet-a,subnet-b,SecurityGroupIds=sg-lambda', explanation: 'Change triggers ENI replumb — expect brief connectivity blip.' },
      { language: 'bash', label: 'Check subnet available IPs', code: 'aws ec2 describe-subnets --subnet-ids subnet-a \\\n  --query \'Subnets[0].{Available:AvailableIpAddressCount,Cidr:CidrBlock}\'', explanation: 'Plan /24 or larger per AZ for high concurrency VPC Lambda.' },
    ],
    comparisonRows: [['Private DB access', 'VPC Lambda ENI in subnet', 'EC2 in same subnet — same SG pattern'], ['S3 access', 'Gateway endpoint or NAT', 'EC2 private subnet same endpoints'], ['Cold start', 'VPC adds init historically', 'EC2 always running — no cold'], ['IP planning', 'ENI per concurrent scale', 'One ENI per EC2 instance']],
    pitfallsBody: 'Lambda in VPC without S3 endpoint or NAT — AccessDenied or timeout to S3. /28 subnet with 100 concurrent Lambda. Same SG for Lambda and RDS without egress rules on RDS SG referencing Lambda SG.',
    seniorProse: 'RDS Proxy reduces connection storm from Lambda scale-out. How to prove it in production: Lambda ENI count in subnet via describe-network-interfaces, failed S3 calls in VPC without endpoint, cold InitDuration delta VPC vs non-VPC.',
    seniorRows: [['VPC + NAT', 'All internet APIs work', 'NAT cost and single-AZ risk if one NAT'], ['VPC + endpoints', 'Lower cost for AWS APIs', 'Interface endpoint hourly fees add up'], ['Split functions', 'Non-VPC for S3, VPC for RDS', 'Two functions to maintain'], ['RDS Proxy', 'Connection pooling to RDS', 'Extra service cost']],
    rejectionBody: "VPC Lambda without endpoint path to S3 gets rejected. Strong answer: gateway endpoint for S3, interface for DynamoDB, or split functions.",
    takeaways: ['VPC Lambda needs subnets, SGs, and IP capacity for scale.', 'Use S3 gateway endpoint — free — instead of NAT for S3 access.', 'Interface endpoints or NAT required for other AWS APIs from private subnet.', '60s: VPC for RDS private IP. S3 gateway endpoint. Size subnet IPs. Split non-VPC for public API Lambdas.', 'Follow-up: how many IPs does Lambda use per concurrency?'],
    pitfalls: ['No NAT/endpoints in private subnet Lambda — weak answer.', 'Strong answer: S3 gateway endpoint on route table; interface endpoints for other services.', '/28 subnet for high concurrency VPC Lambda.', 'Opening RDS 0.0.0.0/0 instead of Lambda SG reference.'],
    jsTs: [{ language: 'javascript', concept: 'pg Pool in Lambda VPC', note: 'Reuse Pool outside handler but RDS max_connections limits scale — use RDS Proxy like connection pool middleware.', futureTopicSlug: 'aws/lambda/rds-proxy' }, { language: 'typescript', concept: 'Dual Lambda architecture', note: 'API Lambda public + worker Lambda VPC mirrors microservice split — typed event between via SQS.', futureTopicSlug: 'aws/lambda/split-vpc' }],
    sources: [{ title: 'Configuring Lambda VPC', url: 'https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html' }, { title: 'Gateway endpoints', url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html' }],
  };
}

function mkLambdaTriggers() {
  return {
    id: 'aws-11-lambda-triggers', slug: 'lambda-triggers', title: 'Lambda triggers and event sources', order: 4,
    hook: 'Lambda integrates with S3, API Gateway, SQS, EventBridge, DynamoDB streams, and more — each trigger differs in invoke mode, batching, and retry semantics.',
    scenarioTag: 'sqs-consumer', animationHint: 'flow',
    relatedTopicIds: ['aws-10-s3-events-hosting', 'aws-11-lambda-concurrency-dlq', 'aws-11-lambda-execution-environment'],
    glossary: { prose: 'Lambda triggers include synchronous invokes (API Gateway, ALB Lambda target) returning errors to caller, and asynchronous invokes (S3, SNS, EventBridge) with automatic retry and optional Dead Letter Queue (DLQ). Event source mappings poll Amazon SQS, Kinesis, and DynamoDB streams with batching and partial failure responses.', why: 'Wrong invoke type expectations — S3 trigger does not block upload on handler failure. SQS mapping needs ReportBatchItemFailures for partial batch retry. API Gateway 502 when unhandled exception in sync invoke.', framing: 'Say: sync vs async invoke. Event source mapping for queues/streams. S3 async at-least-once. API Gateway sync timeout 29s integration limit.', entries: [{ term: 'Sync invoke', longForm: 'Lambda synchronous invocation', plainDefinition: 'Caller waits for response — API Gateway, direct invoke.', example: 'API returns 502 if Lambda throws.' }, { term: 'Async invoke', longForm: 'Lambda asynchronous invocation', plainDefinition: 'Lambda queues invoke, retries twice, then DLQ.', example: 'S3 ObjectCreated notification.' }, { term: 'Event source mapping', longForm: 'Lambda event source mapping', plainDefinition: 'Lambda polls stream/queue and invokes with batch.', example: 'SQS batch size 10 with window 5s.' }, { term: 'DLQ', longForm: 'Dead Letter Queue', plainDefinition: 'Destination for failed async invokes after retries.', example: 'SQS queue captures failed S3 processor events.' }] },
    steps: { title: 'Wire a trigger', items: [{ title: 'Choose integration', body: 'API sync vs S3 async vs SQS mapping vs EventBridge rule.' }, { title: 'Grant permissions', body: 'Resource policy on Lambda for S3; IAM for mapping poller.' }, { title: 'Configure batch/retry', body: 'SQS partial batch failure; async DLQ on function.' }, { title: 'Test failure modes', body: 'Verify retry, DLQ depth alarm, idempotent handler.' }] },
    diagram: { title: 'Trigger types', source: 'flowchart TB\n  APIGW[API Gateway] -->|sync| L[Lambda]\n  S3[S3 event] -->|async retry| L\n  SQS[SQS queue] -->|event source mapping| L\n  EB[EventBridge rule] -->|async| L\n  L --> DLQ[DLQ after retries]' },
    snippets: [
      { language: 'yaml', label: 'SQS event source mapping', code: 'Mapping:\n  Type: AWS::Lambda::EventSourceMapping\n  Properties:\n    FunctionName: !Ref Worker\n    EventSourceArn: !GetAtt WorkQueue.Arn\n    BatchSize: 10\n    MaximumBatchingWindowInSeconds: 5\n    FunctionResponseTypes:\n      - ReportBatchItemFailures', explanation: 'Partial batch failure returns failed message IDs only for retry.' },
      { language: 'yaml', label: 'EventBridge rule target Lambda', code: 'OrderRule:\n  Type: AWS::Events::Rule\n  Properties:\n    EventPattern:\n      source: [custom.orders]\n      detail-type: [OrderPlaced]\n    Targets:\n      - Arn: !GetAtt OrderHandler.Arn\n        Id: OrderLambda\nPermission:\n  Type: AWS::Lambda::Permission\n  Properties:\n    Action: lambda:InvokeFunction\n    FunctionName: !Ref OrderHandler\n    Principal: events.amazonaws.com\n    SourceArn: !GetAtt OrderRule.Arn', explanation: 'EventBridge needs Lambda permission for events.amazonaws.com principal.' },
      { language: 'bash', label: 'Create event source mapping', code: 'aws lambda create-event-source-mapping \\\n  --function-name Worker \\\n  --event-source-arn arn:aws:sqs:ap-south-1:123456789012:work-queue \\\n  --batch-size 10 \\\n  --function-response-types ReportBatchItemFailures', explanation: 'Enable partial batch failures for SQS consumer best practice.' },
      { language: 'bash', label: 'List event source mappings', code: 'aws lambda list-event-source-mappings \\\n  --function-name Worker \\\n  --query \'EventSourceMappings[].{UUID:UUID,State:State,Batch:BatchSize}\'', explanation: 'State Enabled required — Disabled stops polling.' },
    ],
    comparisonRows: [['S3 trigger', 'Async, at-least-once', 'Express POST handler sync'], ['API Gateway', 'Sync, caller sees error', 'REST route await handler'], ['SQS mapping', 'Poll batch, delete on success', 'while loop ReceiveMessage worker'], ['EventBridge', 'Filtered async routing', 'topic subscription pattern']],
    pitfallsBody: 'Expecting S3 to retry until handler succeeds — async retries then DLQ only. SQS mapping without partial batch failure duplicates successful records. API Gateway timeout shorter than Lambda timeout causes 504.',
    seniorProse: 'EventBridge Pipes connect sources to targets with transformation. Kinesis enhanced fan-out for multiple consumers. How to prove it in production: IteratorAge for streams, ApproximateAgeOfOldestMessage for queue, DLQ alarm, API Gateway 5xx vs Lambda Errors correlation.',
    seniorRows: [['S3 direct Lambda', 'Simple ETL', 'Burst throttling'], ['S3 SQS Lambda', 'Buffer backpressure', 'More moving parts'], ['API sync', 'User-facing latency', 'Must handle errors in response'], ['EventBridge', 'Schema evolution filter', 'Rule quota limits']],
    rejectionBody: "Treating S3 trigger as sync blocking upload gets rejected. Strong answer: async retry + DLQ + idempotent handler.",
    takeaways: ['Sync invokes return errors to caller; async retries then DLQ.', 'Event source mappings poll SQS/Kinesis with batching options.', 'S3 events at-least-once — idempotent processing required.', '60s: API sync. S3 async + DLQ. SQS mapping with partial batch failure. EventBridge filtered async.', 'Follow-up: difference mapping DLQ vs function DLQ?'],
    pitfalls: ['S3 trigger exactly-once assumption — rejected.', 'Strong answer: idempotent on key; async retries twice then DLQ.', 'SQS whole batch retry on one failure without ReportBatchItemFailures.', 'Lambda timeout > API Gateway integration timeout.'],
    jsTs: [{ language: 'javascript', concept: 'SQS partial batch failure response', note: 'return { batchItemFailures: [{ itemIdentifier: msg.messageId }] } — typed in TypeScript for SQSBatchResponse.', futureTopicSlug: 'aws/lambda/sqs-batch' }, { language: 'typescript', concept: 'API Gateway proxy integration', note: 'APIGatewayProxyResult statusCode/body — like Express res.status().json() returned from handler.', futureTopicSlug: 'aws/lambda/apigw' }],
    sources: [{ title: 'Lambda event sources', url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html' }, { title: 'SQS event source mapping', url: 'https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html' }],
  };
}

function mkLambdaConcurrency() {
  return {
    id: 'aws-11-lambda-concurrency-dlq', slug: 'lambda-concurrency-dlq', title: 'Lambda concurrency, throttling, and DLQ', order: 5,
    hook: 'Account and function concurrency limits cap parallel executions — throttling returns 429; async failures land in Dead Letter Queues after retries.',
    scenarioTag: 'step-functions-saga', animationHint: 'flow',
    relatedTopicIds: ['aws-11-lambda-triggers', 'aws-11-lambda-execution-environment', 'aws-10-s3-events-hosting'],
    glossary: { prose: 'AWS Lambda scales concurrent executions per Region. Default account limit is 1000 (soft quota). Reserved concurrency guarantees capacity for a function but subtracts from unreserved pool. Provisioned concurrency is pre-warmed. Asynchronous invokes retry twice (1 min, 2 min) then route to configured DLQ on function or failed event source mapping.', why: 'One function reserved concurrency=900 can starve others. Throttling during flash sale loses orders unless SQS buffers. DLQ without alarm means silent data loss.', framing: 'Say: account limit, reserved vs provisioned, 429 throttling, async DLQ with alarm, SQS buffer for smooth spikes.', entries: [{ term: 'Reserved concurrency', longForm: 'Lambda reserved concurrency', plainDefinition: 'Maximum concurrent executions dedicated to function.', example: 'Reserve 50 for payment processor.' }, { term: 'Throttling', longForm: 'Lambda throttling', plainDefinition: '429 when no concurrency capacity available.', example: 'Burst exceeds account unreserved pool.' }, { term: 'Async DLQ', longForm: 'Lambda async dead letter queue', plainDefinition: 'SQS or SNS target for failed async invokes.', example: 'DeadLetterConfig TargetArn on function.' }, { term: 'Unreserved concurrency', longForm: 'Unreserved account concurrency', plainDefinition: 'Account limit minus sum of reserved concurrency.', example: '1000 account - 200 reserved = 800 shared.' }] },
    steps: { title: 'Concurrency and failure handling', items: [{ title: 'Set account limit', body: 'Request increase before peak; monitor ConcurrentExecutions.' }, { title: 'Reserve if needed', body: 'Critical function minimum capacity; avoid hogging account.' }, { title: 'Configure DLQ', body: 'DeadLetterConfig on async functions; mapping DLQ for poll failures.' }, { title: 'Alarm and redrive', body: 'CloudWatch alarm on DLQ depth; fix and reprocess messages.' }] },
    diagram: { title: 'Concurrency and DLQ flow', source: 'flowchart TB\n  Invokes[Incoming invokes] --> Pool{Concurrency available?}\n  Pool -->|yes| Run[Execute]\n  Pool -->|no| T429[429 Throttled]\n  Run -->|async fail| Retry[Retry x2]\n  Retry -->|still fail| DLQ[(DLQ)]' },
    snippets: [
      { language: 'yaml', label: 'Function with DLQ and reserved concurrency', code: 'Worker:\n  Type: AWS::Lambda::Function\n  Properties:\n    ReservedConcurrentExecutions: 25\n    DeadLetterConfig:\n      TargetArn: !GetAtt WorkerDLQ.Arn\n    Runtime: nodejs20.x\n    Handler: index.handler\nWorkerDLQ:\n  Type: AWS::SQS::Queue', explanation: 'Reserved caps max parallel; DLQ captures async failures after retries.' },
      { language: 'bash', label: 'Set reserved concurrency', code: 'aws lambda put-function-concurrency \\\n  --function-name PaymentProcessor \\\n  --reserved-concurrent-executions 50', explanation: 'Set to 0 disables function — useful emergency kill switch.' },
      { language: 'bash', label: 'Get account concurrency settings', code: 'aws lambda get-account-settings \\\n  --query \'AccountLimit.{Concurrent:ConcurrentExecutions,Unreserved:UnreservedConcurrentExecutions}\'', explanation: 'Shows account ceiling and unreserved remainder.' },
      { language: 'bash', label: 'CloudWatch throttles metric', code: 'aws cloudwatch get-metric-statistics \\\n  --namespace AWS/Lambda \\\n  --metric-name Throttles \\\n  --dimensions Name=FunctionName,Value=PaymentProcessor \\\n  --start-time 2026-09-14T12:00:00Z \\\n  --end-time 2026-09-14T13:00:00Z \\\n  --period 60 \\\n  --statistics Sum', explanation: 'Non-zero throttles during peak — need SQS buffer or limit increase.' },
    ],
    comparisonRows: [['Backpressure', '429 throttle or SQS queue depth', 'SQS visibility timeout in EC2 worker'], ['Failure capture', 'DLQ after async retries', 'SQS DLQ on consumer fail'], ['Capacity guarantee', 'Reserved concurrency', 'ASG desired capacity'], ['Cost of idle', 'Provisioned concurrency hourly', 'EC2 always on']],
    pitfallsBody: 'Reserved concurrency=account limit on one function blocks all others. DLQ configured but no alarm. Sync API invoke errors not going to DLQ — only async uses function DLQ.',
    seniorProse: 'Step Functions orchestrates retries and saga compensation beyond raw Lambda DLQ. How to prove it in production: ConcurrentExecutions vs ReservedConcurrentExecutions graphs, Throttles metric, DLQ ApproximateNumberOfMessagesVisible alarm.',
    seniorRows: [['No reserved', 'Flexible pool sharing', 'Noisy neighbor throttling'], ['Reserved moderate', 'Protect critical path', 'Reduces shared pool'], ['SQS fronting Lambda', 'Absorb spikes', 'End-to-end latency'], ['Step Functions saga', 'Complex retry/compensate', 'Orchestration cost']],
    rejectionBody: "Expecting DLQ on API Gateway sync errors gets rejected — DLQ is async invoke path. Strong answer: sync 502 to client; async DLQ + alarm.",
    takeaways: ['Account concurrency limit shared — reserved subtracts from pool.', '429 throttling when capacity exhausted — use SQS buffer or increase limit.', 'Async invokes retry twice then DLQ — monitor DLQ depth.', '60s: Reserved concurrency caps function. 429 on throttle. Async DLQ after 2 retries. Sync errors not to DLQ.', 'Follow-up: reserved concurrency 0 effect?'],
    pitfalls: ['Reserved = entire account limit on one function — starves others.', 'Strong answer: reserve modest amount; SQS buffer; request limit increase.', 'No DLQ alarm — silent failure.', 'Confusing sync errors with async DLQ behavior.'],
    jsTs: [{ language: 'javascript', concept: 'Promise rejection in async invoke', note: 'Unhandled rejection fails async invoke → retry → DLQ — like unhandledRejection in Node without catch.', futureTopicSlug: 'aws/lambda/error-handling' }, { language: 'typescript', concept: 'Saga with Step Functions', note: 'Typed state machine compensates failed steps — stronger than DLQ alone for multi-step business transactions.', futureTopicSlug: 'aws/step-functions/saga' }],
    sources: [{ title: 'Lambda concurrency', url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html' }, { title: 'Dead-letter queues', url: 'https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html#invocation-dlq' }],
  };
}

function mkLambdaCompare() {
  return {
    id: 'aws-11-lambda-vs-ec2-fargate', slug: 'lambda-vs-ec2-fargate', title: 'Lambda versus EC2 and Fargate — when to choose', order: 6,
    hook: 'Lambda excels at event-driven short tasks; EC2 and AWS Fargate fit long-running processes, WebSockets, and steady traffic where per-hour compute wins.',
    scenarioTag: 'redis-cache', animationHint: 'compare',
    relatedTopicIds: ['aws-09-ec2-instances-amis', 'aws-09-auto-scaling-groups', 'aws-11-lambda-cold-starts'],
    glossary: { prose: 'AWS Lambda charges per invoke and duration with 15-minute maximum timeout. Amazon EC2 provides virtual machines you manage — full OS control, any duration, WebSockets. AWS Fargate runs containers without managing EC2 — middle ground for always-on services. Decision factors: traffic pattern, connection model, duration, operational burden, and cost at steady state.', why: 'Senior architects justify compute choice with traffic shape and ops cost. Wrong choice: WebSocket chat on Lambda (connection model mismatch) or cron every minute on EC2 t3.micro (Lambda cheaper).', framing: 'Say: Lambda event burst short; Fargate container steady; EC2 when need kernel, GPU, or lowest steady $ with RI.', entries: [{ term: 'Fargate', longForm: 'AWS Fargate', plainDefinition: 'Serverless compute engine for ECS/EKS without managing EC2.', example: 'Always-on API in container task 0.25 vCPU 512MB.' }, { term: '15-minute cap', longForm: 'Lambda maximum timeout', plainDefinition: 'Lambda cannot run longer than 900 seconds.', example: 'Long video transcode → Fargate or MediaConvert.' }, { term: 'WebSocket', longForm: 'Long-lived TCP connection', plainDefinition: 'Persistent connection ill-suited to Lambda invoke model.', example: 'API Gateway WebSocket with Lambda per message OK; not same as server-held socket on EC2.' }, { term: 'Steady QPS', longForm: 'Sustained queries per second', plainDefinition: 'Continuous load often cheaper on right-sized EC2/Fargate.', example: '24/7 500 RPS API on c7g.large ASG vs Lambda bill.' }] },
    steps: { title: 'Choose compute platform', items: [{ title: 'Duration and model', body: 'Under 15 min event-driven → Lambda candidate. Hours → EC2/Fargate.' }, { title: 'Traffic shape', body: 'Spiky/idle → Lambda. Flat 24/7 → EC2/Fargate with RI/Savings Plans.' }, { title: 'Connection needs', body: 'WebSocket server, gRPC streaming → EC2/Fargate.' }, { title: 'Ops tolerance', body: 'Lambda least ops; EC2 most control; Fargate middle for containers.' }] },
    diagram: { title: 'Compute choice matrix', source: 'flowchart TB\n  Q{Workload?}\n  Q -->|Event short burst| L[Lambda]\n  Q -->|Container steady| F[Fargate ECS]\n  Q -->|Full OS kernel GPU| E[EC2 ASG]\n  Q -->|Long workflow| SF[Step Functions + Lambda slices]' },
    snippets: [
      { language: 'yaml', label: 'Fargate task definition excerpt', code: 'TaskDefinition:\n  Type: AWS::ECS::TaskDefinition\n  Properties:\n    RequiresCompatibilities: [FARGATE]\n    Cpu: "256"\n    Memory: "512"\n    NetworkMode: awsvpc\n    ContainerDefinitions:\n      - Name: api\n        Image: !Sub "${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/api:latest"\n        PortMappings:\n          - ContainerPort: 8080', explanation: 'Fargate for always-on container without EC2 patching burden.' },
      { language: 'yaml', label: 'Lambda for S3 triggered ETL', code: 'EtlFunction:\n  Type: AWS::Lambda::Function\n  Properties:\n    Runtime: nodejs20.x\n    Handler: index.handler\n    Timeout: 300\n    MemorySize: 1024', explanation: 'Short event-driven transform — Lambda sweet spot vs idle EC2.' },
      { language: 'bash', label: 'Compare Lambda vs EC2 rough invoke cost', code: '# Lambda: requests + GB-seconds\n# EC2: hourly on-demand or RI for 730h/month steady\n# Use AWS Pricing Calculator for crossover at your RPS + duration', explanation: 'Interview answer: calculate crossover — no universal winner.' },
      { language: 'bash', label: 'ECS Fargate service create sketch', code: 'aws ecs create-service \\\n  --cluster prod \\\n  --service-name api \\\n  --task-definition api:3 \\\n  --desired-count 2 \\\n  --launch-type FARGATE \\\n  --network-configuration "awsvpcConfiguration={subnets=[subnet-a,subnet-b],securityGroups=[sg-api],assignPublicIp=DISABLED}"', explanation: 'Multi-AZ Fargate behind ALB — parallel to EC2 ASG pattern.' },
    ],
    comparisonRows: [['Billing', 'Per invoke + GB-second', 'EC2 per second/hour; Fargate per task vCPU/GB hour'], ['Max duration', '15 minutes', 'Unlimited on EC2/Fargate'], ['Cold start', 'Yes — init latency', 'EC2/Fargate warm after boot'], ['Control', 'Runtime only', 'EC2 full OS; Fargate container']],
    pitfallsBody: 'Lambda for 24/7 high RPS API without cost model — EC2 may win. EC2 t3.micro for sporadic cron every hour — Lambda cheaper. Fargate for sub-second cron — Lambda simpler.',
    seniorProse: 'EKS on Fargate vs EC2 node groups trade ops vs cost. Lambda Function URLs for simple HTTP without API Gateway. How to prove it in production: Cost Explorer by service, P99 latency under load test, ops hours for patching EC2 AMIs.',
    seniorRows: [['Lambda + API GW', 'Spiky HTTP APIs', 'Cold start P99; 29s API GW limit'], ['Fargate + ALB', 'Steady container service', 'No scale-to-zero default cost'], ['EC2 ASG + RI', 'Lowest steady $ at scale', 'Patch and AMI pipeline burden'], ['Hybrid', 'Lambda edges + Fargate core', 'Architecture complexity']],
    rejectionBody: "Lambda for everything or EC2 for everything gets rejected. Strong answer: traffic shape, duration, connection model, ops cost — hybrid common.",
    takeaways: ['Lambda: event-driven, short, spiky — not long TCP or >15 min jobs.', 'Fargate: containers without EC2 management for steady services.', 'EC2: full control, WebSockets, GPU, lowest steady cost with commitment.', '60s: Burst short → Lambda. Steady container → Fargate. Kernel/long TCP → EC2. Calculate crossover.', 'Follow-up: when Step Functions over single Lambda?'],
    pitfalls: ['WebSocket server entirely on Lambda — weak; API GW WebSocket per message differs from EC2 socket server.', 'Strong answer: persistent connections on EC2/Fargate; Lambda for handlers.', 'Ignoring Lambda 15-minute timeout for batch ETL.', 'EC2 for once-daily 30s cron — Lambda EventBridge schedule cheaper.'],
    jsTs: [{ language: 'javascript', concept: 'Express on Fargate vs Lambda adapter', note: '@vendia/serverless-express wraps Express for Lambda — same app code, different deployment target tradeoffs.', futureTopicSlug: 'aws/lambda/express-adapter' }, { language: 'typescript', concept: 'Long-running worker', note: 'BullMQ worker on Fargate for jobs >15 min vs Step Functions chaining Lambda steps for workflow.', futureTopicSlug: 'aws/compute/workflow-split' }],
    sources: [{ title: 'Lambda quotas', url: 'https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html' }, { title: 'AWS Fargate', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html' }],
  };
}

const written = [];

for (const mod of MODULES) {
  const dir = path.join(modulesDir, mod.folder);
  const moduleId = mod.module.id;

  writeJson(path.join(dir, 'module.json'), mod.module);
  written.push(path.join(dir, 'module.json'));

  writeJson(path.join(dir, 'mindmap.json'), {
    moduleId,
    title: mod.mindmap.title ?? `${mod.module.title} — concept map`,
    ...mod.mindmap,
  });
  written.push(path.join(dir, 'mindmap.json'));

  writeJson(path.join(dir, 'quick-overview.json'), {
    moduleId,
    title: mod.quickOverview.title ?? `${mod.module.slug} in one screen`,
    ...mod.quickOverview,
  });
  written.push(path.join(dir, 'quick-overview.json'));

  const interviewItems = mod.interview.items ?? mod.interview;
  writeJson(path.join(dir, 'interview.json'), {
    moduleId,
    title: mod.interview.title ?? `${mod.module.slug} interview drills`,
    items: interviewItems,
  });
  written.push(path.join(dir, 'interview.json'));

  for (const summary of mod.module.topics) {
    const def = TOPIC_DEFS[summary.id];
    if (!def) {
      throw new Error(`Missing topic definition: ${summary.id}`);
    }
    const topic = buildTopic({ ...def, moduleId });
    const topicPath = path.join(dir, 'topics', `${summary.slug}.json`);
    writeJson(topicPath, topic);
    written.push(topicPath);
  }
}

console.log(`Generated ${written.length} files:\n${written.map((f) => path.relative(root, f)).join('\n')}`);
