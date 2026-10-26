# 사주정원

AI·외부 API 호출 없이 작동하는 한국어 사주 풀이 웹사이트입니다.

## 공개 사이트의 기본 화면

첫 방문에는 생년월일이 비어 있고 `0000 / 00 / 00` 안내만 표시됩니다. 시간은 24시간 기준 `00:00`으로 시작합니다. 이름·지역·대운 기준도 미리 입력하지 않으며, 사용자가 정보를 입력하기 전에는 사주 계산과 개인 결과를 표시하지 않습니다. 저장된 프로필도 사용자가 직접 열어야 적용됩니다.

화면은 320px 모바일부터 태블릿·PC까지 대응합니다. 좁은 화면에서 오행 카드와 메뉴는 여러 줄로 배치하며, 입력 글자 크기를 16px로 설정하고 한글·한자·이모지 폰트 대체 경로를 제공합니다. 앱 아이콘과 웹 앱 매니페스트도 포함합니다.

## GitHub Pages 배포

`main` 브랜치에 푸시하면 `.github/workflows/deploy.yml`에서 계산·게시 검증을 실행하고 `dist/`를 GitHub Pages로 배포합니다. 새 저장소에서는 Settings → Pages → Build and deployment → Source를 GitHub Actions로 설정합니다.

검증 명령: `node test-engine.cjs` 및 `node test-public.cjs`.

## 실행

- `dist/index.html`을 Chrome 또는 Edge로 엽니다. 설치나 API 키가 필요 없습니다.
- 웹서버로 확인하려면 `node server.cjs` 실행 후 `http://127.0.0.1:4173`을 엽니다.
- `dist/` 전체를 정적 웹 호스팅에 올릴 수 있습니다.
- 별도로 제공하는 `사주정원.html`은 그림·스타일·계산 코드를 모두 포함한 한 파일 버전입니다.

## 기능

- 이름·별명, 양력/음력·윤달, 시·분·시간 모름, 국내 19개 도시
- 지역 경도 보정, 00시/23시 일주 경계 선택, 1987/1988 국내 서머타임 보정
- 일간·원국 4기둥, 한국식 지장간, 십성, 12운성, 연지 기준 12신살
- 오행 도넛·막대, 십성 10개 막대, 상생·상극 관계도
- 육합·육충·천간합, 15종 신살·길성 규칙의 실제 해당 결과
- 대운, 연운, 월운, 일진 달력
- 18가지 질문, 키워드 검색, 오행·십성 직접 검색, 내 사주에 맞는 규칙 기반 답변
- 브라우저 선택 저장·불러오기·삭제, 풀이 HTML 다운로드, 인쇄/PDF 저장
- 모바일·태블릿·데스크톱 대응, 키보드 탐색, 모션 감소 설정 반영

## 계산 범위와 해석

1962년 이후 대한민국 출생을 지원합니다. 1962년 이전 표준시 변경과 해외 시간대는 지원하지 않습니다. 음양력 데이터는 2050년까지 있으며, 생일로 미래 시각은 입력할 수 없습니다. 지역시는 경도 보정이며 균시차를 적용한 진태양시가 아닙니다.

한국 음력 변환은 한국 자료 라이브러리로, 사주의 년·월주는 절기 시각으로 계산합니다. lunar-javascript의 절기 UTC+8 기준에 맞춰 동일 순간을 비교합니다. 일주·시주는 한국의 선택한 지역시와 일주 경계에서 별도로 계산합니다.

오행·십성 퍼센트는 겉글자를 같은 비중으로 센 구성비입니다. 지지 십성은 본기 기준, 일간은 비견으로 포함합니다. 합화·조후 보정으로 기본 비율을 변경하지 않습니다. 강약 보조모형은 공개된 자체 가중치를 쓰며, 확정적인 태약·억부용신·조후용신이나 인구 통계를 제시하지 않습니다.

신살은 채택한 표와 위치를 각 카드에서 공개합니다. 괴강은 일주 4종 조합만 사용하므로 모든 기둥에 표시하는 다른 서비스와 결과가 다를 수 있습니다. 홍염·학관·천의 등 학파별 차이가 있는 표도 선택 규칙을 공개합니다. 운세는 상징적 해석과 생활 점검 질문이며, 사건 발생·건강·재산·관계의 확정 예측이 아닙니다.

## 개인정보

입력·계산·질문 검색은 브라우저 안에서 처리합니다. 저장 버튼을 눌렀을 때만 해당 브라우저 `localStorage`에 저장하며 외부 전송·분석 SDK·로그인·AI 호출이 없습니다. 참고 자료의 외부 링크를 누르면 해당 사이트로 이동합니다.

## 검증

`node test-engine.cjs`

사용자가 제공한 경진·신사·갑오·임신 명식과 오행 비율, 한국 음력 변환, 윤달, 시간 모름, 지역시·자정·23시·입춘·절입 경계, 서머타임, 10일간 십성, 18개 답변과 다양한 날짜 구성 검증을 포함합니다. 브라우저에서 입력·탭·오행·십성 상세·신살·달력·질문 검색·모바일 화면을 확인했습니다.

## 오픈소스 및 참고

- [lunar-javascript 1.7.7](https://github.com/6tail/lunar-javascript) — MIT, `dist/vendor/lunar-LICENSE.txt`
- [korean-lunar-calendar 0.4.0](https://github.com/usingsky/korean_lunar_calendar_js) — MIT, `dist/vendor/korean-LICENSE.txt`
- [한국민족문화대백과사전 사주](https://encykorea.aks.ac.kr/Article/E0025957)
- [한국천문연구원 음양력 자료](https://astro.kasi.re.kr/life/pageView/31)
- [삼명통회 원문](https://zh.wikisource.org/wiki/三命通會_(四庫全書本)/全覽)
- [한국식 지장간 표](https://k-haehwadang.com/guide/jijanggan)
- [홍염 채택표](https://haeaju.com/tools/dohwa)

## 일러스트 제작 기록

정원 그림은 내장 image_gen으로 제작했습니다. 운영 시 AI를 사용하지 않습니다. 웹용 그림은 `dist/assets/garden-hero.webp`, 생성 원본은 `dist/assets/garden-hero.png`입니다. 오행 도형·일러스트·차트는 SVG 코드로 제작했습니다.

생성 프롬프트:

> Use case: illustration-story. Asset: wide hero illustration for a warm, bright Korean saju self-reflection website named Saju Garden; no lettering or text. A dreamy miniature paper-cut and hand-painted gouache garden floating on a soft warm ivory background. A large friendly lush green tree center-left, a terracotta red sun and little flame-shaped flower, golden ochre rolling hills and tiny ceramic pot, smooth pale silver stones, a winding translucent blue stream. Small walking figure with a backpack under the tree gives human warmth. Five elemental motifs integrated as a charming peaceful landscape, not a diagram. Wide panoramic 3:2 composition with generous airy ivory negative space, organic shapes, subtle paper grain, sophisticated editorial illustration, sage green, leaf green, coral, mustard, dusty blue, cream. Gentle sunlight, delightful detailed foliage, high quality original illustration. No zodiac symbols, no tarot cards, no text, no watermark. Illustration should fill most of the canvas with tree canopy and stream.
