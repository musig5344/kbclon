#!/usr/bin/env node

/**
 * WebP 변환 전용 스크립트
 * - PNG/JPG 이미지를 WebP로 변환
 * - 품질 및 압축 옵션 최적화
 * - 배치 처리 및 진행률 표시
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

const CONFIG = {
  sourceDir: './src/assets/images',
  outputDir: './src/assets/images/webp',
  quality: 85,
  effort: 6, // 0-6, 높을수록 더 나은 압축 (더 느림)
  minFileSize: 1024, // 1KB 미만은 변환 안함
  extensions: ['png', 'jpg', 'jpeg'],
  excludePatterns: [
    '*/optimized/*', // 이미 최적화된 폴더 제외
    '*/webp/*',      // webp 폴더 제외
    '*/sprites/*'    // 스프라이트 폴더 제외
  ]
};

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
 * 디렉토리 생성
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 진행률 표시
 */
function showProgress(current, total, fileName) {
  const percentage = Math.round((current / total) * 100);
  const progressBar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
  process.stdout.write(`\r[${progressBar}] ${percentage}% (${current}/${total}) ${fileName.substring(0, 40)}...`);
}

/**
 * WebP 변환
 */
async function convertToWebP(inputPath, outputPath, options = {}) {
  try {
    const quality = options.quality || CONFIG.quality;
    const effort = options.effort || CONFIG.effort;
    
    // 입력 파일 정보
    const inputStats = fs.statSync(inputPath);
    const metadata = await sharp(inputPath).metadata();
    
    // WebP 변환
    const outputInfo = await sharp(inputPath)
      .webp({
        quality,
        effort,
        lossless: false,
        nearLossless: false,
        smartSubsample: true,
        preset: 'default'
      })
      .toFile(outputPath);
    
    return {
      input: {
        path: inputPath,
        size: inputStats.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      },
      output: {
        path: outputPath,
        size: outputInfo.size,
        width: outputInfo.width,
        height: outputInfo.height,
        format: 'webp'
      },
      savings: inputStats.size - outputInfo.size,
      compressionRatio: (outputInfo.size / inputStats.size * 100).toFixed(1)
    };
  } catch (error) {
    throw new Error(`WebP 변환 실패: ${error.message}`);
  }
}

/**
 * 반응형 WebP 이미지 생성
 */
async function createResponsiveWebP(inputPath, outputDir, baseName) {
  const sizes = [
    { name: 'small', width: 480 },
    { name: 'medium', width: 768 },
    { name: 'large', width: 1200 },
    { name: 'xlarge', width: 1920 }
  ];
  
  const results = [];
  const metadata = await sharp(inputPath).metadata();
  
  for (const size of sizes) {
    // 원본보다 큰 경우 스킵
    if (size.width >= metadata.width) continue;
    
    const outputPath = path.join(outputDir, `${baseName}-${size.name}.webp`);
    
    try {
      const outputInfo = await sharp(inputPath)
        .resize(size.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({
          quality: CONFIG.quality,
          effort: CONFIG.effort
        })
        .toFile(outputPath);
      
      results.push({
        size: size.name,
        width: size.width,
        path: outputPath,
        fileSize: outputInfo.size
      });
    } catch (error) {
      console.error(`\n❌ 반응형 이미지 생성 실패 (${size.name}): ${error.message}`);
    }
  }
  
  return results;
}

/**
 * 파일 필터링
 */
function shouldProcessFile(filePath) {
  // 제외 패턴 확인
  for (const pattern of CONFIG.excludePatterns) {
    if (filePath.includes(pattern.replace('*', ''))) {
      return false;
    }
  }
  
  // 파일 크기 확인
  const stats = fs.statSync(filePath);
  if (stats.size < CONFIG.minFileSize) {
    return false;
  }
  
  // 확장자 확인
  const ext = path.extname(filePath).toLowerCase().substring(1);
  return CONFIG.extensions.includes(ext);
}

/**
 * 메인 변환 프로세스
 */
async function main() {
  console.log('🔄 WebP 변환 시작...\n');
  
  // 출력 디렉토리 생성
  ensureDir(CONFIG.outputDir);
  
  // 변환할 파일 찾기
  const allFiles = [];
  for (const ext of CONFIG.extensions) {
    const files = glob.sync(`${CONFIG.sourceDir}/**/*.${ext}`, { nocase: true });
    allFiles.push(...files);
  }
  
  // 필터링
  const filesToProcess = allFiles.filter(shouldProcessFile);
  
  console.log(`📊 총 ${filesToProcess.length}개 파일을 WebP로 변환합니다.`);
  console.log(`📁 출력 경로: ${CONFIG.outputDir}\n`);
  
  if (filesToProcess.length === 0) {
    console.log('❌ 변환할 파일이 없습니다.');
    return;
  }
  
  const results = {
    successful: [],
    failed: [],
    skipped: [],
    totalOriginalSize: 0,
    totalWebpSize: 0,
    totalSavings: 0
  };
  
  // 변환 실행
  for (let i = 0; i < filesToProcess.length; i++) {
    const inputPath = filesToProcess[i];
    const fileName = path.basename(inputPath);
    const fileNameWithoutExt = path.parse(fileName).name;
    const relativePath = path.relative(CONFIG.sourceDir, inputPath);
    const outputSubDir = path.join(CONFIG.outputDir, path.dirname(relativePath));
    
    // 출력 디렉토리 생성
    ensureDir(outputSubDir);
    
    const outputPath = path.join(outputSubDir, `${fileNameWithoutExt}.webp`);
    
    showProgress(i + 1, filesToProcess.length, fileName);
    
    try {
      const result = await convertToWebP(inputPath, outputPath);
      
      results.successful.push(result);
      results.totalOriginalSize += result.input.size;
      results.totalWebpSize += result.output.size;
      results.totalSavings += result.savings;
      
      // 큰 이미지의 경우 반응형 버전도 생성
      if (result.input.width > 800 && result.input.size > 50 * 1024) {
        const responsiveResults = await createResponsiveWebP(
          inputPath,
          outputSubDir,
          fileNameWithoutExt
        );
        
        if (responsiveResults.length > 0) {
          result.responsive = responsiveResults;
        }
      }
      
    } catch (error) {
      results.failed.push({
        path: inputPath,
        error: error.message
      });
    }
  }
  
  console.log('\n\n✅ WebP 변환 완료!\n');
  
  // 결과 요약
  console.log('📊 변환 결과:');
  console.log(`   성공: ${results.successful.length}개`);
  console.log(`   실패: ${results.failed.length}개`);
  console.log(`   건너뜀: ${results.skipped.length}개\n`);
  
  console.log('💾 용량 절약:');
  console.log(`   원본 총 크기: ${formatBytes(results.totalOriginalSize)}`);
  console.log(`   WebP 총 크기: ${formatBytes(results.totalWebpSize)}`);
  console.log(`   절약된 용량: ${formatBytes(results.totalSavings)}`);
  
  if (results.totalOriginalSize > 0) {
    const savingsPercentage = (results.totalSavings / results.totalOriginalSize * 100).toFixed(1);
    console.log(`   절약률: ${savingsPercentage}%\n`);
  }
  
  // 실패한 파일들
  if (results.failed.length > 0) {
    console.log('❌ 변환 실패한 파일들:');
    results.failed.forEach(failure => {
      console.log(`   ${failure.path}: ${failure.error}`);
    });
    console.log('');
  }
  
  // 최대 절약 파일들 (상위 5개)
  const topSavings = results.successful
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 5);
  
  if (topSavings.length > 0) {
    console.log('💡 최대 절약 파일들:');
    topSavings.forEach(result => {
      const fileName = path.basename(result.input.path);
      const savings = formatBytes(result.savings);
      const ratio = result.compressionRatio;
      console.log(`   ${fileName}: ${savings} 절약 (압축률 ${ratio}%)`);
    });
    console.log('');
  }
  
  // 사용 가이드 생성
  generateUsageGuide(results);
  
  console.log('🎉 모든 작업이 완료되었습니다!');
  console.log('💡 LazyImage 컴포넌트를 사용하여 WebP 이미지를 활용하세요.');
}

/**
 * 사용 가이드 생성
 */
function generateUsageGuide(results) {
  const guidePath = path.join(CONFIG.outputDir, 'webp-usage-guide.md');
  
  let guide = `# WebP 이미지 사용 가이드\n\n`;
  guide += `> 생성일: ${new Date().toLocaleString('ko-KR')}\n`;
  guide += `> 변환된 파일: ${results.successful.length}개\n`;
  guide += `> 절약된 용량: ${formatBytes(results.totalSavings)}\n\n`;
  
  guide += `## 🚀 LazyImage 컴포넌트 사용법\n\n`;
  guide += `### 기본 사용법\n`;
  guide += `\`\`\`tsx\n`;
  guide += `import LazyImage from '@/components/common/LazyImage';\n\n`;
  guide += `<LazyImage\n`;
  guide += `  src="/assets/images/hero.png"\n`;
  guide += `  webpSrc="/assets/images/webp/hero.webp"\n`;
  guide += `  alt="히어로 이미지"\n`;
  guide += `  loading="lazy"\n`;
  guide += `/>\n`;
  guide += `\`\`\`\n\n`;
  
  guide += `### Picture 엘리먼트 직접 사용\n`;
  guide += `\`\`\`tsx\n`;
  guide += `<picture>\n`;
  guide += `  <source srcSet="/assets/images/webp/hero.webp" type="image/webp" />\n`;
  guide += `  <img src="/assets/images/hero.png" alt="히어로 이미지" />\n`;
  guide += `</picture>\n`;
  guide += `\`\`\`\n\n`;
  
  guide += `### 반응형 이미지 사용\n`;
  guide += `\`\`\`tsx\n`;
  guide += `<picture>\n`;
  guide += `  <source\n`;
  guide += `    media="(max-width: 480px)"\n`;
  guide += `    srcSet="/assets/images/webp/hero-small.webp"\n`;
  guide += `    type="image/webp"\n`;
  guide += `  />\n`;
  guide += `  <source\n`;
  guide += `    media="(max-width: 768px)"\n`;
  guide += `    srcSet="/assets/images/webp/hero-medium.webp"\n`;
  guide += `    type="image/webp"\n`;
  guide += `  />\n`;
  guide += `  <source srcSet="/assets/images/webp/hero.webp" type="image/webp" />\n`;
  guide += `  <img src="/assets/images/hero.png" alt="히어로 이미지" />\n`;
  guide += `</picture>\n`;
  guide += `\`\`\`\n\n`;
  
  guide += `## 📁 변환된 파일 목록\n\n`;
  results.successful.forEach(result => {
    const originalPath = path.relative(CONFIG.sourceDir, result.input.path);
    const webpPath = path.relative('.', result.output.path);
    const savings = formatBytes(result.savings);
    const ratio = result.compressionRatio;
    
    guide += `- **${originalPath}**\n`;
    guide += `  - WebP: \`${webpPath}\`\n`;
    guide += `  - 절약: ${savings} (압축률 ${ratio}%)\n`;
    
    if (result.responsive && result.responsive.length > 0) {
      guide += `  - 반응형:\n`;
      result.responsive.forEach(resp => {
        const respPath = path.relative('.', resp.path);
        guide += `    - ${resp.size} (${resp.width}px): \`${respPath}\`\n`;
      });
    }
    guide += `\n`;
  });
  
  fs.writeFileSync(guidePath, guide);
  console.log(`📖 사용 가이드 생성: ${guidePath}`);
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  convertToWebP,
  createResponsiveWebP
};