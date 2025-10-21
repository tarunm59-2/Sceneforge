import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import type { ApiResponse } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid email address'
        },
        { status: 400 }
      );
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Log for now (later: save to database)
    console.log('New waitlist signup:', email, new Date().toISOString());

    // TODO: Add to database
    // const entry: WaitlistEntry = {
    //   id: crypto.randomUUID(),
    //   email,
    //   createdAt: new Date()
    // };
    // await db.waitlist.create({ data: entry });

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'SceneForge <onboarding@resend.dev>', // Will change this once you verify your domain
        to: email,
        subject: "You're on the SceneForge Waitlist! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0891b2; text-align: center;">Welcome to SceneForge!</h1>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Hey there! 👋
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Thanks for joining the SceneForge waitlist! You're one of the first to get access to our AI-powered 3D world generator.
            </p>

            <div style="background: linear-gradient(135deg, #0891b2 0%, #14b8a6 100%); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <p style="color: white; font-size: 18px; font-weight: bold; margin: 0;">
                🎨 Turn words into explorable 3D worlds
              </p>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              <strong>What's next?</strong>
            </p>

            <ul style="font-size: 16px; line-height: 1.8; color: #333;">
              <li>We'll email you as soon as we launch</li>
              <li>You'll get early access before the public</li>
              <li>We'll send you exclusive updates and sneak peeks</li>
            </ul>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Stay tuned! 🚀
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Best,<br>
              The SceneForge Team
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              You received this email because you signed up for the SceneForge waitlist.
            </p>
          </div>
        `,
      });

      console.log('Confirmation email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Successfully added to waitlist'
    });

  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to join waitlist'
      },
      { status: 500 }
    );
  }
}