import "dotenv/config";
import {
  CloudFrontClient,
  CreateDistributionCommand,
  CreateOriginAccessControlCommand,
  ListOriginAccessControlsCommand,
} from "@aws-sdk/client-cloudfront";
import { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } from "@aws-sdk/client-s3";

const s3Bucket = process.env.AWS_S3_BUCKET || "ifromat-media-db";
const awsRegion = process.env.AWS_REGION || "eu-central-1";
const s3OriginDomain = `${s3Bucket}.s3.${awsRegion}.amazonaws.com`;

const cfClient = new CloudFrontClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function setupCloudFront() {
  console.log("🚀 Starting CloudFront Setup for S3 Bucket:", s3Bucket);
  console.log("📍 Origin Domain:", s3OriginDomain);

  // 1. Check or Create Origin Access Control (OAC)
  let oacId: string | undefined;
  try {
    const listOac = await cfClient.send(new ListOriginAccessControlsCommand({}));
    const existing = listOac.OriginAccessControlList?.Items?.find(
      (item) => item.Name === `${s3Bucket}-oac`
    );

    if (existing) {
      oacId = existing.Id;
      console.log("✅ Using existing OAC:", oacId);
    } else {
      const createOacRes = await cfClient.send(
        new CreateOriginAccessControlCommand({
          OriginAccessControlConfig: {
            Name: `${s3Bucket}-oac`,
            Description: `OAC for ${s3Bucket}`,
            OriginAccessControlOriginType: "s3",
            SigningBehavior: "always",
            SigningProtocol: "sigv4",
          },
        })
      );
      oacId = createOacRes.OriginAccessControl?.Id;
      console.log("✅ Created new OAC:", oacId);
    }
  } catch (err: any) {
    console.warn("⚠️ OAC setup note:", err.message);
  }

  // 2. Create CloudFront Distribution
  const originId = `S3-${s3Bucket}`;
  const callerReference = `iformat-${Date.now()}`;

  const distributionConfig: any = {
    CallerReference: callerReference,
    Comment: `iFormat Media & Asset CDN (${s3Bucket})`,
    Enabled: true,
    Origins: {
      Quantity: 1,
      Items: [
        {
          Id: originId,
          DomainName: s3OriginDomain,
          OriginAccessControlId: oacId || "",
          S3OriginConfig: {
            OriginAccessIdentity: "", // Empty when using OAC
          },
        },
      ],
    },
    DefaultCacheBehavior: {
      TargetOriginId: originId,
      ViewerProtocolPolicy: "redirect-to-https",
      AllowedMethods: {
        Quantity: 3,
        Items: ["GET", "HEAD", "OPTIONS"],
        CachedMethods: {
          Quantity: 2,
          Items: ["GET", "HEAD"],
        },
      },
      Compress: true,
      // Managed-CachingOptimized CachePolicyId
      CachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
      // Managed-CORS-and-S3Origin OriginRequestPolicyId
      OriginRequestPolicyId: "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf",
    },
    PriceClass: "PriceClass_100", // US, Canada, Europe (Lowest cost, top tier performance)
  };

  console.log("⏳ Creating CloudFront distribution...");
  const createDistRes = await cfClient.send(
    new CreateDistributionCommand({
      DistributionConfig: distributionConfig,
    })
  );

  const distribution = createDistRes.Distribution;
  const cfDomain = distribution?.DomainName;
  const cfArn = distribution?.ARN;
  console.log("🎉 CloudFront Distribution Created Successfully!");
  console.log("🆔 Distribution ID:", distribution?.Id);
  console.log("🌐 CloudFront Domain:", cfDomain);
  console.log("📌 Status:", distribution?.Status);

  // 3. Update S3 Bucket Policy to allow CloudFront OAC read
  if (cfArn) {
    console.log("🔐 Updating S3 bucket policy to allow CloudFront distribution access...");
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "AllowCloudFrontServicePrincipalReadOnly",
          Effect: "Allow",
          Principal: {
            Service: "cloudfront.amazonaws.com",
          },
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${s3Bucket}/*`,
          Condition: {
            StringEquals: {
              "AWS:SourceArn": cfArn,
            },
          },
        },
      ],
    };

    try {
      await s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: s3Bucket,
          Policy: JSON.stringify(policy),
        })
      );
      console.log("✅ S3 Bucket Policy successfully granted to CloudFront!");
    } catch (policyErr: any) {
      console.warn("⚠️ S3 Bucket Policy warning (please verify in S3 console if needed):", policyErr.message);
    }
  }

  console.log("\n=======================================================");
  console.log(`Add this to your .env:`);
  console.log(`AWS_CLOUDFRONT_DOMAIN="${cfDomain}"`);
  console.log("=======================================================\n");

  return cfDomain;
}

setupCloudFront().catch((err) => {
  console.error("❌ CloudFront setup failed:", err);
  process.exit(1);
});
