/**
 * 인증 관련 도메인 타입 정의
 */
import { UserId, Email, ISODateString } from '../../../shared/types/common.types';
// 사용자 엔티티
export interface User {
  id: UserId;
  email: Email;
  name: string;
  phone?: string;
  profileImage?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
// 사용자 프로필
export interface UserProfile extends User {
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  address?: Address;
  preferences?: UserPreferences;
}
// 주소 정보
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
// 사용자 설정
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  notifications: NotificationSettings;
  security: SecuritySettings;
}
// 알림 설정
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  transaction: boolean;
  security: boolean;
}
// 보안 설정
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  loginAlerts: boolean;
  deviceManagement: boolean;
}
// 인증 상태
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}
// 인증 에러
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  field?: string;
}
// 인증 에러 코드
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
// 로그인 타입
export type LoginType = 'id' | 'certificate' | 'biometric' | 'simple';
// 로그인 요청
export interface LoginRequest {
  type: LoginType;
  credentials: LoginCredentials;
  deviceInfo?: DeviceInfo;
}
// 로그인 자격 증명 (Union Type)
export type LoginCredentials = 
  | IdPasswordCredentials
  | CertificateCredentials
  | BiometricCredentials
  | SimplePasswordCredentials;
// ID/패스워드 로그인
export interface IdPasswordCredentials {
  type: 'id';
  userId: string;
  password: string;
  saveId?: boolean;
}
// 인증서 로그인
export interface CertificateCredentials {
  type: 'certificate';
  certificateId: string;
  pin: string;
}
// 생체인증 로그인
export interface BiometricCredentials {
  type: 'biometric';
  userId: string;
  biometricData: string;
}
// 간편비밀번호 로그인
export interface SimplePasswordCredentials {
  type: 'simple';
  userId: string;
  simplePassword: string;
}
// 디바이스 정보
export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  appVersion: string;
  ipAddress?: string;
}
// 세션 정보
export interface Session {
  id: string;
  userId: UserId;
  deviceId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: ISODateString;
  createdAt: ISODateString;
  lastActivityAt: ISODateString;
}
// 회원가입 요청
export interface SignUpRequest {
  email: Email;
  password: string;
  name: string;
  phone: string;
  birthDate: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing?: boolean;
}
// 비밀번호 재설정 요청
export interface PasswordResetRequest {
  email: Email;
  verificationCode: string;
  newPassword: string;
}
// 인증 컨텍스트 타입
export interface AuthContextType {
  // 상태
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  // 액션
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (request: SignUpRequest) => Promise<void>;
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}
// 타입 가드
export const isUser = (value: unknown): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'name' in value
  );
};