import nodemailer from 'nodemailer'
import { emailTemplate } from '../tamplates/emailVerification';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'servercomy777@gmail.com',
    pass: 'hcwvfktbuhnjqsmb'
  }
});

export const sendEmail = async (email: string, token: string, resetPassword?: boolean) => {
  try {
    await transporter.sendMail({
      from: 'NotesU',
      to: email,
      subject: "Verify email",
      text: "Plaintext version of the message",
      html: emailTemplate(token, resetPassword)
    })
  } catch (error) {
    console.log(error)
  }
}