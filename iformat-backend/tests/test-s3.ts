import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../src/config/env.js";

async function verifyS3() {
  console.log("--------------------------------------------------");
  console.log("🔍 Checking AWS S3 Bucket Live Connection...");
  console.log("Bucket Name:", env.AWS_S3_BUCKET);
  console.log("AWS Region :", env.AWS_REGION);
  console.log("Access Key :", env.AWS_ACCESS_KEY_ID ? `${env.AWS_ACCESS_KEY_ID.slice(0, 8)}...` : "NOT_SET");
  console.log("--------------------------------------------------");

  const s3 = new S3Client({
    region: env.AWS_REGION,
    ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          },
        }
      : {}),
  });

  const testKey = `test-health/healthcheck-${Date.now()}.txt`;
  const testContent = `iFormat S3 Connectivity Verification - ${new Date().toISOString()}`;

  // 1. Upload Test Object
  process.stdout.write("1. Testing PutObject (Upload)... ");
  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: "text/plain",
    })
  );
  console.log("✅ SUCCESS");

  // 2. Presigned Upload URL Test
  process.stdout.write("2. Testing Presigned Upload URL generation... ");
  const presignedPutUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: `test-health/presigned-${Date.now()}.pdf`,
      ContentType: "application/pdf",
    }),
    { expiresIn: 900 }
  );
  if (!presignedPutUrl.startsWith("https://")) throw new Error("Invalid presigned URL");
  console.log("✅ SUCCESS");

  // 3. Presigned Download URL Test
  process.stdout.write("3. Testing Presigned Download URL generation... ");
  const presignedGetUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: testKey,
    }),
    { expiresIn: 900 }
  );
  if (!presignedGetUrl.startsWith("https://")) throw new Error("Invalid download URL");
  console.log("✅ SUCCESS");

  // 4. List Objects Test
  process.stdout.write("4. Testing ListObjectsV2... ");
  const listResult = await s3.send(
    new ListObjectsV2Command({
      Bucket: env.AWS_S3_BUCKET,
      MaxKeys: 10,
    })
  );
  console.log(`✅ SUCCESS (Found ${listResult.KeyCount} objects)`);

  // 5. Delete Test Object
  process.stdout.write("5. Testing DeleteObject (Cleanup)... ");
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: testKey,
    })
  );
  console.log("✅ SUCCESS");

  console.log("--------------------------------------------------");
  console.log("🎉 ALL S3 BUCKET OPERATIONS PASSED (100% PERFECTLY CONNECTED!)");
  console.log("--------------------------------------------------");
}

verifyS3().catch((err) => {
  console.error("\n❌ S3 Verification Failed:", err);
  process.exit(1);
});
