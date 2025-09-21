import { createTransport } from "nodemailer";

async function sendJobApplicationEmail(toEmail, message) {
  try {
    // Configure your transporter (example with Gmail SMTP)
    const transporter = createTransport({
      service: "gmail", // or "outlook", "yahoo", etc.
      auth: {
        user: "neomindnoreply@gmail.com",   // your email
        // TODO: gitignore
        pass: "vzgm snmx slsz kpiq"       // app password (not normal password)
      }
    });

    // Mail options
    const mailOptions = {
      from: '"NeoMind" <neomindnoreply@gmail.com>', // sender info
      to: toEmail,                                // recipient
      subject: "Job Application",                 // hardcoded subject
      text: message                               // email body as strings
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Example usage:
sendJobApplicationEmail("recipient@example.com", "Hello, this is my job application text!");
