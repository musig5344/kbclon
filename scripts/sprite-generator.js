#!/usr/bin/env node

/**
 * 이미지 스프라이트 생성 스크립트
 * - 아이콘 스프라이트 생성
 * - 로딩 애니메이션 스프라이트 생성
 * - CSS 및 TypeScript 정의 파일 생성
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

const CONFIG = {
  sourceDir: './src/assets/images',
  outputDir: './src/assets/images/sprites',
  iconSize: 24,
  padding: 2,
  backgroundColor: { r: 0, g: 0, b: 0, alpha: 0 },
  format: 'png',
  quality: 95
};

/**
 * 디렉토리 생성
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

/**
 * 파일 크기 포맷팅
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 아이콘 분류 및 필터링
 */
function categorizeIcons(iconFiles) {
  const categories = {
    navigation: [],
    tabs: [],
    actions: [],
    login: [],
    menu: [],
    misc: []
  };
  
  iconFiles.forEach(file => {
    const name = path.basename(file, path.extname(file)).toLowerCase();
    
    if (name.includes('appbar') || name.includes('home') || name.includes('menu') || name.includes('search') || name.includes('close')) {
      categories.navigation.push(file);
    } else if (name.includes('tab_')) {
      categories.tabs.push(file);
    } else if (name.includes('transfer') || name.includes('account') || name.includes('assets') || name.includes('products')) {
      categories.actions.push(file);
    } else if (name.includes('login_') || name.includes('cert') || name.includes('fingerprint')) {
      categories.login.push(file);
    } else if (name.includes('icon_')) {
      categories.menu.push(file);
    } else {
      categories.misc.push(file);
    }
  });
  
  return categories;
}

/**
 * 이미지 스프라이트 생성
 */
async function createSprite(iconFiles, outputPath, options = {}) {
  if (iconFiles.length === 0) {
    console.log('⚠️ 생성할 아이콘이 없습니다.');
    return null;
  }
  
  const iconSize = options.iconSize || CONFIG.iconSize;
  const padding = options.padding || CONFIG.padding;
  const iconsPerRow = options.iconsPerRow || Math.ceil(Math.sqrt(iconFiles.length));
  
  // 스프라이트 크기 계산
  const totalCols = Math.min(iconsPerRow, iconFiles.length);
  const totalRows = Math.ceil(iconFiles.length / iconsPerRow);
  const spriteWidth = totalCols * (iconSize + padding) - padding;
  const spriteHeight = totalRows * (iconSize + padding) - padding;
  
  console.log(`🎨 Creating sprite: ${totalCols}x${totalRows} grid (${spriteWidth}x${spriteHeight}px)`);
  
  try {
    // 빈 캔버스 생성
    const sprite = sharp({
      create: {
        width: spriteWidth,
        height: spriteHeight,
        channels: 4,
        background: CONFIG.backgroundColor
      }
    });
    
    const compositeOptions = [];
    const iconMap = [];
    
    for (let i = 0; i < iconFiles.length; i++) {
      const row = Math.floor(i / iconsPerRow);
      const col = i % iconsPerRow;
      const left = col * (iconSize + padding);
      const top = row * (iconSize + padding);
      
      // 아이콘 리사이즈 및 처리
      const iconBuffer = await sharp(iconFiles[i])
        .resize(iconSize, iconSize, {
          fit: 'inside',
          background: CONFIG.backgroundColor
        })
        .png()
        .toBuffer();
      
      compositeOptions.push({
        input: iconBuffer,
        left,
        top
      });
      
      // CSS/JS 맵 정보 저장
      const iconName = path.basename(iconFiles[i], path.extname(iconFiles[i]));
      iconMap.push({
        name: iconName,
        file: iconFiles[i],
        x: -left,
        y: -top,
        left,
        top,
        width: iconSize,
        height: iconSize,
        index: i
      });
    }
    
    // 스프라이트 이미지 생성
    const outputInfo = await sprite
      .composite(compositeOptions)
      .png({ 
        compressionLevel: 9,
        progressive: true
      })
      .toFile(outputPath);
    
    console.log(`✅ Sprite created: ${outputPath} (${formatBytes(outputInfo.size)})`);
    
    return {
      outputPath,
      outputInfo,
      iconMap,
      spriteWidth,
      spriteHeight,
      iconSize,
      padding
    };
    
  } catch (error) {
    console.error(`❌ Error creating sprite: ${error.message}`);
    return null;
  }
}

/**
 * CSS 파일 생성
 */
function generateCSS(spriteData, cssPath) {
  const { iconMap, spriteWidth, spriteHeight, iconSize } = spriteData;
  const spriteFileName = path.basename(spriteData.outputPath);
  
  let css = `/* KB Star Banking Icon Sprite */\n`;
  css += `/* Generated: ${new Date().toISOString()} */\n`;
  css += `/* Sprite: ${spriteFileName} (${spriteWidth}x${spriteHeight}px) */\n\n`;
  
  // 기본 스프라이트 클래스
  css += `.kb-icon-sprite {\n`;
  css += `  background-image: url('../sprites/${spriteFileName}');\n`;
  css += `  background-repeat: no-repeat;\n`;
  css += `  display: inline-block;\n`;
  css += `  width: ${iconSize}px;\n`;
  css += `  height: ${iconSize}px;\n`;
  css += `}\n\n`;
  
  // 각 아이콘별 클래스
  iconMap.forEach(icon => {
    css += `.kb-icon-${icon.name} {\n`;
    css += `  background-position: ${icon.x}px ${icon.y}px;\n`;
    css += `}\n\n`;
  });
  
  // 크기 변형 클래스
  const sizes = [16, 20, 24, 32, 48];
  sizes.forEach(size => {
    if (size !== iconSize) {
      const scale = size / iconSize;
      css += `.kb-icon-sprite--${size} {\n`;
      css += `  width: ${size}px;\n`;
      css += `  height: ${size}px;\n`;
      css += `  background-size: ${Math.round(spriteWidth * scale)}px ${Math.round(spriteHeight * scale)}px;\n`;
      css += `}\n\n`;
    }
  });
  
  fs.writeFileSync(cssPath, css);
  console.log(`📝 CSS file generated: ${cssPath}`);
}

/**
 * TypeScript 정의 파일 생성
 */
function generateTypeScript(spriteData, tsPath) {
  const { iconMap, spriteWidth, spriteHeight, iconSize } = spriteData;
  
  let ts = `/**\n`;
  ts += ` * KB Star Banking Icon Sprite Definitions\n`;
  ts += ` * Generated: ${new Date().toISOString()}\n`;
  ts += ` * Total Icons: ${iconMap.length}\n`;
  ts += ` */\n\n`;
  
  // 아이콘 맵 상수
  ts += `export const ICON_SPRITE_MAP = {\n`;
  iconMap.forEach((icon, index) => {
    ts += `  '${icon.name}': { x: ${icon.x}, y: ${icon.y}, width: ${icon.width}, height: ${icon.height} }`;
    if (index < iconMap.length - 1) ts += ',';
    ts += `\n`;
  });
  ts += `} as const;\n\n`;
  
  // 스프라이트 정보
  ts += `export const SPRITE_INFO = {\n`;
  ts += `  width: ${spriteWidth},\n`;
  ts += `  height: ${spriteHeight},\n`;
  ts += `  iconSize: ${iconSize},\n`;
  ts += `  totalIcons: ${iconMap.length}\n`;
  ts += `} as const;\n\n`;
  
  // 아이콘 이름 타입
  ts += `export type IconName = keyof typeof ICON_SPRITE_MAP;\n\n`;
  
  // 사용 가능한 아이콘 목록
  ts += `export const AVAILABLE_ICONS: IconName[] = [\n`;
  iconMap.forEach((icon, index) => {
    ts += `  '${icon.name}'`;
    if (index < iconMap.length - 1) ts += ',';
    ts += `\n`;
  });
  ts += `];\n\n`;
  
  // 헬퍼 함수들
  ts += `/**\n`;
  ts += ` * 아이콘 존재 여부 확인\n`;
  ts += ` */\n`;
  ts += `export function hasIcon(iconName: string): iconName is IconName {\n`;
  ts += `  return iconName in ICON_SPRITE_MAP;\n`;
  ts += `}\n\n`;
  
  ts += `/**\n`;
  ts += ` * 아이콘 정보 가져오기\n`;
  ts += ` */\n`;
  ts += `export function getIconInfo(iconName: IconName) {\n`;
  ts += `  return ICON_SPRITE_MAP[iconName];\n`;
  ts += `}\n\n`;
  
  ts += `/**\n`;
  ts += ` * CSS background-position 값 생성\n`;
  ts += ` */\n`;
  ts += `export function getIconPosition(iconName: IconName): string {\n`;
  ts += `  const info = ICON_SPRITE_MAP[iconName];\n`;
  ts += `  return \`\${info.x}px \${info.y}px\`;\n`;
  ts += `}\n`;
  
  fs.writeFileSync(tsPath, ts);
  console.log(`📝 TypeScript definitions generated: ${tsPath}`);
}

/**
 * 로딩 애니메이션 스프라이트 생성
 */
async function createLoadingSprite(loadingFiles, outputPath) {
  if (loadingFiles.length === 0) {
    console.log('⚠️ 로딩 애니메이션 파일이 없습니다.');
    return null;
  }
  
  // 로딩 파일들을 이름으로 정렬 (loading_1_01.png, loading_1_02.png, ...)
  loadingFiles.sort((a, b) => {
    const nameA = path.basename(a);
    const nameB = path.basename(b);
    return nameA.localeCompare(nameB, undefined, { numeric: true });
  });
  
  console.log(`🔄 Creating loading animation sprite with ${loadingFiles.length} frames`);
  
  try {
    // 첫 번째 프레임에서 크기 정보 가져오기
    const firstFrameMetadata = await sharp(loadingFiles[0]).metadata();
    const frameSize = Math.max(firstFrameMetadata.width, firstFrameMetadata.height);
    
    // 가로로 배치
    const spriteWidth = frameSize * loadingFiles.length;
    const spriteHeight = frameSize;
    
    const sprite = sharp({
      create: {
        width: spriteWidth,
        height: spriteHeight,
        channels: 4,
        background: CONFIG.backgroundColor
      }
    });
    
    const compositeOptions = [];
    const frameMap = [];
    
    for (let i = 0; i < loadingFiles.length; i++) {
      const left = i * frameSize;
      const top = 0;
      
      const frameBuffer = await sharp(loadingFiles[i])
        .resize(frameSize, frameSize, {
          fit: 'inside',
          background: CONFIG.backgroundColor
        })
        .png()
        .toBuffer();
      
      compositeOptions.push({
        input: frameBuffer,
        left,
        top
      });
      
      const frameName = path.basename(loadingFiles[i], path.extname(loadingFiles[i]));
      frameMap.push({
        name: frameName,
        file: loadingFiles[i],
        x: -left,
        y: -top,
        left,
        top,
        width: frameSize,
        height: frameSize,
        index: i
      });
    }
    
    const outputInfo = await sprite
      .composite(compositeOptions)
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
    
    console.log(`✅ Loading sprite created: ${outputPath} (${formatBytes(outputInfo.size)})`);
    
    // 애니메이션 CSS 생성
    const cssPath = outputPath.replace('.png', '.css');
    generateLoadingCSS({
      outputPath,
      frameMap,
      spriteWidth,
      spriteHeight,
      frameSize
    }, cssPath);
    
    return {
      outputPath,
      outputInfo,
      frameMap,
      spriteWidth,
      spriteHeight,
      frameSize
    };
    
  } catch (error) {
    console.error(`❌ Error creating loading sprite: ${error.message}`);
    return null;
  }
}

/**
 * 로딩 애니메이션 CSS 생성
 */
function generateLoadingCSS(spriteData, cssPath) {
  const { frameMap, spriteWidth, spriteHeight, frameSize } = spriteData;
  const spriteFileName = path.basename(spriteData.outputPath);
  
  let css = `/* KB Loading Animation Sprite */\n`;
  css += `/* Generated: ${new Date().toISOString()} */\n`;
  css += `/* Frames: ${frameMap.length} */\n\n`;
  
  css += `.kb-loading-sprite {\n`;
  css += `  background-image: url('../sprites/${spriteFileName}');\n`;
  css += `  background-repeat: no-repeat;\n`;
  css += `  width: ${frameSize}px;\n`;
  css += `  height: ${frameSize}px;\n`;
  css += `  animation: kb-loading 1s steps(${frameMap.length}) infinite;\n`;
  css += `}\n\n`;
  
  css += `@keyframes kb-loading {\n`;
  css += `  0% { background-position: 0 0; }\n`;
  css += `  100% { background-position: -${spriteWidth}px 0; }\n`;
  css += `}\n\n`;
  
  // 다른 크기들
  const sizes = [16, 20, 24, 32, 48, 64];
  sizes.forEach(size => {
    if (size !== frameSize) {
      const scale = size / frameSize;
      css += `.kb-loading-sprite--${size} {\n`;
      css += `  width: ${size}px;\n`;
      css += `  height: ${size}px;\n`;
      css += `  background-size: ${Math.round(spriteWidth * scale)}px ${Math.round(spriteHeight * scale)}px;\n`;
      css += `}\n\n`;
    }
  });
  
  fs.writeFileSync(cssPath, css);
  console.log(`📝 Loading animation CSS generated: ${cssPath}`);
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🎨 KB스타뱅킹 스프라이트 생성 시작...\n');
  
  // 출력 디렉토리 생성
  ensureDir(CONFIG.outputDir);
  
  // 아이콘 파일들 찾기
  const iconFiles = glob.sync(`${CONFIG.sourceDir}/**/*.png`).filter(file => {
    const name = path.basename(file).toLowerCase();
    return (name.includes('icon') || name.includes('btn')) && !name.includes('loading');
  });
  
  // 로딩 애니메이션 파일들 찾기
  const loadingFiles = glob.sync(`${CONFIG.sourceDir}/loading/*.png`);
  
  console.log(`📊 아이콘 파일: ${iconFiles.length}개`);
  console.log(`📊 로딩 프레임: ${loadingFiles.length}개\n`);
  
  const results = {
    icons: null,
    loading: null
  };
  
  // 아이콘 스프라이트 생성
  if (iconFiles.length > 0) {
    console.log('🎯 아이콘 스프라이트 생성중...');
    
    // 아이콘 분류
    const categories = categorizeIcons(iconFiles);
    
    // 메인 아이콘 스프라이트 (모든 아이콘)
    const iconSpritePath = path.join(CONFIG.outputDir, 'icons-sprite.png');
    results.icons = await createSprite(iconFiles, iconSpritePath);
    
    if (results.icons) {
      // CSS 및 TypeScript 정의 생성
      const cssPath = path.join(CONFIG.outputDir, 'icons-sprite.css');
      const tsPath = path.join(CONFIG.outputDir, 'icons-sprite.ts');
      
      generateCSS(results.icons, cssPath);
      generateTypeScript(results.icons, tsPath);
      
      // 카테고리별 스프라이트 생성 (선택적)
      for (const [category, files] of Object.entries(categories)) {
        if (files.length > 5) { // 5개 이상인 카테고리만
          const categorySpritePath = path.join(CONFIG.outputDir, `${category}-sprite.png`);
          const categoryResult = await createSprite(files, categorySpritePath, {
            iconsPerRow: Math.min(8, files.length)
          });
          
          if (categoryResult) {
            const categoryCssPath = path.join(CONFIG.outputDir, `${category}-sprite.css`);
            generateCSS(categoryResult, categoryCssPath);
          }
        }
      }
    }
  }
  
  // 로딩 애니메이션 스프라이트 생성
  if (loadingFiles.length > 0) {
    console.log('\n⏳ 로딩 애니메이션 스프라이트 생성중...');
    
    const loadingSpritePath = path.join(CONFIG.outputDir, 'loading-sprite.png');
    results.loading = await createLoadingSprite(loadingFiles, loadingSpritePath);
  }
  
  // 결과 요약
  console.log('\n📊 스프라이트 생성 결과:');
  
  if (results.icons) {
    const iconSize = formatBytes(results.icons.outputInfo.size);
    console.log(`   아이콘 스프라이트: ${results.icons.iconMap.length}개 아이콘, ${iconSize}`);
  }
  
  if (results.loading) {
    const loadingSize = formatBytes(results.loading.outputInfo.size);
    console.log(`   로딩 스프라이트: ${results.loading.frameMap.length}개 프레임, ${loadingSize}`);
  }
  
  // 사용 가이드 출력
  console.log('\n💡 사용법:');
  console.log('   1. CSS 파일을 import: @import "./assets/images/sprites/icons-sprite.css"');
  console.log('   2. TypeScript에서 import: import { ICON_SPRITE_MAP } from "./assets/images/sprites/icons-sprite"');
  console.log('   3. 컴포넌트 사용: <IconSprite icon="icon_home" size={24} />');
  
  console.log('\n✅ 스프라이트 생성 완료!');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createSprite,
  createLoadingSprite,
  generateCSS,
  generateTypeScript
};