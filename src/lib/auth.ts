import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "CUSTOMER",
                required: false,
            },
            phone: {
                type: "string",
                required: false,
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false,
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
                const info = await transporter.sendMail({
                    from: '"FoodHub" <noreply@foodhub.com>',
                    to: user.email,
                    subject: "Please Verify Your Email",
                    text: `Please verify your email by clicking the link below: ${verificationUrl}`,
                    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify Your Email</title>
<style>
  body {
    margin: 0;
    padding: 0;
    background-color: #f4f6f8;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  }
  .email-wrapper {
    max-width: 600px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  }
  .email-header {
    background: linear-gradient(135deg, #f97316, #ea580c);
    padding: 32px;
    text-align: center;
    color: #ffffff;
  }
  .email-header h1 {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
  }
  .email-body {
    padding: 32px;
    color: #374151;
    line-height: 1.6;
  }
  .email-body h2 {
    margin-top: 0;
    font-size: 22px;
    font-weight: 600;
  }
  .verify-button {
    display: inline-block;
    margin: 24px 0;
    padding: 14px 28px;
    background: #f97316;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
  }
  .verify-button:hover {
    background: #ea580c;
  }
  .email-footer {
    padding: 24px;
    background: #f9fafb;
    text-align: center;
    font-size: 13px;
    color: #6b7280;
  }
  .email-footer a {
    color: #f97316;
    text-decoration: none;
  }
</style>
</head>

<body>
  <div class="email-wrapper">
    <div class="email-header">
      <h1>Welcome to FoodHub, ${user.name}!</h1>
    </div>

    <div class="email-body">
      <h2>Verify your email address</h2>
      <p>
        Thanks for signing up, ${user.name}! Please confirm your email address by clicking the button below.
      </p>

      <a href="${verificationUrl}" class="verify-button">
        Verify Email
      </a>

      <p>
        If the button doesn't work, copy and paste this link into your browser:
      </p>

      <p style="word-break: break-all;">
        <a href="${verificationUrl}">${verificationUrl}</a>
      </p>

      <p>
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>

    <div class="email-footer">
      &copy; 2026 FoodHub. All rights reserved.
    </div>
  </div>
</body>
</html>
                    `,
                });
                console.log("Verification email sent:", info.messageId);
            } catch (error) {
                console.error("Error sending verification email:", error);
                throw new Error("Failed to send verification email");
            }
        },
    },
    socialProviders: {
        google: {
            prompt: "select_account consent",
            accessType: "offline",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
});
