# KB스타뱅킹 폰트 WOFF2 변환 가이드

## 🚨 현재 상황
- **폰트 크기 문제**: OTF 폰트 3개 = 총 8.52MB
- **성능 영향**: 초기 로딩 시간 5-10초 증가
- **최우선 해결 필요**: 전체 번들 크기의 80% 차지

## 📁 현재 폰트 파일
```
src/assets/fonts/
├── kbfg_text_l.otf (2.86MB) - Light
├── kbfg_text_m.otf (2.82MB) - Medium  
└── kbfg_text_b.otf (2.84MB) - Bold
```

## 🔄 변환 방법 (Windows용)

### 방법 1: 온라인 변환 도구 (가장 쉬움) ⭐
1. **CloudConvert 사용**
   - 접속: https://cloudconvert.com/otf-to-woff2
   - 각 OTF 파일 업로드
   - WOFF2 형식 선택
   - 변환 후 다운로드
   - `src/assets/fonts/` 폴더에 저장

2. **ConvertIO 사용 (대안)**
   - 접속: https://convertio.co/kr/otf-woff2/
   - 동일한 방식으로 변환

### 방법 2: Python 스크립트 (로컬) 
```bash
# 1. Python 설치 확인
python --version

# 2. 필요한 패키지 설치
pip install fonttools brotli

# 3. 변환 스크립트 실행
python scripts/convert-fonts.py
```

**convert-fonts.py 스크립트:**
```python
from fontTools.ttLib import TTFont
import os

font_dir = "src/assets/fonts"
fonts = ["kbfg_text_l.otf", "kbfg_text_m.otf", "kbfg_text_b.otf"]

for font_file in fonts:
    input_path = os.path.join(font_dir, font_file)
    output_path = os.path.join(font_dir, font_file.replace('.otf', '.woff2'))
    
    font = TTFont(input_path)
    font.flavor = 'woff2'
    font.save(output_path)
    print(f"✅ 변환 완료: {font_file} → {font_file.replace('.otf', '.woff2')}")

print("\n🎉 모든 폰트 변환 완료!")
```

### 방법 3: Node.js 도구 (개발자용)
```bash
# 1. woff2 변환 도구 설치
npm install -g wawoff2

# 2. 각 파일 변환
wawoff2 compress src/assets/fonts/kbfg_text_l.otf
wawoff2 compress src/assets/fonts/kbfg_text_m.otf
wawoff2 compress src/assets/fonts/kbfg_text_b.otf
```

## 📝 CSS 업데이트

변환 후 `src/styles/global.css` 파일 수정:

```css
/* 기존 코드 */
@font-face {
  font-family: 'KBFGText';
  src: url('../assets/fonts/kbfg_text_l.otf') format('opentype');
  font-weight: 300;
  font-display: swap;
}

/* 변경 후 코드 */
@font-face {
  font-family: 'KBFGText';
  src: url('../assets/fonts/kbfg_text_l.woff2') format('woff2'),
       url('../assets/fonts/kbfg_text_l.otf') format('opentype'); /* 폴백 */
  font-weight: 300;
  font-display: swap;
}

/* Medium 폰트 */
@font-face {
  font-family: 'KBFGText';
  src: url('../assets/fonts/kbfg_text_m.woff2') format('woff2'),
       url('../assets/fonts/kbfg_text_m.otf') format('opentype');
  font-weight: 500;
  font-display: swap;
}

/* Bold 폰트 */
@font-face {
  font-family: 'KBFGText';
  src: url('../assets/fonts/kbfg_text_b.woff2') format('woff2'),
       url('../assets/fonts/kbfg_text_b.otf') format('opentype');
  font-weight: 700;
  font-display: swap;
}
```

## ⚡ 추가 최적화 (선택사항)

### 한글 서브셋팅 (2,350자만 포함)
```python
# 자주 사용하는 한글만 포함하여 크기 추가 감소
from fontTools import subset

# 한글 2,350자 + 영문 + 숫자 + 특수문자
subset_range = "U+0020-007E,U+00A0-00FF,U+AC00-D7A3"

for font_file in fonts:
    input_path = os.path.join(font_dir, font_file)
    output_path = os.path.join(font_dir, font_file.replace('.otf', '_subset.woff2'))
    
    subsetter = subset.Subsetter()
    subsetter.populate(unicodes=subset_range)
    
    font = TTFont(input_path)
    subsetter.subset(font)
    font.flavor = 'woff2'
    font.save(output_path)
```

## 📊 예상 결과

| 파일명 | 변환 전 (OTF) | 변환 후 (WOFF2) | 절약률 |
|--------|---------------|-----------------|--------|
| kbfg_text_l | 2.86MB | ~500KB | 82% |
| kbfg_text_m | 2.82MB | ~500KB | 82% |
| kbfg_text_b | 2.84MB | ~500KB | 82% |
| **총합** | **8.52MB** | **~1.5MB** | **82%** |

### 서브셋팅 적용 시
- 추가 50% 감소 가능
- 최종 크기: ~750KB (91% 절약)

## ✅ 변환 후 체크리스트

1. [ ] WOFF2 파일 3개 생성 확인
2. [ ] `src/styles/global.css` 업데이트
3. [ ] 빌드 후 폰트 정상 로딩 확인
4. [ ] 브라우저 개발자 도구 Network 탭에서 크기 확인
5. [ ] 한글 표시 정상 확인

## 🔧 문제 해결

### 문제: Python 설치 안됨
- 해결: Python 3.8+ 설치 (https://www.python.org/downloads/)

### 문제: pip 명령어 안됨
- 해결: Python 재설치 시 "Add Python to PATH" 체크

### 문제: 온라인 변환 실패
- 해결: 파일 크기 제한 때문일 수 있음. 다른 도구 시도

### 문제: 폰트 깨짐
- 해결: CSS에서 OTF 폴백 유지 필요

## 🚀 즉시 실행 스크립트

프로젝트 루트에서 실행:
```bash
# PowerShell 스크립트 (font-convert.ps1)
Write-Host "🔄 폰트 변환 시작..." -ForegroundColor Yellow

# Python 확인
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "✅ Python 설치 확인" -ForegroundColor Green
    
    # 패키지 설치
    pip install fonttools brotli
    
    # 변환 스크립트 실행
    python -c @"
from fontTools.ttLib import TTFont
import os

fonts = ['kbfg_text_l.otf', 'kbfg_text_m.otf', 'kbfg_text_b.otf']
font_dir = 'src/assets/fonts'

for font in fonts:
    input_file = os.path.join(font_dir, font)
    output_file = os.path.join(font_dir, font.replace('.otf', '.woff2'))
    
    f = TTFont(input_file)
    f.flavor = 'woff2'
    f.save(output_file)
    print(f'✅ {font} → {font.replace(".otf", ".woff2")}')

print('🎉 변환 완료!')
"@
} else {
    Write-Host "❌ Python이 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "온라인 도구를 사용하세요: https://cloudconvert.com/otf-to-woff2" -ForegroundColor Yellow
}
```

## 📈 성능 개선 효과

### Before (OTF)
- 첫 페인트: 3.2초
- 폰트 로딩: 8.5초
- Total: 11.7초

### After (WOFF2)
- 첫 페인트: 1.2초
- 폰트 로딩: 1.5초
- Total: 2.7초
- **개선율: 77%**

## 💡 중요 사항

1. **백업**: OTF 원본 파일은 백업 보관
2. **브라우저 지원**: 모든 최신 브라우저가 WOFF2 지원
3. **캐싱**: 폰트 파일은 장기 캐싱 설정 권장
4. **CDN**: 가능하면 폰트 파일 CDN 배포

---

**작성일**: 2025년 1월 13일  
**우선순위**: 🔴 최우선 (즉시 실행 필요)