import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { htmlContent, recipientEmail } = await request.json()

    if (!recipientEmail || !htmlContent) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 })
    }

    // In a production environment, you would integrate with an email service like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Nodemailer with SMTP

    // For now, we'll simulate the email sending
    // Replace this with actual email service integration

    console.log("[v0] Email PDF request received for:", recipientEmail)
    console.log("[v0] HTML content length:", htmlContent.length)

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // TODO: Integrate with actual email service
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'Goodwill Central Texas <noreply@goodwillcentraltexas.org>',
    //   to: recipientEmail,
    //   subject: 'Your Referral Report',
    //   html: htmlContent,
    // })

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ message: "Failed to send email" }, { status: 500 })
  }
}
