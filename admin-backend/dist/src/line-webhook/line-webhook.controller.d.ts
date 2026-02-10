import { Request, Response } from 'express';
import { LineWebhookService } from './line-webhook.service';
export declare class LineWebhookController {
    private line;
    constructor(line: LineWebhookService);
    getWebhook(): {
        status: string;
    };
    handleWebhook(req: Request, res: Response, body: any): Promise<void>;
}
