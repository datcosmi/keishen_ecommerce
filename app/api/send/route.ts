import { EmailTemplate } from '../../../components/emailTemplate';
import { Resend } from 'resend';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Soporte <support@keishen.com.mx>',
      to: ['delivered@resend.dev'],
      subject: 'Hello world',
      react: React.createElement(EmailTemplate, { firstName: 'John' }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}