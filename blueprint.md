# Animal Face Type Test Blueprint

## Overview
이 애플리케이션은 사용자의 사진을 분석하여 어떤 동물상(강아지, 고양이, 여우, 토끼, 사슴)인지 알려주는 웹 서비스입니다.

## Features
- **사진 업로드:** 로컬 기기에서 사진 파일을 선택하여 업로드할 수 있습니다.
- **사진 촬영:** 웹캠을 사용하여 직접 사진을 촬영할 수 있습니다.
- **분류 결과 표시:** 각 동물상별 일치율을 프로그래스 바 형태로 시각화하여 보여줍니다.
- **매력 분석 차트:** 동물상별 성격/특징을 육각형 레이더 차트(Radar Chart)로 시각화합니다. 테마(다크/라이트)에 따라 자동으로 색상이 조정됩니다. (Improved)
- **드래그 앤 드롭 업로드:** 사진 파일을 브라우저로 직접 끌어다 놓아 간편하게 업로드할 수 있습니다. (New)
- **재치 있는 한줄 평:** 일치율(%)에 따라 AI가 건네는 듯한 재미있는 멘트를 제공합니다. (New)
- **결과 이미지 저장:** 분석 결과가 담긴 카드를 이미지로 저장하여 공유할 수 있습니다.
- **닮은 연예인 추천:** 각 동물상에 해당하는 대표적인 연예인 목록을 보여줍니다.
- **다크 모드:** 사용자 환경 또는 설정에 따라 다크/라이트 테마를 전환할 수 있습니다. 차트와 UI 요소들이 실시간으로 반응합니다.
- **커뮤니티(수다방):** 익명으로 닉네임과 비밀번호를 설정하여 글을 남기고 실시간으로 소통할 수 있습니다. (New)
- **댓글 삭제 기능:** 글 작성 시 설정한 비밀번호를 통해 본인의 글을 직접 삭제할 수 있습니다. (New)
- **SNS 공유 최적화(SEO):** Open Graph 메타 태그를 적용하여 카카오톡, 페이스북 등 공유 시 미리보기가 예쁘게 표시됩니다.
- **반응형 디자인:** 모바일과 데스크톱 모두에서 최적화된 UI를 제공합니다.
- **문의하기:** Formspree를 연동하여 제휴 및 피드백 문의를 받을 수 있는 폼을 제공합니다.

## Technical Stack
- HTML5 (Web Components 사용 고려)
- CSS3 (Modern Baseline features: Variables, Flexbox, Grid)
- JavaScript (ES Modules, MediaDevices API)
- **TensorFlow.js & Teachable Machine Image Library**
- **Chart.js (Data Visualization)**
- **html2canvas (Image Generation)**
- **Formspree (Email Service)**

## Implementation Plan
1. **index.html:**
    - Chart.js CDN 추가.
    - 결과 카드(`share-card`) 내부에 레이더 차트 캔버스 및 한줄 평 영역 추가.
2. **style.css:**
    - 레이더 차트 컨테이너 및 한줄 평 텍스트 스타일 정의.
3. **main.js:**
    - `animalDetails` 객체에 동물별 능력치(stats) 및 구간별 코멘트(comments) 데이터 추가.
    - `displayResults` 함수 수정:
        - `Chart.js`를 사용하여 레이더 차트 생성 및 렌더링.
        - 일치율에 따른 맞춤형 멘트 선택 및 표시.
        - 차트 중복 생성 방지를 위한 인스턴스 관리.
4. **UI/UX Improvements:**
    - 모바일 환경에서의 헤더 컨트롤(테마/언어 전환) 위치 및 스타일 최적화.
5. **Verification:** 브라우저 미리보기를 통한 차트 렌더링 및 멘트 표시 확인.
