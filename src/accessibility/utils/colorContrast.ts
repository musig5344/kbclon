/**
 * WCAG 2.1 색상 대비 유틸리티
 * AA 기준: 일반 텍스트 4.5:1, 큰 텍스트 3:1
 * AAA 기준: 일반 텍스트 7:1, 큰 텍스트 4.5:1
 */

import { ColorContrastResult } from '../types';

/**
 * RGB 색상을 상대 휘도로 변환
 */
function getLuminance(rgb: number[]): number {
  const [r, g, b] = rgb.map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * HEX 색상을 RGB 배열로 변환
 */
function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

/**
 * RGB 문자열을 RGB 배열로 변환
 */
function parseRgb(rgb: string): number[] {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
}

/**
 * 색상 문자열을 RGB 배열로 변환
 */
function colorToRgb(color: string): number[] {
  if (color.startsWith('#')) {
    return hexToRgb(color);
  } else if (color.startsWith('rgb')) {
    return parseRgb(color);
  }

  // 기본 색상 이름 처리
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [0, 0, 0];

  ctx.fillStyle = color;
  const computedColor = ctx.fillStyle;

  if (computedColor.startsWith('#')) {
    return hexToRgb(computedColor);
  } else if (computedColor.startsWith('rgb')) {
    return parseRgb(computedColor);
  }

  return [0, 0, 0];
}

/**
 * 두 색상 간의 대비 비율 계산
 */
export function getContrastRatio(foreground: string, background: string): number {
  const fgRgb = colorToRgb(foreground);
  const bgRgb = colorToRgb(background);

  const fgLuminance = getLuminance(fgRgb);
  const bgLuminance = getLuminance(bgRgb);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 색상 대비 검증
 */
export function validateColorContrast(
  foreground: string,
  background: string,
  fontSize?: number,
  isBold?: boolean
): ColorContrastResult {
  const ratio = getContrastRatio(foreground, background);
  const isLargeText = (fontSize && fontSize >= 18) || (fontSize && fontSize >= 14 && isBold);

  const result: ColorContrastResult = {
    ratio: Math.round(ratio * 100) / 100,
    passes: {
      aa: isLargeText ? ratio >= 3 : ratio >= 4.5,
      aaa: isLargeText ? ratio >= 4.5 : ratio >= 7,
      largeTextAA: ratio >= 3,
      largeTextAAA: ratio >= 4.5,
    },
  };

  // 권장사항 추가
  if (!result.passes.aa) {
    if (isLargeText && ratio < 3) {
      result.recommendation = `대비 비율이 ${ratio.toFixed(2)}:1입니다. 큰 텍스트의 경우 최소 3:1이 필요합니다.`;
    } else if (!isLargeText && ratio < 4.5) {
      result.recommendation = `대비 비율이 ${ratio.toFixed(2)}:1입니다. 일반 텍스트의 경우 최소 4.5:1이 필요합니다.`;
    }
  }

  return result;
}

/**
 * 배경색에 대해 적절한 전경색 제안
 */
export function suggestForegroundColor(background: string, preferDark: boolean = true): string {
  const bgRgb = colorToRgb(background);
  const bgLuminance = getLuminance(bgRgb);

  // 밝은 배경이면 어두운 색, 어두운 배경이면 밝은 색
  if (bgLuminance > 0.5) {
    return preferDark ? '#26282C' : '#000000'; // KB 다크 그레이 또는 검정
  } else {
    return '#FFFFFF'; // 흰색
  }
}

/**
 * 색상 대비 개선을 위한 색상 조정
 */
export function adjustColorForContrast(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string {
  const currentRatio = getContrastRatio(foreground, background);

  if (currentRatio >= targetRatio) {
    return foreground;
  }

  const fgRgb = colorToRgb(foreground);
  const bgLuminance = getLuminance(colorToRgb(background));

  let adjustedRgb = [...fgRgb];
  let step = bgLuminance > 0.5 ? -5 : 5; // 배경이 밝으면 어둡게, 어두우면 밝게

  for (let i = 0; i < 50; i++) {
    // 최대 50번 시도
    adjustedRgb = adjustedRgb.map(val => Math.max(0, Math.min(255, val + step)));

    const adjustedHex = `#${adjustedRgb.map(val => val.toString(16).padStart(2, '0')).join('')}`;

    const newRatio = getContrastRatio(adjustedHex, background);

    if (newRatio >= targetRatio) {
      return adjustedHex;
    }
  }

  // 조정 실패 시 기본 고대비 색상 반환
  return bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * KB 스타뱅킹 색상 팔레트 대비 검증
 */
export function validateKBColorPalette(colors: Record<string, string>) {
  const results: Record<string, ColorContrastResult> = {};
  const background = colors.background || '#FFFFFF';

  // 주요 텍스트 색상들에 대해 검증
  const textColors = [
    'textPrimary',
    'textSecondary',
    'textTertiary',
    'textHint',
    'textClickable',
    'error',
    'success',
    'warning',
  ];

  textColors.forEach(colorKey => {
    if (colors[colorKey]) {
      results[colorKey] = validateColorContrast(colors[colorKey], background);
    }
  });

  return results;
}

/**
 * 색맹 시뮬레이션
 */
export function simulateColorBlindness(
  color: string,
  type: 'protanopia' | 'deuteranopia' | 'tritanopia'
): string {
  const rgb = colorToRgb(color);
  let [r, g, b] = rgb;

  switch (type) {
    case 'protanopia': // 적색맹
      r = 0.567 * r + 0.433 * g;
      g = 0.558 * r + 0.442 * g;
      b = 0.242 * g + 0.758 * b;
      break;
    case 'deuteranopia': // 녹색맹
      r = 0.625 * r + 0.375 * g;
      g = 0.7 * r + 0.3 * g;
      b = 0.3 * g + 0.7 * b;
      break;
    case 'tritanopia': // 청색맹
      r = 0.95 * r + 0.05 * g;
      g = 0.433 * g + 0.567 * b;
      b = 0.475 * g + 0.525 * b;
      break;
  }

  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 고대비 모드용 색상 매핑
 */
export function getHighContrastColor(originalColor: string, isDarkMode: boolean = false): string {
  const highContrastMap: Record<string, string> = isDarkMode
    ? {
        '#FFD338': '#FFEB3B', // 더 밝은 노란색
        '#26282C': '#FFFFFF', // 흰색 텍스트
        '#484B51': '#E0E0E0', // 밝은 회색
        '#696E76': '#BDBDBD', // 중간 회색
        '#8B8B8B': '#9E9E9E', // 연한 회색
        '#287EFF': '#64B5F6', // 밝은 파란색
        '#FF5858': '#FF6B6B', // 밝은 빨간색
        '#22C55E': '#4CAF50', // 밝은 초록색
      }
    : {
        '#FFD338': '#F9A825', // 진한 노란색
        '#26282C': '#000000', // 순수 검정
        '#484B51': '#212121', // 진한 회색
        '#696E76': '#424242', // 중간 진한 회색
        '#8B8B8B': '#616161', // 진한 회색
        '#287EFF': '#1565C0', // 진한 파란색
        '#FF5858': '#C62828', // 진한 빨간색
        '#22C55E': '#2E7D32', // 진한 초록색
      };

  return highContrastMap[originalColor] || originalColor;
}
