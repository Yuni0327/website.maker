# Animal Face Type Test Blueprint

## Overview
이 애플리케이션은 사용자의 사진을 분석하여 어떤 동물상(강아지, 고양이, 여우, 토끼, 햄스터, 사슴, 곰)인지 알려주는 웹 서비스입니다.

## Features
- **사진 업로드:** 로컬 기기에서 사진 파일을 선택하여 업로드할 수 있습니다.
- **사진 촬영:** 웹캠을 사용하여 직접 사진을 촬영할 수 있습니다.
- **분류 결과 표시:** 각 동물상별 일치율을 프로그래스 바 형태로 시각화하여 보여줍니다.
- **결과 이미지 저장:** 분석 결과가 담긴 카드를 이미지로 저장하여 공유할 수 있습니다.
- **닮은 연예인 추천:** 각 동물상에 해당하는 대표적인 연예인 목록을 보여줍니다.
- **반응형 디자인:** 모바일과 데스크톱 모두에서 최적화된 UI를 제공합니다.
- **문의하기:** Formspree를 연동하여 제휴 및 피드백 문의를 받을 수 있는 폼을 제공합니다.

## Technical Stack
- HTML5 (Web Components 사용 고려)
- CSS3 (Modern Baseline features: Variables, Flexbox, Grid)
- JavaScript (ES Modules, MediaDevices API)
- **TensorFlow.js & Teachable Machine Image Library**
- **html2canvas (Image Generation)**
- **Formspree (Email Service)**

## Implementation Plan
1. **index.html:** Teachable Machine, TensorFlow.js, html2canvas 라이브러리 추가. 결과 카드 및 저장 버튼 구조 추가.
2. **style.css:** 결과 카드(`share-card`), 연예인 칩, 저장 버튼 스타일 추가.
3. **main.js:**
    - `animalDetails` 객체에 연예인 리스트 데이터 추가.
    - `displayResults` 함수 수정:
        - 결과 카드에 사용자 이미지 복제.
        - 연예인 리스트 렌더링.
    - `saveResultImage` 함수 구현: `html2canvas`를 사용하여 `share-card` 영역 캡처 및 다운로드.
4. **Verification:** 브라우저 미리보기를 통한 기능 확인.