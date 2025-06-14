import { z } from 'zod';
import { ERROR_MESSAGES } from '../../../Shared/constants/messages';
import Role from '../../../Shared/constants/roles';

export const createAdminSchema = z.object({
    name: z.string().min(3, ERROR_MESSAGES.NAME_TOO_SHORT),

    email: z.string()
        .email(ERROR_MESSAGES.INVALID_EMAIL),

    password: z.string()
        .min(6, ERROR_MESSAGES.PASSWORD_TOO_SHORT),
    role: z.string().refine((val) => val === "ADMIN", {
        message: "You can't create a user other than ADMIN",
    }),
    group: z.string().nonempty(ERROR_MESSAGES.GROUP_REQUIRED)


});

export const createUserManagerSchema = z.object({
    name: z.string().min(2, ERROR_MESSAGES.NAME_TOO_SHORT),

    email: z.string()
        .email(ERROR_MESSAGES.INVALID_EMAIL),

    password: z.string()
        .min(6, ERROR_MESSAGES.PASSWORD_TOO_SHORT),

    role: z.literal(Role.UNIT_MANAGER),

    group: z.string().optional(),
})
