#!/usr/bin/env node

/**
 * KB스타뱅킹 이미지 분석 스크립트
 * - 모든 이미지 파일의 크기, 포맷, 사용 현황 분석
 * - 최적화 권장사항 제공
 * - 중복 이미지 검출
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const glob = require('glob');

const CONFIG = {
  sourceDir: './src/assets/images',
  codeDir: './src',
  reportPath: './scripts/image-analysis-report.md'
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
 * 파일 해시 생성 (중복 검출용)
 */
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

/**
 * 이미지 메타데이터 분석
 */
async function analyzeImage(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const metadata = await sharp(filePath).metadata();
    const hash = getFileHash(filePath);
    
    return {
      path: filePath,
      name: path.basename(filePath),
      directory: path.dirname(filePath),
      size: stats.size,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha,
      density: metadata.density,
      hash,
      aspectRatio: metadata.width / metadata.height,
      pixelDensity: (metadata.width * metadata.height) / (stats.size / 1024), // pixels per KB
      lastModified: stats.mtime
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 코드에서 이미지 사용 현황 검색
 */
function findImageUsage(imageName) {
  const usagePatterns = [
    new RegExp(`['"\`].*${imageName}['"\`]`, 'g'),
    new RegExp(`src.*=.*['"\`].*${imageName}['"\`]`, 'g'),
    new RegExp(`import.*${imageName.replace(/\.[^.]+$/, '')}`, 'g'),
    new RegExp(`url\\(.*${imageName}.*\\)`, 'g')
  ];
  
  const usages = [];
  const codeFiles = glob.sync(`${CONFIG.codeDir}/**/*.{ts,tsx,js,jsx,css,scss}`);
  
  codeFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      usagePatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          usages.push({
            file: filePath,
            matches: matches.length,
            patterns: matches
          });
        }
      });
    } catch (error) {
      // 파일 읽기 오류 무시
    }
  });
  
  return usages;
}

/**
 * 중복 이미지 검출
 */
function findDuplicateImages(imageAnalyses) {
  const hashMap = new Map();
  const duplicates = [];
  
  imageAnalyses.forEach(analysis => {
    if (analysis && analysis.hash) {
      if (hashMap.has(analysis.hash)) {
        const existing = hashMap.get(analysis.hash);
        duplicates.push({
          original: existing,
          duplicate: analysis
        });
      } else {
        hashMap.set(analysis.hash, analysis);
      }
    }
  });
  
  return duplicates;
}

/**
 * 최적화 권장사항 생성
 */
function generateRecommendations(analysis) {
  const recommendations = [];
  
  // 크기 기반 권장사항
  if (analysis.size > 100 * 1024) { // 100KB 초과
    recommendations.push({
      type: 'size',
      priority: 'high',
      message: `큰 파일 크기 (${formatBytes(analysis.size)}). WebP 변환 및 압축 권장`
    });
  }
  
  // 해상도 기반 권장사항
  if (analysis.width > 1920 || analysis.height > 1080) {
    recommendations.push({
      type: 'resolution',
      priority: 'medium',
      message: `높은 해상도 (${analysis.width}x${analysis.height}). 반응형 이미지 생성 권장`
    });
  }
  
  // 포맷 기반 권장사항
  if (analysis.format === 'png' && !analysis.hasAlpha && analysis.size > 10 * 1024) {
    recommendations.push({
      type: 'format',
      priority: 'medium',
      message: '투명도가 없는 PNG. JPEG/WebP 변환 고려'
    });
  }
  
  // 효율성 기반 권장사항
  if (analysis.pixelDensity < 100) {
    recommendations.push({
      type: 'efficiency',
      priority: 'low',
      message: '낮은 압축 효율성. 압축 설정 최적화 가능'
    });
  }
  
  return recommendations;
}

/**
 * 분석 리포트 생성
 */
function generateReport(analyses, duplicates, totalSize) {
  const now = new Date();
  let report = `# KB스타뱅킹 이미지 분석 리포트\n\n`;
  report += `> 생성일: ${now.toLocaleString('ko-KR')}\n\n`;
  
  // 전체 통계
  report += `## 📊 전체 통계\n\n`;
  report += `- **총 이미지 수**: ${analyses.length}개\n`;
  report += `- **총 용량**: ${formatBytes(totalSize)}\n`;
  report += `- **평균 파일 크기**: ${formatBytes(totalSize / analyses.length)}\n`;
  report += `- **중복 이미지**: ${duplicates.length}개\n\n`;
  
  // 파일 크기별 분포
  const sizeDistribution = {
    small: analyses.filter(a => a.size < 10 * 1024).length,
    medium: analyses.filter(a => a.size >= 10 * 1024 && a.size < 100 * 1024).length,
    large: analyses.filter(a => a.size >= 100 * 1024).length
  };
  
  report += `### 파일 크기 분포\n`;
  report += `- **작음 (< 10KB)**: ${sizeDistribution.small}개\n`;
  report += `- **보통 (10KB - 100KB)**: ${sizeDistribution.medium}개\n`;
  report += `- **큼 (> 100KB)**: ${sizeDistribution.large}개\n\n`;
  
  // 포맷별 분포
  const formatDistribution = {};
  analyses.forEach(analysis => {
    formatDistribution[analysis.format] = (formatDistribution[analysis.format] || 0) + 1;
  });
  
  report += `### 포맷별 분포\n`;
  Object.entries(formatDistribution).forEach(([format, count]) => {
    report += `- **${format.toUpperCase()}**: ${count}개\n`;
  });
  report += `\n`;
  
  // 큰 파일들
  const largeFiles = analyses
    .filter(a => a.size > 50 * 1024)
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  
  if (largeFiles.length > 0) {
    report += `## 🔍 큰 파일들 (상위 10개)\n\n`;
    report += `| 파일명 | 크기 | 해상도 | 포맷 | 권장사항 |\n`;
    report += `|--------|------|--------|------|----------|\n`;
    
    largeFiles.forEach(analysis => {
      const recommendations = generateRecommendations(analysis);
      const mainRecommendation = recommendations.find(r => r.priority === 'high') || 
                                recommendations[0] || 
                                { message: '최적화됨' };
      
      report += `| ${analysis.name} | ${formatBytes(analysis.size)} | ${analysis.width}x${analysis.height} | ${analysis.format.toUpperCase()} | ${mainRecommendation.message} |\n`;
    });
    report += `\n`;
  }
  
  // 중복 파일들
  if (duplicates.length > 0) {
    report += `## 🔄 중복 이미지\n\n`;
    duplicates.forEach((duplicate, index) => {
      report += `### 중복 ${index + 1}\n`;
      report += `- **원본**: \`${duplicate.original.path}\` (${formatBytes(duplicate.original.size)})\n`;
      report += `- **중복**: \`${duplicate.duplicate.path}\` (${formatBytes(duplicate.duplicate.size)})\n\n`;
    });
  }
  
  // 사용하지 않는 이미지
  const unusedImages = [];
  analyses.forEach(analysis => {
    const usage = findImageUsage(analysis.name);
    if (usage.length === 0) {
      unusedImages.push(analysis);
    }
  });
  
  if (unusedImages.length > 0) {
    report += `## 🗑️ 사용하지 않는 이미지 (${unusedImages.length}개)\n\n`;
    unusedImages.slice(0, 20).forEach(analysis => {
      report += `- \`${analysis.path}\` (${formatBytes(analysis.size)})\n`;
    });
    if (unusedImages.length > 20) {
      report += `... 및 ${unusedImages.length - 20}개 더\n`;
    }
    report += `\n`;
  }
  
  // 최적화 권장사항
  report += `## 💡 최적화 권장사항\n\n`;
  
  const allRecommendations = [];
  analyses.forEach(analysis => {
    const recs = generateRecommendations(analysis);
    recs.forEach(rec => {
      allRecommendations.push({
        ...rec,
        file: analysis.name,
        size: analysis.size
      });
    });
  });
  
  // 우선순위별로 그룹화
  const groupedRecommendations = {
    high: allRecommendations.filter(r => r.priority === 'high'),
    medium: allRecommendations.filter(r => r.priority === 'medium'),
    low: allRecommendations.filter(r => r.priority === 'low')
  };
  
  Object.entries(groupedRecommendations).forEach(([priority, recs]) => {
    if (recs.length > 0) {
      report += `### ${priority === 'high' ? '🔴 높음' : priority === 'medium' ? '🟡 보통' : '🟢 낮음'} (${recs.length}개)\n\n`;
      recs.slice(0, 10).forEach(rec => {
        report += `- **${rec.file}**: ${rec.message}\n`;
      });
      if (recs.length > 10) {
        report += `... 및 ${recs.length - 10}개 더\n`;
      }
      report += `\n`;
    }
  });
  
  // 구현 가이드
  report += `## 🛠️ 구현 가이드\n\n`;
  report += `### 1. 이미지 최적화 실행\n`;
  report += `\`\`\`bash\n`;
  report += `npm run images:optimize\n`;
  report += `\`\`\`\n\n`;
  
  report += `### 2. WebP 변환\n`;
  report += `\`\`\`bash\n`;
  report += `npm run images:webp\n`;
  report += `\`\`\`\n\n`;
  
  report += `### 3. 스프라이트 생성\n`;
  report += `\`\`\`bash\n`;
  report += `npm run images:sprites\n`;
  report += `\`\`\`\n\n`;
  
  report += `### 4. LazyImage 컴포넌트 사용\n`;
  report += `\`\`\`tsx\n`;
  report += `import LazyImage from '@/components/common/LazyImage';\n\n`;
  report += `<LazyImage\n`;
  report += `  src="/assets/images/hero.png"\n`;
  report += `  webpSrc="/assets/images/optimized/hero.webp"\n`;
  report += `  alt="히어로 이미지"\n`;
  report += `  loading="lazy"\n`;
  report += `/>\n`;
  report += `\`\`\`\n\n`;
  
  return report;
}

/**
 * 메인 분석 프로세스
 */
async function main() {
  console.log('🔍 KB스타뱅킹 이미지 분석 시작...\n');
  
  // 이미지 파일 찾기
  const imageFiles = glob.sync(`${CONFIG.sourceDir}/**/*.{png,jpg,jpeg,gif,svg,webp}`);
  console.log(`📊 총 ${imageFiles.length}개의 이미지 파일을 찾았습니다.\n`);
  
  if (imageFiles.length === 0) {
    console.log('❌ 분석할 이미지가 없습니다.');
    return;
  }
  
  // 각 이미지 분석
  console.log('🔄 이미지 파일들을 분석중...');
  const analyses = [];
  let totalSize = 0;
  
  for (const filePath of imageFiles) {
    const analysis = await analyzeImage(filePath);
    if (analysis) {
      analyses.push(analysis);
      totalSize += analysis.size;
    }
  }
  
  console.log(`✅ ${analyses.length}개 파일 분석 완료\n`);
  
  // 중복 이미지 검출
  console.log('🔄 중복 이미지 검색중...');
  const duplicates = findDuplicateImages(analyses);
  console.log(`✅ ${duplicates.length}개 중복 이미지 발견\n`);
  
  // 사용 현황 분석
  console.log('🔄 이미지 사용 현황 분석중...');
  let unusedCount = 0;
  for (const analysis of analyses) {
    const usage = findImageUsage(analysis.name);
    if (usage.length === 0) {
      unusedCount++;
    }
  }
  console.log(`✅ ${unusedCount}개 미사용 이미지 발견\n`);
  
  // 리포트 생성
  console.log('📝 분석 리포트 생성중...');
  const report = generateReport(analyses, duplicates, totalSize);
  
  // 리포트 저장
  fs.writeFileSync(CONFIG.reportPath, report);
  console.log(`✅ 리포트 생성 완료: ${CONFIG.reportPath}\n`);
  
  // 요약 출력
  console.log('📊 분석 결과 요약:');
  console.log(`   총 이미지: ${analyses.length}개`);
  console.log(`   총 용량: ${formatBytes(totalSize)}`);
  console.log(`   중복 이미지: ${duplicates.length}개`);
  console.log(`   미사용 이미지: ${unusedCount}개`);
  console.log(`   평균 크기: ${formatBytes(totalSize / analyses.length)}`);
  
  const largeFiles = analyses.filter(a => a.size > 100 * 1024).length;
  console.log(`   대용량 파일 (>100KB): ${largeFiles}개\n`);
  
  if (largeFiles > 0 || duplicates.length > 0 || unusedCount > 0) {
    console.log('💡 최적화 권장: npm run images:optimize 실행');
  } else {
    console.log('✨ 이미지 최적화 상태 양호');
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeImage,
  findImageUsage,
  findDuplicateImages,
  generateRecommendations
};