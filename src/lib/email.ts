import { Resend } from 'resend';

// If an API key is not provided, we will mock the email sending
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendWinnerEmail(email: string, name: string, prizeAmount: string) {
  if (!resend) {
    console.log(`[MOCK EMAIL] Sent to ${email}: Congratulations ${name}, you won ${prizeAmount} in this month's draw!`);
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Digital Heroes <notifications@digitalheroes.co.in>',
      to: email,
      subject: 'You are a winner! 🏆',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Congratulations ${name}!</h2>
          <p>You matched the winning numbers in this month's Digital Heroes draw!</p>
          <p>Your estimated prize is: <strong>${prizeAmount}</strong></p>
          <p>Please log in to your dashboard to upload your score verification proofs to claim your reward.</p>
        </div>
      `,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
