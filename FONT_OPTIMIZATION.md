# 폰트 최적화 가이드

## 현재 상태
- kbfg_text_l.otf (2.86MB)
- kbfg_text_m.otf (2.82MB)
- kbfg_text_b.otf (2.84MB)
- **총 크기: 8.52MB**

## 최적화 방법

### 1. WOFF2 변환 (Windows)

#### 방법 1: 온라인 변환 도구 사용
1. https://cloudconvert.com/otf-to-woff2 접속
2. 각 OTF 파일 업로드
3. WOFF2로 변환 후 다운로드
4. src/assets/fonts/ 폴더에 저장

#### 방법 2: Python fonttools 사용
```bash
# Python 설치 필요
pip install fonttools brotli

# 변환 스크립트
python -c "
from fontTools.ttLib import TTFont
from fontTools.ttLib.woff2 import compress

fonts = ['kbfg_text_l.otf', 'kbfg_text_m.otf', 'kbfg_text_b.otf']
for font_file in fonts:
    font = TTFont(f'src/assets/fonts/{font_file}')
    font.flavor = 'woff2'
    font.save(f'src/assets/fonts/{font_file[:-4]}.woff2')
"
```

#### 방법 3: Node.js 도구 사용
```bash
npm install -g ttf2woff2
# OTF를 TTF로 먼저 변환 필요
# 그 다음 ttf2woff2 사용
```

### 2. 폰트 서브셋팅 (한글 필수 글자만 포함)
```bash
# 한글 자주 사용하는 2,350자만 포함
pyftsubset kbfg_text_l.otf \
  --unicodes="U+0020-007E,U+00A0-00FF,U+AC00-D7A3" \
  --output-file="kbfg_text_l_subset.woff2" \
  --flavor=woff2
```

### 3. CSS 업데이트
```css
@font-face {
  font-family: 'KBFGText';
  src: url('./fonts/kbfg_text_l.woff2') format('woff2'),
       url('./fonts/kbfg_text_l.otf') format('opentype'); /* 폴백 */
  font-weight: 300;
  font-display: swap;
}

@font-face {
  font-family: 'KBFGText';
  src: url('./fonts/kbfg_text_m.woff2') format('woff2'),
       url('./fonts/kbfg_text_m.otf') format('opentype');
  font-weight: 500;
  font-display: swap;
}

@font-face {
  font-family: 'KBFGText';
  src: url('./fonts/kbfg_text_b.woff2') format('woff2'),
       url('./fonts/kbfg_text_b.otf') format('opentype');
  font-weight: 700;
  font-display: swap;
}
```

## 예상 결과
- WOFF2 변환: 8.52MB → ~1.5MB (82% 감소)
- 서브셋팅 추가 시: ~800KB (90% 감소)

## 주의사항
- 변환 후 OTF 파일은 백업 보관
- 모든 브라우저가 WOFF2를 지원하므로 호환성 문제 없음
- font-display: swap으로 FOUT 방지