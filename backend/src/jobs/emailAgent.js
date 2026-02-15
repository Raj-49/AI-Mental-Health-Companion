// -----------------------------
// EMAIL AGENT - Weekly AI Summary
// -----------------------------
import cron from "node-cron";
import prisma from "../config/prismaClient.js";
import { generateWeeklySummary } from "../services/geminiService.js";
import { sendEmail } from "../utils/emailService.js";

/**
 * Get users who are eligible for weekly email
 */
const getEligibleUsers = async () => {
  try {
    const currentDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    // Get users who have enabled weekly emails
    const users = await prisma.user.findMany({
      where: {
        weeklyEmailEnabled: true
      },
      include: {
        preferences: true
      }
    });

    // Filter users based on their schedule
    const eligibleUsers = users.filter(user => {
      // Check if today is in their scheduled days
      const scheduledDays = user.emailScheduleDays 
        ? user.emailScheduleDays.split(',').map(d => parseInt(d.trim()))
        : [0]; // Default to Sunday

      if (!scheduledDays.includes(currentDay)) {
        return false;
      }

      // Check if current time matches their schedule (with 5-minute window)
      const scheduledTime = user.emailScheduleTime || '08:00';
      const [schedHour, schedMin] = scheduledTime.split(':').map(t => parseInt(t));
      
      // Allow emails within 5 minutes of scheduled time
      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (schedHour * 60 + schedMin));
      
      return timeDiff < 5;
    });

    return eligibleUsers;
  } catch (error) {
    console.error("Error getting eligible users:", error);
    return [];
  }
};

/**
 * Get user data for the past week
 */
const getUserWeeklyData = async (userId) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [user, journals, moodLogs, therapyPlans, preferences] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          therapyPlanInEmail: true
        }
      }),
      prisma.journal.findMany({
        where: {
          userId,
          createdAt: { gte: oneWeekAgo }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.moodLog.findMany({
        where: {
          userId,
          loggedAt: { gte: oneWeekAgo }
        },
        orderBy: { loggedAt: 'desc' },
        take: 20
      }),
      prisma.therapyPlan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.userPreference.findUnique({
        where: { userId }
      })
    ]);

    return {
      user,
      journals,
      moodLogs,
      therapyPlans,
      aiTone: preferences?.aiTone || 'empathetic'
    };
  } catch (error) {
    console.error("Error getting user weekly data:", error);
    return null;
  }
};

/**
 * Generate and send weekly summary email
 */
const sendWeeklySummaryEmail = async (user, userData) => {
  try {
    console.log(`Generating weekly summary for ${user.fullName || user.email}...`);

    // Generate AI summary
    const { summary } = await generateWeeklySummary(
      userData, 
      user.therapyPlanInEmail
    );

    // Create HTML email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4f46e5;
          }
          .header h1 {
            color: #4f46e5;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 14px;
          }
          .content {
            margin: 20px 0;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
          }
          .summary {
            background-color: #f8f9ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4f46e5;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
          }
          .cta-button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            padding: 15px;
            background-color: #f0f0f0;
            border-radius: 8px;
          }
          .stat-item {
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 Your Weekly Mental Health Summary</h1>
            <p>${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          <div class="content">
            <p class="greeting">Hi ${user.fullName || 'there'}! 👋</p>
            
            <p>Here's your personalized weekly summary from your AI Mental Health Companion.</p>
            
            <div class="stats">
              <div class="stat-item">
                <div class="stat-number">${userData.journals.length}</div>
                <div class="stat-label">Journal Entries</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${userData.moodLogs.length}</div>
                <div class="stat-label">Mood Logs</div>
              </div>
              ${user.therapyPlanInEmail ? `
              <div class="stat-item">
                <div class="stat-number">${userData.therapyPlans.length}</div>
                <div class="stat-label">Active Goals</div>
              </div>
              ` : ''}
            </div>
            
            <div class="summary">
              ${summary}
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="cta-button">
                View Your Dashboard →
              </a>
            </center>
          </div>
          
          <div class="footer">
            <p>You're receiving this email because you opted in for weekly AI summaries.</p>
            <p>You can manage your email preferences in your <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile">profile settings</a>.</p>
            <p style="margin-top: 15px; color: #999;">
              © ${new Date().getFullYear()} AI Mental Health Companion. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await sendEmail({
      to: user.email,
      subject: `🌟 Your Weekly Mental Health Summary - ${new Date().toLocaleDateString()}`,
      html: htmlContent
    });

    console.log(`✓ Weekly summary sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error(`✗ Error sending email to ${user.email}:`, error);
    return false;
  }
};

/**
 * Process weekly emails for all eligible users
 */
const processWeeklyEmails = async () => {
  console.log("\n=== Starting Weekly Email Agent ===");
  console.log(`Time: ${new Date().toLocaleString()}`);

  try {
    const eligibleUsers = await getEligibleUsers();
    
    if (eligibleUsers.length === 0) {
      console.log("No eligible users for this time slot.");
      return;
    }

    console.log(`Found ${eligibleUsers.length} eligible user(s)`);

    for (const user of eligibleUsers) {
      try {
        // Get user's weekly data
        const userData = await getUserWeeklyData(user.id);

        if (!userData || !userData.user) {
          console.log(`Skipping user ${user.email} - no data found`);
          continue;
        }

        // Check if user has any activity
        if (userData.journals.length === 0 && userData.moodLogs.length === 0) {
          console.log(`Skipping user ${user.email} - no activity this week`);
          continue;
        }

        // Send email
        await sendWeeklySummaryEmail(user, userData);
        
        // Add small delay between emails
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
        continue;
      }
    }

    console.log("=== Weekly Email Agent Completed ===\n");
  } catch (error) {
    console.error("Error in weekly email agent:", error);
  }
};

/**
 * Initialize cron job
 * Runs every 5 minutes to check for eligible users
 * This allows flexible scheduling per user
 */
export const initializeEmailAgent = () => {
  // Run every 5 minutes to check for users who need emails
  cron.schedule('*/5 * * * *', async () => {
    await processWeeklyEmails();
  }, {
    timezone: process.env.CRON_TIMEZONE || "Asia/Kolkata"
  });

  console.log("✓ Email Agent initialized - checking every 5 minutes for scheduled emails");
  console.log(`  Timezone: ${process.env.CRON_TIMEZONE || "Asia/Kolkata"}`);
};

// Manual trigger function for testing
export const triggerWeeklyEmailManually = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const userData = await getUserWeeklyData(userId);
    await sendWeeklySummaryEmail(user, userData);
    
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending manual email:", error);
    throw error;
  }
};

export default {
  initializeEmailAgent,
  triggerWeeklyEmailManually,
  processWeeklyEmails
};
