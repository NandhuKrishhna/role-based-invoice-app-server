import { z } from "zod";
import { ERROR_MESSAGES } from "../../../Shared/constants/messages";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameSchema = z.string().min(3, { message: ERROR_MESSAGES.NAME_TOO_SHORT })

export const emailSchema = z
  .string()
  .regex(emailRegex, { message: ERROR_MESSAGES.INVALID_EMAIL });
export const passwordSchema = z.string().min(6, { message: ERROR_MESSAGES.PASSWORD_TOO_SHORT })
export const userAgentSchema = z.string().optional()
export const confirmPasswordSchema = z.string().min(6, { message: ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED })



export const loginUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: userAgentSchema,
})



