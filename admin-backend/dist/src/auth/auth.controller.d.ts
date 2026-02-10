import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(dto: LoginDto, req: {
        ip?: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: string;
        };
    }>;
    token(apiKeyHeader: string | undefined, body: {
        apiKey?: string;
    }, req: {
        ip?: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: string;
        };
    }>;
    me(req: {
        user: {
            id: string;
            email: string;
            role: string;
        };
    }): Promise<{
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
}
