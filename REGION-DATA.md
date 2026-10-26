# 지역 검색 자료와 출처

출생 지역 검색은 외부 API를 호출하지 않고 브라우저에 포함된 지역 색인에서 처리합니다. 전국 17개 시·도의 시·군·구·읍·면·동·리 명칭과 대표 위경도를 포함합니다. 좌표는 주소나 병원 위치가 아닌 법정동·지역 중심의 대표값이며, 선택한 경도에 따른 시간 보정에 사용합니다.

- 가공 자료: [swuhalee/korea-regions-with-coords](https://github.com/swuhalee/korea-regions-with-coords)
- 법정동 코드 원출처: [행정안전부 행정표준코드관리시스템](https://www.code.go.kr/), 2026년 2월 기준
- 중심 좌표 원출처: [브이월드 읍면동 경계](https://www.vworld.kr/dtmk/dtmk_ntads_s002.do?svcCde=MK&dsId=30603) 및 [리 경계](https://www.vworld.kr/dtmk/dtmk_ntads_s002.do?svcCde=MK&dsId=30602)
- 원자료에 명시된 이용 조건: **공공누리 제1유형(출처표시)**. 이 프로젝트는 지역명과 좌표를 검색용 배열로 변환했습니다.
- 2026년 7월 신설된 인천 제물포구·영종구·검단구의 구 단위 명칭을 추가했습니다. 좌표는 기존 구성 지역 중심점의 평균 대표값이며, 정밀한 행정 경계 데이터가 아닙니다. 종전 중구·동구·서구와 세부 지역명은 과거 출생지를 찾을 수 있도록 유지했습니다.
- 개편 근거: [행정안전부의 인천 행정체제 개편 안내](https://www.mois.go.kr/frt/bbs/type010/commonSelectBoardArticle.do?bbsId=BBSMSTR_000000000008&nttId=106339)

자료 갱신 시 원본 JSON을 준비하고 다음 명령을 실행합니다.

```
node scripts/build-regions.cjs path/to/korea-regions-with-coords.json
node test-regions.cjs
```

현재 행정동 이름과 법정동 이름은 다를 수 있습니다. 예를 들어 동 행정복지센터의 관할 명칭과 법정동 검색 결과가 반드시 같지는 않습니다. 검색 결과는 전체 시·도부터 세부 지역까지 표시하며 동일 이름을 구분합니다. 해외 출생지와 해외 시간대는 지원하지 않습니다.
