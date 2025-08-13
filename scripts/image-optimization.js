#!/usr/bin/env node

/**
 * KB스타뱅킹 이미지 최적화 스크립트
 * - PNG/JPG 이미지를 WebP로 변환
 * - 이미지 압축 및 크기 최적화
 * - 스프라이트 시트 생성
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

// 설정
const CONFIG = {
  sourceDir: './src/assets/images',
  outputDir: './src/assets/images/optimized',
  spriteOutputDir: './src/assets/images/sprites',
  quality: {
    webp: 85,
    png: 90,
    jpeg: 85
  },
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200
  },
  // 100KB 이상의 파일만 WebP 변환 (작은 파일은 오버헤드가 더 클 수 있음)
  webpThreshold: 100 * 1024
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
 * 이미지 메타데이터 분석
 */
async function analyzeImage(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const metadata = await sharp(filePath).metadata();
    
    return {
      path: filePath,
      size: stats.size,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * WebP 변환
 */
async function convertToWebP(inputPath, outputPath, quality = CONFIG.quality.webp) {
  try {
    const outputInfo = await sharp(inputPath)
      .webp({ quality, effort: 6 })
      .toFile(outputPath);
    
    return outputInfo;
  } catch (error) {
    console.error(`❌ Error converting to WebP ${inputPath}:`, error.message);
    return null;
  }
}

/**
 * PNG 최적화
 */
async function optimizePng(inputPath, outputPath) {
  try {
    const outputInfo = await sharp(inputPath)
      .png({ 
        quality: CONFIG.quality.png,
        compressionLevel: 9,
        progressive: true,
        force: false
      })
      .toFile(outputPath);
    
    return outputInfo;
  } catch (error) {
    console.error(`❌ Error optimizing PNG ${inputPath}:`, error.message);
    return null;
  }
}

/**
 * 반응형 이미지 생성
 */
async function generateResponsiveImages(inputPath, baseName, outputDir) {
  const results = [];
  
  for (const [sizeName, width] of Object.entries(CONFIG.sizes)) {
    const outputPath = path.join(outputDir, `${baseName}-${sizeName}.webp`);
    
    try {
      const outputInfo = await sharp(inputPath)
        .resize(width, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: CONFIG.quality.webp, effort: 6 })
        .toFile(outputPath);
      
      results.push({
        size: sizeName,
        width,
        path: outputPath,
        info: outputInfo
      });
      
      console.log(`  ✅ Generated ${sizeName} (${width}px): ${formatBytes(outputInfo.size)}`);
    } catch (error) {
      console.error(`  ❌ Error generating ${sizeName}:`, error.message);
    }
  }
  
  return results;
}

/**
 * 스프라이트 시트 생성 (아이콘용)
 */
async function createIconSprite(iconFiles, outputPath) {
  if (iconFiles.length === 0) return null;
  
  try {
    // 모든 아이콘을 같은 크기로 리사이즈 (24x24)
    const iconSize = 24;
    const iconsPerRow = Math.ceil(Math.sqrt(iconFiles.length));
    const spriteWidth = iconsPerRow * iconSize;
    const spriteHeight = Math.ceil(iconFiles.length / iconsPerRow) * iconSize;
    
    // 빈 캔버스 생성
    const sprite = sharp({
      create: {
        width: spriteWidth,
        height: spriteHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });
    
    const compositeOptions = [];
    const cssMap = [];
    
    for (let i = 0; i < iconFiles.length; i++) {
      const row = Math.floor(i / iconsPerRow);
      const col = i % iconsPerRow;
      const left = col * iconSize;
      const top = row * iconSize;
      
      // 아이콘 리사이즈
      const resizedIcon = await sharp(iconFiles[i])
        .resize(iconSize, iconSize, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
      
      compositeOptions.push({
        input: resizedIcon,
        left,
        top
      });
      
      // CSS 맵 생성
      const iconName = path.basename(iconFiles[i], path.extname(iconFiles[i]));
      cssMap.push({
        name: iconName,
        x: -left,
        y: -top,
        width: iconSize,
        height: iconSize
      });
    }
    
    const outputInfo = await sprite
      .composite(compositeOptions)
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
    
    // CSS 파일 생성
    const cssPath = outputPath.replace('.png', '.css');
    const cssContent = generateSpriteCss(cssMap, path.basename(outputPath));
    fs.writeFileSync(cssPath, cssContent);
    
    console.log(`🎨 Created icon sprite: ${outputPath} (${formatBytes(outputInfo.size)})`);
    console.log(`📝 Created CSS file: ${cssPath}`);
    
    return { outputInfo, cssMap };
  } catch (error) {
    console.error(`❌ Error creating sprite:`, error.message);
    return null;
  }
}

/**
 * 스프라이트 CSS 생성
 */
function generateSpriteCss(cssMap, spriteFileName) {
  let css = `/* Icon Sprite - ${spriteFileName} */\n`;
  css += `.icon-sprite {\n`;
  css += `  background-image: url('${spriteFileName}');\n`;
  css += `  background-repeat: no-repeat;\n`;
  css += `  display: inline-block;\n`;
  css += `}\n\n`;
  
  cssMap.forEach(icon => {
    css += `.icon-${icon.name} {\n`;
    css += `  background-position: ${icon.x}px ${icon.y}px;\n`;
    css += `  width: ${icon.width}px;\n`;
    css += `  height: ${icon.height}px;\n`;
    css += `}\n\n`;
  });
  
  return css;
}

/**
 * 메인 최적화 프로세스
 */
async function main() {
  console.log('🚀 KB스타뱅킹 이미지 최적화 시작...\n');
  
  // 출력 디렉토리 생성
  ensureDir(CONFIG.outputDir);
  ensureDir(CONFIG.spriteOutputDir);
  
  // PNG 파일 찾기
  const pngFiles = glob.sync(`${CONFIG.sourceDir}/**/*.png`);
  console.log(`📊 총 ${pngFiles.length}개의 PNG 파일을 찾았습니다.\n`);
  
  const results = {
    optimized: [],
    webpConverted: [],
    responsive: [],
    skipped: [],
    totalOriginalSize: 0,
    totalOptimizedSize: 0
  };
  
  // 아이콘 파일 분류 (sprites용)
  const iconFiles = pngFiles.filter(file => 
    file.includes('/icons/') || 
    file.includes('icon_') ||
    path.basename(file).startsWith('icon')
  ).filter(file => {
    // 로딩 애니메이션은 제외
    return !file.includes('/loading/');
  });
  
  // 로딩 애니메이션 파일들
  const loadingFiles = pngFiles.filter(file => file.includes('/loading/'));
  
  console.log(`🎯 아이콘 파일: ${iconFiles.length}개`);
  console.log(`⏳ 로딩 애니메이션: ${loadingFiles.length}개`);
  console.log(`📁 기타 파일: ${pngFiles.length - iconFiles.length - loadingFiles.length}개\n`);
  
  // 각 파일 처리
  for (const filePath of pngFiles) {
    console.log(`🔄 Processing: ${filePath}`);
    
    const analysis = await analyzeImage(filePath);
    if (!analysis) continue;
    
    results.totalOriginalSize += analysis.size;
    const fileName = path.basename(filePath, '.png');
    const relativePath = path.relative(CONFIG.sourceDir, filePath);
    const outputSubDir = path.join(CONFIG.outputDir, path.dirname(relativePath));
    ensureDir(outputSubDir);
    
    console.log(`  📏 Original: ${analysis.width}x${analysis.height}, ${formatBytes(analysis.size)}`);
    
    // WebP 변환 (큰 파일만)
    if (analysis.size >= CONFIG.webpThreshold) {
      const webpPath = path.join(outputSubDir, `${fileName}.webp`);
      const webpResult = await convertToWebP(filePath, webpPath);
      
      if (webpResult) {
        results.webpConverted.push({
          original: filePath,
          optimized: webpPath,
          originalSize: analysis.size,
          optimizedSize: webpResult.size,
          savings: analysis.size - webpResult.size
        });
        
        results.totalOptimizedSize += webpResult.size;
        console.log(`  ✅ WebP: ${formatBytes(webpResult.size)} (${formatBytes(analysis.size - webpResult.size)} saved)`);
        
        // 반응형 이미지 생성 (히어로 이미지나 큰 이미지만)
        if (analysis.size > 50000) { // 50KB 이상
          const responsiveResults = await generateResponsiveImages(filePath, fileName, outputSubDir);
          results.responsive.push(...responsiveResults);
        }
      }
    } else {
      // PNG 최적화
      const optimizedPath = path.join(outputSubDir, `${fileName}.png`);
      const pngResult = await optimizePng(filePath, optimizedPath);
      
      if (pngResult) {
        results.optimized.push({
          original: filePath,
          optimized: optimizedPath,
          originalSize: analysis.size,
          optimizedSize: pngResult.size,
          savings: analysis.size - pngResult.size
        });
        
        results.totalOptimizedSize += pngResult.size;
        console.log(`  ✅ PNG optimized: ${formatBytes(pngResult.size)} (${formatBytes(analysis.size - pngResult.size)} saved)`);
      }
    }
    
    console.log('');
  }
  
  // 아이콘 스프라이트 생성
  if (iconFiles.length > 0) {
    console.log(`🎨 Creating icon sprite from ${iconFiles.length} icons...`);
    const spritePath = path.join(CONFIG.spriteOutputDir, 'icons-sprite.png');
    await createIconSprite(iconFiles, spritePath);
    console.log('');
  }
  
  // 결과 리포트
  console.log('📊 최적화 결과:\n');
  console.log(`💾 WebP 변환: ${results.webpConverted.length}개 파일`);
  console.log(`🗜️  PNG 최적화: ${results.optimized.length}개 파일`);
  console.log(`📱 반응형 이미지: ${results.responsive.length}개 생성`);
  console.log(`⏭️  건너뜀: ${results.skipped.length}개 파일\n`);
  
  const totalSavings = results.webpConverted.reduce((sum, item) => sum + item.savings, 0) +
                      results.optimized.reduce((sum, item) => sum + item.savings, 0);
  
  console.log(`📉 전체 용량:`);
  console.log(`   원본: ${formatBytes(results.totalOriginalSize)}`);
  console.log(`   최적화 후: ${formatBytes(results.totalOptimizedSize)}`);
  console.log(`   절약: ${formatBytes(totalSavings)} (${(totalSavings / results.totalOriginalSize * 100).toFixed(1)}%)\n`);
  
  // 최적화 가이드 생성
  generateOptimizationGuide(results);
  
  console.log('✅ 이미지 최적화 완료!');
}

/**
 * 최적화 가이드 생성
 */
function generateOptimizationGuide(results) {
  const guidePath = path.join(CONFIG.outputDir, 'optimization-guide.md');
  
  let guide = `# KB스타뱅킹 이미지 최적화 가이드\n\n`;
  guide += `> 생성일: ${new Date().toLocaleString('ko-KR')}\n\n`;
  
  guide += `## 최적화 결과 요약\n\n`;
  guide += `- WebP 변환: ${results.webpConverted.length}개 파일\n`;
  guide += `- PNG 최적화: ${results.optimized.length}개 파일\n`;
  guide += `- 반응형 이미지: ${results.responsive.length}개 생성\n\n`;
  
  guide += `## 사용법\n\n`;
  guide += `### 1. WebP 이미지 사용\n`;
  guide += `\`\`\`tsx\n`;
  guide += `// Picture 엘리먼트로 WebP 우선 사용\n`;
  guide += `<picture>\n`;
  guide += `  <source srcSet="/assets/images/optimized/splash_background.webp" type="image/webp" />\n`;
  guide += `  <img src="/assets/images/splash_background.png" alt="배경 이미지" />\n`;
  guide += `</picture>\n`;
  guide += `\`\`\`\n\n`;
  
  guide += `### 2. 반응형 이미지 사용\n`;
  guide += `\`\`\`tsx\n`;
  guide += `<picture>\n`;
  guide += `  <source\n`;
  guide += `    media="(max-width: 480px)"\n`;
  guide += `    srcSet="/assets/images/optimized/hero-small.webp"\n`;
  guide += `    type="image/webp"\n`;
  guide += `  />\n`;
  guide += `  <source\n`;
  guide += `    media="(max-width: 768px)"\n`;
  guide += `    srcSet="/assets/images/optimized/hero-medium.webp"\n`;
  guide += `    type="image/webp"\n`;
  guide += `  />\n`;
  guide += `  <img src="/assets/images/optimized/hero-large.webp" alt="히어로 이미지" />\n`;
  guide += `</picture>\n`;
  guide += `\`\`\`\n\n`;
  
  guide += `### 3. 아이콘 스프라이트 사용\n`;
  guide += `\`\`\`css\n`;
  guide += `/* sprites/icons-sprite.css 임포트 */\n`;
  guide += `.my-icon {\n`;
  guide += `  @extend .icon-sprite;\n`;
  guide += `  @extend .icon-home;\n`;
  guide += `}\n`;
  guide += `\`\`\`\n\n`;
  
  guide += `## 성능 개선 권장사항\n\n`;
  guide += `1. **Lazy Loading**: Intersection Observer API 사용\n`;
  guide += `2. **이미지 사전 로딩**: 중요한 이미지는 preload\n`;
  guide += `3. **CDN 활용**: 이미지를 CDN으로 서빙\n`;
  guide += `4. **압축**: Gzip/Brotli 압축 활성화\n\n`;
  
  fs.writeFileSync(guidePath, guide);
  console.log(`📖 최적화 가이드 생성: ${guidePath}`);
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  CONFIG,
  analyzeImage,
  convertToWebP,
  optimizePng,
  createIconSprite
};