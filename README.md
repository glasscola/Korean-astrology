# 사주정원

생년월일로 사주표를 계산하고, 처음 보는 사람도 종합 풀이와 생활 질문을 읽을 수 있는 정적 사이트입니다. 입력한 출생 정보와 이름은 브라우저 안에서 처리합니다.

## 실행과 배포

- 로컬에서는 `dist/index.html`을 열거나 `node server.cjs`로 실행합니다.
- GitHub Pages는 `main`에 푸시할 때 테스트를 통과한 `dist/`를 배포합니다.
- `python scripts/package-site.py`는 분리된 파일로 구성된 배포 ZIP을 `outputs/`에 저장합니다. ZIP을 풀어 `index.html`을 엽니다.

## 파일 구성

| 부분 | 파일 |
| --- | --- |
| 입력·탐색·저장 | `index.html`, `app.js`, `ui.js`, `region-picker.js` |
| 계산과 종합 해석 | `engine.js`, `reading.js` |
| 결과 화면 | `report-view.js`, `detail-view.js`, `timing-view.js`, `scenes.js` |
| 생활 질문 | `questions-data.js`, `questions-view.js` |
| 이름 | `name.js`, `data/hanja-*.js` 8개와 각각의 출처 고지 |
| 스타일 | `style.css`, `forms.css`, `reading.css` |

출생 지역 검색 자료와 달력 라이브러리는 해당 기능이 필요할 때 불러옵니다. 한자 직접 입력은 필요한 코드 포인트에 해당하는 데이터 파일부터 사용합니다. 한글로 후보를 찾을 때는 여덟 데이터 파일을 검색합니다. 대화형 결과의 데이터 요청은 사이트 내부 정적 파일에 한정합니다.

## 해석 범위

- 1962년 이후 국내 출생. 양력·음력·윤달, 선택적 경도 보정, 자정 또는 23시 일주 기준, 1987·1988년 서머타임.
- 시간을 모르면 시주를 빼고 계산합니다. 일주나 절입 경계가 달라질 수 있으면 후보 사주표를 안내하고 개인 종합 풀이의 범위를 제한합니다.
- 종합 설명은 일간을 제외한 다른 위치의 역할과 태어난 달을 함께 비교하는 사이트의 편집 규칙입니다. 화면에서 근거 글자를 볼 수 있습니다.
- 오행 비율은 글자 구성입니다. 시기별 풀이는 선택한 날짜의 낮 12시 달력 글자와 원국을 비교하며, 출생 시간과 기준을 확인하면 대운도 반영합니다.
- 이름은 실제 글자를 확인해 독음·뜻·일반 획수와 이름에 담긴 의미를 보여줍니다. 정규화한 문자는 검색 보조에 쓰고 화면·저장에서는 입력 자형을 보존합니다. 성명학의 원획·81수리·한자별 자원오행은 추가 검증 자료가 필요한 영역입니다.
- 기존 로컬 저장 키를 사용하며, 저장·삭제는 사용자가 화면에서 선택합니다.

## 자료

- [libhangul 한자 사전](https://github.com/libhangul/libhangul/blob/main/data/hanja/hanja.txt), BSD 3-Clause. 단일 한자의 훈음 자료만 사용하며 [고지](dist/data/libhangul-LICENSE.txt)를 포함합니다.
- [Unihan 17.0](https://www.unicode.org/Public/17.0.0/ucd/Unihan.zip), Unicode License v3. 한국 독음과 일반 획수 보조 자료입니다. [고지](dist/data/unicode-LICENSE.txt).
- 한자 자료 재생성은 `python scripts/build-name-data.py <hanja.txt> <Unihan.zip> <unicode-license.txt>`입니다. 데이터 수와 사전 원본 SHA-256은 `dist/data/hanja-meta.json`에 있습니다.
- [lunar-javascript](https://github.com/6tail/lunar-javascript)와 [korean-lunar-calendar](https://github.com/usingsky/korean_lunar_calendar_js), MIT. `dist/vendor/`에 고지를 포함합니다.
- [한국천문연구원](https://astro.kasi.re.kr/life/pageView/8), [한국민족문화대백과사전 사주](https://encykorea.aks.ac.kr/Article/E0025957), [출생 지역 데이터](REGION-DATA.md).
- 표지와 생활 장면은 `dist/assets/watercolor/`의 수채화 삽화입니다. [제작 기록과 프롬프트](ARTWORK.md).

## 검증

`node test-engine.cjs`, `node test-regions.cjs`, `node test-public.cjs`, `node test-reading.cjs`.
