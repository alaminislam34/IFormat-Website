import { sendEmail } from "../src/lib/mailer.js";

async function run() {
  console.log("Testing email sending with info@iformatbranding.com...");
  const sent = await sendEmail({
    to: "alaminislam4122.bd@gmail.com",
    subject: "Your iFormat verification code is 739201",
    template: "otp-verification",
    data: {
      name: "Alamin Islam",
      code: "739201",
    },
  });
  console.log("Email Send Status:", sent);
}

run();
