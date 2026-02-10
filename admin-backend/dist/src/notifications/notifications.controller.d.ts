import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notifications;
    constructor(notifications: NotificationsService);
    getLogs(memberId?: string, limit?: string): Promise<{
        id: string;
        memberId: string | null;
        channel: string;
        type: string;
        status: string;
        payload: string | null;
        sentAt: Date;
    }[]>;
}
