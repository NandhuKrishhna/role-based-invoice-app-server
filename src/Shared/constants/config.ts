// Token keys
export const TOKENS = {
    ACCESS: 'accessToken',
    REFRESH: 'refreshToken',
};

// Token expiration durations
// config.ts
export const TOKEN_EXPIRATION = {
    ACCESS: '1h',
    REFRESH: '7d',
} as const;

// Environment names
export const ENVIRONMENTS = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
};
