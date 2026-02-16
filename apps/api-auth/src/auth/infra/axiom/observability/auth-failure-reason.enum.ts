export enum AuthFailureReason {
  UserNotFound = 'USER_NOT_FOUND',
  PasswordMismatch = 'PASSWORD_MISMATCH',
  InvalidRefreshToken = 'INVALID_REFRESH_TOKEN',
  TokenNotFound = 'TOKEN_NOT_FOUND',
  TokenHashMismatch = 'TOKEN_HASH_MISMATCH',
  TokenVerificationFailed = 'TOKEN_VERIFICATION_FAILED',
  EmailAlreadyRegistered = 'EMAIL_ALREADY_REGISTERED'
}
