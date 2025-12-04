import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { MailerService } from "@nestjs-modules/mailer";

@Controller()
export class AppController {
  constructor(private readonly mailerService: MailerService) {
    console.log("📧 [EmailService] Controller initialized");
  }

  @EventPattern("password_reset_requested")
  async handlePasswordReset(@Payload() data: any) {
    console.log("📬 [EmailService] Received password_reset_requested event");
    console.log("📋 [EmailService] Event data:", JSON.stringify(data, null, 2));

    const { email, resetToken, username } = data;

    if (!email || !resetToken || !username) {
      console.error(
        "❌ [EmailService] Missing required fields in event data:",
        { email, resetToken, username }
      );
      return;
    }

    console.log(
      `📧 [EmailService] Preparing to send password reset email to: ${email}`
    );

    const resetLink = `${process.env.WEB_URL}/reset-password?token=${resetToken}`;
    console.log(`🔗 [EmailService] Reset link: ${resetLink}`);

    try {
      console.log(`[EmailService] Attempting to send email...`);
      console.log(
        `[EmailService] SMTP Config - Host: ${process.env.SMTP_HOST}, Port: ${process.env.SMTP_PORT}`
      );
      console.log(
        `[EmailService] SMTP User: ${process.env.SMTP_USER ? "✓ Set" : "✗ Not set"}`
      );
      console.log(
        `[EmailService] SMTP Pass: ${process.env.SMTP_PASS ? "✓ Set" : "✗ Not set"}`
      );

      await this.mailerService.sendMail({
        to: email,
        subject: "Redefinição de Senha - Task Manager",
        text: `Olá ${username},\n\nVocê solicitou a redefinição de senha.\n\nClique no link abaixo para redefinir sua senha:\n${resetLink}\n\nEste link expira em 1 hora.\n\nSe você não solicitou isso, ignore este email.`,
        html: `
          <h2>Olá ${username},</h2>
          <p>Você solicitou a redefinição de senha.</p>
          <p>Clique no botão abaixo para redefinir sua senha:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
          <p>Ou copie e cole este link no navegador:</p>
          <p>${resetLink}</p>
          <p><small>Este link expira em 1 hora.</small></p>
          <p><small>Se você não solicitou isso, ignore este email.</small></p>
        `,
      });

      console.log(
        `✅ [EmailService] Password reset email sent successfully to: ${email}`
      );
    } catch (error) {
      console.error("❌ [EmailService] Error sending email:");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
  }
}
