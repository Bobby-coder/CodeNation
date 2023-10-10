import dotenv from "dotenv";
import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";

// load env variables
dotenv.config();

interface Emailoptions {
  userEmail: string;
  subject: string;
  templateName: string;
  templateData: { [key: string]: any };
}

async function sendMail(options: Emailoptions): Promise<void> {
  // create transporter object using nodemailer.createTransport()
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const { userEmail, subject, templateName, templateData } = options;

  // get email template path using template name
  const templatePath = path.join(__dirname, "../mails", templateName);

  // Render HTML template for email using ejs.renderFile()
  const htmlTemplate: string = await ejs.renderFile(templatePath, templateData);

  // send mail using transporter.sendMail()
  await transporter.sendMail({
    from: process.env.SMTP_MAIL,
    to: userEmail,
    subject,
    html: htmlTemplate,
  });
}

export default sendMail;
