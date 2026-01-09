import { Capacitor } from "@capacitor/core";

/**
 * Platform detection utilities for Capacitor apps
 */

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function isAndroid(): boolean {
  return Capacitor.getPlatform() === "android";
}

export function isIOS(): boolean {
  return Capacitor.getPlatform() === "ios";
}

export function isWeb(): boolean {
  return Capacitor.getPlatform() === "web";
}

export function isMobile(): boolean {
  return isAndroid() || isIOS();
}

/**
 * Check if we should use native file operations
 * (i.e., we're running in a native app context)
 */
export function useNativeFileOperations(): boolean {
  return isNativePlatform() && (isAndroid() || isIOS());
}
