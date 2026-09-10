Zeta Tools site v5.1
- 모바일에서 현재 설치 환경이 확실히 보이도록 표시 강화
- site.css/site.js 캐시 버스터 추가 (?v=5.1)
- JS 로딩 전 fallback 표시 추가

Zeta Tools Site v5

GitHub Pages 저장소(zeta-userscripts-site)의 루트에 아래 파일들을 그대로 업로드/덮어쓰기:
- index.html
- scripts.html
- bookmarklets.html
- site.css
- site.js
- *.bookmarklet.txt

v5 핵심 변경:
- 기기/브라우저 자동 감지 설치 모드 추가
- 수동 선택: 자동 / iPhone Safari / iPhone Edge / Android / PC
- iPhone Safari: Stay for Safari 중심 설치 흐름
- iPhone Edge: Stay for Mobile 중심 설치 흐름
- Android/PC: Tampermonkey Raw 설치 흐름
- iPhone 모드에서는 설치 버튼을 'Stay용 링크 복사'로 바꾸고 단계별 안내 바텀시트 표시
- 아이폰 기기 없이도 PC에서 iPhone Safari/Edge 설치 화면 미리보기 가능
- 선택한 설치 모드는 localStorage에 저장
- 북마클릿은 기기와 무관하게 링크 복사 우선 구조 유지
- Room Manager 북마클릿은 저장 데이터는 유지되지만 새로고침 후 재실행 필요 문구 추가
