import { sendEmail } from "../src/lib/mailer.js";

async function run() {
  console.log("Testing email sending via AWS Mail Manager / SES...");
  const sent = await sendEmail({
    to: "alaminislam4122.bd@gmail.com",
    subject: "iFormat Gmail SMTP Test OTP",
    template: "otp-verification",
    data: {
      name: "Alamin Islam",
      code: "739201",
    },
  });
  console.log("Email Send Status:", sent);
}

run();
