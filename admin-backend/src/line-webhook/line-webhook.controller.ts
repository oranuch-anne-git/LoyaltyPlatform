import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { LineWebhookService } from './line-webhook.service';
import * as crypto from 'crypto';

@Controller('webhook/line')
export class LineWebhookController {
  constructor(private line: LineWebhookService) {}

  @Get()
  getWebhook() {
    return { status: 'LINE webhook endpoint. Use POST for events.' };
  }

  @Post()
  async handleWebhook(@Req() req: Request, @Res() res: Response, @Body() body: any) {
    const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
    if (channelSecret && body.destination) {
      const signature = req.headers['x-line-signature'] as string;
      if (signature) {
        const hash = crypto.createHmac('sha256', channelSecret).update(JSON.stringify(body)).digest('base64');
        if (hash !== signature) {
          res.status(401).send('Invalid signature');
          return;
        }
      }
    }

    const events = body.events || [];
    for (const event of events) {
      if (event.type === 'follow') {
        await this.line.handleFollow(event.source.userId, event.profile?.displayName);
      }
      if (event.type === 'message' && event.message?.type === 'text') {
        await this.line.handleMessage(event.source.userId, event.message.text);
      }
    }
    res.status(200).send('OK');
  }
}
