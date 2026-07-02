// WhatsApp Service for sending attendance notifications
// Supports multiple providers: Twilio, Meta WhatsApp Business API, etc.

class WhatsAppService {
  constructor() {
    this.provider = process.env.WHATSAPP_PROVIDER || 'twilio';
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.WHATSAPP_FROM_NUMBER;
  }

  async sendAttendanceNotification(phone, studentName, rollNumber, className, status) {
    try {
      if (!phone) {
        throw new Error('Student phone number not provided');
      }

      // Format phone number (remove spaces, dashes, etc.)
      const formattedPhone = phone.replace(/[\s\-\(\)]/g, '');
      
      // Ensure phone has country code (default to Pakistan +92 if not present)
      const phoneWithCountryCode = formattedPhone.startsWith('+') 
        ? formattedPhone 
        : `+92${formattedPhone.replace(/^0/, '')}`;

      const message = this.formatAttendanceMessage(studentName, rollNumber, className, status);

      switch (this.provider) {
        case 'twilio':
          return await this.sendViaTwilio(phoneWithCountryCode, message);
        case 'meta':
          return await this.sendViaMeta(phoneWithCountryCode, message);
        default:
          throw new Error(`Unsupported WhatsApp provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('WhatsApp service error:', error);
      throw error;
    }
  }

  formatAttendanceMessage(studentName, rollNumber, className, status) {
    if (status === 'ABSENT') {
      return `*Fusion College Attendance Alert*\n\n` +
             `Student: ${studentName}\n` +
             `Roll No: ${rollNumber}\n` +
             `Class: ${className}\n\n` +
             `Status: ABSENT\n\n` +
             `Please ensure attendance tomorrow.\n\n` +
             `- Fusion College LMS`;
    } else {
      return `*Fusion College Attendance*\n\n` +
             `Student: ${studentName}\n` +
             `Roll No: ${rollNumber}\n` +
             `Class: ${className}\n\n` +
             `Status: ${status}\n\n` +
             `- Fusion College LMS`;
    }
  }

  async sendViaTwilio(to, message) {
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    // In a real implementation, you would use the Twilio SDK
    // const twilio = require('twilio')(this.accountSid, this.authToken);
    // const response = await twilio.messages.create({
    //   from: `whatsapp:${this.fromNumber}`,
    //   to: `whatsapp:${to}`,
    //   body: message
    // });

    // For now, return a mock response
    console.log(`[Twilio Mock] Sending to ${to}: ${message}`);
    return { success: true, provider: 'twilio', to, message };
  }

  async sendViaMeta(to, message) {
    const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      throw new Error('Meta WhatsApp credentials not configured');
    }

    // In a real implementation, you would call the Meta WhatsApp Business API
    // const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: to,
    //     type: 'text',
    //     text: { body: message }
    //   })
    // });

    // For now, return a mock response
    console.log(`[Meta Mock] Sending to ${to}: ${message}`);
    return { success: true, provider: 'meta', to, message };
  }
}

export default new WhatsAppService();
