# Animal Face Type Test Blueprint

## Overview
이 애플리케이션은 사용자의 사진을 분석하여 어떤 동물상(강아지, 고양이, 여우, 토끼, 햄스터, 사슴, 곰)인지 알려주는 웹 서비스입니다.

## Features
- **사진 업로드:** 로컬 기기에서 사진 파일을 선택하여 업로드할 수 있습니다.
- **사진 촬영:** 웹캠을 사용하여 직접 사진을 촬영할 수 있습니다.
- **분류 결과 표시:** 각 동물상별 일치율을 프로그래스 바 형태로 시각화하여 보여줍니다.
- **반응형 디자인:** 모바일과 데스크톱 모두에서 최적화된 UI를 제공합니다.
- **문의하기:** Formspree를 연동하여 제휴 및 피드백 문의를 받을 수 있는 폼을 제공합니다.

## Technical Stack
- HTML5 (Web Components 사용 고려)
- CSS3 (Modern Baseline features: Variables, Flexbox, Grid)
- JavaScript (ES Modules, MediaDevices API)
- **TensorFlow.js & Teachable Machine Image Library**
- **Formspree (Email Service)**

## Implementation Plan
1. **index.html:** Teachable Machine 및 TensorFlow.js 라이브러리 추가. 문의하기 폼 섹션 추가.
2. **style.css:** 기존 디자인 유지 및 폼 스타일 추가.
3. **main.js:**
    - Teachable Machine 모델 로드 (`https://teachablemachine.withgoogle.com/models/mrrlxN-j5/`).
    - `runAnalysis` 함수를 수정하여 실제 모델의 `predict` 결과를 사용하도록 변경.
    - 파일 업로드 및 카메라 촬영 이미지 모두 모델에 전달하여 분석.
4. **Verification:** 브라우저 미리보기를 통한 실제 모델 작동 확인.
