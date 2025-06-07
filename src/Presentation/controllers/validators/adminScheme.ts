import { z } from 'zod';
import { ERROR_MESSAGES } from '../../../Shared/constants/messages';
import Role from '../../../Shared/constants/roles';

export const createAdminSchema = z.object({
    name: z.string().min(2, ERROR_MESSAGES.NAME_TOO_SHORT),

    email: z.string()
        .email(ERROR_MESSAGES.INVALID_EMAIL),

    password: z.string()
        .min(6, ERROR_MESSAGES.PASSWORD_TOO_SHORT),

    role: z.literal(Role.ADMIN),

    group: z.string().optional(),
});
