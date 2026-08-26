import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "he24ywr9xaq8.eig6.mail-manager-smtp.amazonaws.com",
  port: 587,
  secure: false,
  auth: {
    user: "inp-jd5t3cspuqeokrdurk3gzhto",
    pass: "q]s&[3{BXNcEjD86@{03fJBzE[$egL}t",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function verify() {
  try {
    console.log("Verifying AWS SMTP Connection...");
    await transporter.verify();
    console.log("✅ AWS Mail Manager SMTP Server is READY and authenticated successfully!");
  } catch (error) {
    console.error("❌ SMTP Verification Error:", error);
  }
}

verify();
