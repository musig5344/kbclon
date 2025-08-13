/**
 * PWA 관련 TypeScript 타입 선언
 *
 * 브라우저에서 기본 제공하지 않는 PWA API들의 타입을 정의합니다.
 */
// Background Sync API 타입 정의
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}
interface ServiceWorkerRegistration {
  sync: SyncManager;
}
// Service Worker Global Scope에서 사용하는 이벤트 타입
interface SyncEvent extends ExtendableEvent {
  tag: string;
  lastChance: boolean;
}
// Navigator의 Connection API 확장 (실험적 API)
interface NetworkInformation extends EventTarget {
  readonly downlink: number;
  readonly downlinkMax: number;
  readonly effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  readonly rtt: number;
  readonly saveData: boolean;
  readonly type:
    | 'bluetooth'
    | 'cellular'
    | 'ethernet'
    | 'mixed'
    | 'none'
    | 'other'
    | 'unknown'
    | 'wifi'
    | 'wimax';
  addEventListener(type: 'change', listener: EventListener): void;
  removeEventListener(type: 'change', listener: EventListener): void;
}
interface Navigator {
  readonly connection?: NetworkInformation;
  readonly mozConnection?: NetworkInformation;
  readonly webkitConnection?: NetworkInformation;
}
// Web Share API 타입 (PWA에서 자주 사용)
interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}
interface Navigator {
  share?(data: ShareData): Promise<void>;
  canShare?(data: ShareData): boolean;
}
// Wake Lock API 타입
interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>;
}
interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  readonly type: 'screen';
  release(): Promise<void>;
  addEventListener(type: 'release', listener: EventListener): void;
  removeEventListener(type: 'release', listener: EventListener): void;
}
interface Navigator {
  wakeLock?: WakeLock;
}
// Web Locks API 타입
interface LockManager {
  request<T>(name: string, callback: () => Promise<T> | T): Promise<T>;
  request<T>(
    name: string,
    options: {
      mode?: 'exclusive' | 'shared';
      ifAvailable?: boolean;
      steal?: boolean;
      signal?: AbortSignal;
    },
    callback: () => Promise<T> | T
  ): Promise<T>;
  query(): Promise<LockManagerSnapshot>;
}
interface LockManagerSnapshot {
  held: LockInfo[];
  pending: LockInfo[];
}
interface LockInfo {
  mode: 'exclusive' | 'shared';
  name: string;
  clientId: string;
}
interface Navigator {
  locks?: LockManager;
}
// App Badging API 타입 (PWA 알림 배지)
interface Navigator {
  setAppBadge?(contents?: number): Promise<void>;
  clearAppBadge?(): Promise<void>;
}
// Install Prompt 이벤트 타입
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
}
// Contact Picker API 타입
interface ContactAddress {
  city?: string;
  country?: string;
  dependentLocality?: string;
  organization?: string;
  phone?: string;
  postalCode?: string;
  recipient?: string;
  region?: string;
  sortingCode?: string;
  addressLine?: string[];
}
interface ContactInfo {
  address?: ContactAddress[];
  email?: string[];
  icon?: Blob[];
  name?: string[];
  tel?: string[];
}
interface ContactsManager {
  select(
    properties: string[],
    options?: {
      multiple?: boolean;
    }
  ): Promise<ContactInfo[]>;
  getProperties(): Promise<string[]>;
}
interface Navigator {
  contacts?: ContactsManager;
}
// File System Access API 타입 (실험적)
interface FileSystemFileHandle {
  readonly kind: 'file';
  readonly name: string;
  getFile(): Promise<File>;
  createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
}
interface FileSystemCreateWritableOptions {
  keepExistingData?: boolean;
}
interface FileSystemWritableFileStream extends WritableStream {
  write(data: FileSystemWriteChunkType): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}
type FileSystemWriteChunkType = BufferSource | Blob | string | WriteParams;
interface WriteParams {
  type: 'write' | 'seek' | 'truncate';
  data?: BufferSource | Blob | string;
  position?: number;
  size?: number;
}
interface Window {
  showOpenFilePicker?(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
  showDirectoryPicker?(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
}
interface OpenFilePickerOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: FilePickerAcceptType[];
}
interface SaveFilePickerOptions {
  excludeAcceptAllOption?: boolean;
  suggestedName?: string;
  types?: FilePickerAcceptType[];
}
interface DirectoryPickerOptions {
  mode?: 'read' | 'readwrite';
}
interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string | string[]>;
}
interface FileSystemDirectoryHandle {
  readonly kind: 'directory';
  readonly name: string;
}
// Screen Wake Lock API
interface Screen {
  wakeLock?: WakeLock;
}
// Storage API 확장
interface StorageEstimate {
  quota?: number;
  usage?: number;
  usageDetails?: {
    indexedDB?: number;
    caches?: number;
    serviceWorkerRegistrations?: number;
  };
}
interface StorageManager {
  estimate(): Promise<StorageEstimate>;
  persist(): Promise<boolean>;
  persisted(): Promise<boolean>;
}
interface Navigator {
  storage?: StorageManager;
}
// Media Session API (PWA 오디오 컨트롤)
interface MediaMetadata {
  constructor(init?: MediaMetadataInit);
  title: string;
  artist: string;
  album: string;
  artwork: MediaImage[];
}
interface MediaMetadataInit {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: MediaImage[];
}
interface MediaImage {
  src: string;
  sizes?: string;
  type?: string;
}
interface MediaSession {
  metadata: MediaMetadata | null;
  playbackState: 'none' | 'paused' | 'playing';
  setActionHandler(action: MediaSessionAction, handler: MediaSessionActionHandler | null): void;
  setPositionState(state?: MediaPositionState): void;
}
type MediaSessionAction =
  | 'play'
  | 'pause'
  | 'stop'
  | 'seekbackward'
  | 'seekforward'
  | 'seekto'
  | 'skipad'
  | 'previoustrack'
  | 'nexttrack';
interface MediaSessionActionHandler {
  (details: MediaSessionActionDetails): void;
}
interface MediaSessionActionDetails {
  action: MediaSessionAction;
  seekOffset?: number;
  seekTime?: number;
}
interface MediaPositionState {
  duration?: number;
  playbackRate?: number;
  position?: number;
}
interface Navigator {
  mediaSession?: MediaSession;
}
export {};
