import { s3Client, getPresignedUploadUrl, getPresignedDownloadUrl } from "../src/lib/s3.js";
import { PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { env } from "../src/config/env.js";

async function verifyS3Live() {
  try {
    console.log(`🔍 Verifying live AWS S3 access for bucket "${env.AWS_S3_BUCKET}" in region "${env.AWS_REGION}"...`);
    
    // 1. Check bucket existence & permissions
    const headCommand = new HeadBucketCommand({ Bucket: env.AWS_S3_BUCKET });
    await s3Client.send(headCommand);
    console.log(`✅ Bucket "${env.AWS_S3_BUCKET}" verified and accessible!`);

    // 2. Test uploading a small test object
    const testKey = `healthcheck/test-${Date.now()}.txt`;
    const putCommand = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: testKey,
      Body: "AWS S3 connection verified for iFormat",
      ContentType: "text/plain",
    });
    await s3Client.send(putCommand);
    console.log(`✅ Test object uploaded successfully to "${testKey}"!`);

    // 3. Test Presigned URLs
    const presignedUpload = await getPresignedUploadUrl("avatars/user-123.jpg", "image/jpeg");
    console.log(`✅ Presigned upload URL generated successfully: ${presignedUpload.slice(0, 80)}...`);

    // 4. Cleanup test object
    const delCommand = new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: testKey,
    });
    await s3Client.send(delCommand);
    console.log(`✅ Test object cleaned up successfully!`);

    console.log("\n🎉 ALL AWS S3 STORAGE TESTS PASSED 100%!");
  } catch (error: any) {
    console.error("❌ S3 Verification Error:", error.message || error);
  }
}

verifyS3Live();
