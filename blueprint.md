# Animal Face Type Test Blueprint

## Overview
이 애플리케이션은 사용자의 사진을 분석하여 어떤 동물상(강아지, 고양이, 여우, 토끼, 햄스터, 사슴, 곰)인지 알려주는 웹 서비스입니다.

## Features
- **사진 업로드:** 로컬 기기에서 사진 파일을 선택하여 업로드할 수 있습니다.
- **사진 촬영:** 웹캠을 사용하여 직접 사진을 촬영할 수 있습니다.
- **분류 결과 표시:** 각 동물상별 일치율을 프로그래스 바 형태로 시각화하여 보여줍니다.
- **반응형 디자인:** 모바일과 데스크톱 모두에서 최적화된 UI를 제공합니다.

## Technical Stack
- HTML5 (Web Components 사용 고려)
- CSS3 (Modern Baseline features: Variables, Flexbox, Grid)
- JavaScript (ES Modules, MediaDevices API)

## Implementation Plan
1. **index.html:** 기본 구조 및 업로드/카메라 버튼, 결과 영역 레이아웃 작성.
2. **style.css:** 현대적이고 깔끔한 디자인 적용 (Glassmorphism, Soft Shadows 등).
3. **main.js:**
    - 파일 선택 및 웹캠 스트림 처리.
    - 사진 캡처 및 미리보기 기능.
    - 분류 결과 시뮬레이션 로직 (실제 모델 API 연결 준비).
4. **Verification:** 브라우저 미리보기를 통한 UI 및 기능 확인.
