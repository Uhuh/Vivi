import { Message, MessageAttachment } from 'discord.js';
import { sha256 } from 'crypto-hash';
import * as Canvas from 'canvas';

export async function generateCaptcha(message: Message) {
  const { id } = message.author;
  const { createdTimestamp } = message;

  const captcha = await sha256(
    `${id}${createdTimestamp}${String(Math.random() * 4096)}`
  );

  const canvas = Canvas.createCanvas(350, 175);
  const ctx = canvas.getContext('2d');
  Canvas.registerFont('assets/fonts/Inter-SemiBold.ttf', { family: 'Inter' });
  ctx.font = '28px Inter';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(captcha.slice(-8), 175, 87.5);

  const attach = new MessageAttachment(canvas.toBuffer(), 'captcha.jpg');

  message.channel.send(attach);
}
