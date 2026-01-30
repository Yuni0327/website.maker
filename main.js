// Firebase 라이브러리 (CDN) - 모듈 방식
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, limit, serverTimestamp, deleteDoc, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ 중요: 여기에 여러분의 Firebase 프로젝트 설정을 붙여넣으세요!
// Firebase 콘솔 -> 프로젝트 설정 -> 일반 -> '내 앱' -> 'SDK 설정 및 구성' -> 'Config' 복사
const firebaseConfig = {
  apiKey: "AIzaSyC3JZSxZUq_iCZgMCf0XnFSVjonZqQogMo",
  authDomain: "animal-face-chat-9bce8.firebaseapp.com",
  projectId: "animal-face-chat-9bce8",
  storageBucket: "animal-face-chat-9bce8.firebasestorage.app",
  messagingSenderId: "797389459508",
  appId: "1:797389459508:web:8e327983193570de837a61",
  measurementId: "G-M8Z43V517V"
};

// Firebase 초기화 (설정이 올바르지 않으면 오류가 나므로 try-catch 감쌈)
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase initialized");
} catch (e) {
  console.log("Firebase config not set yet. Community features disabled.");
}

const URL = "https://teachablemachine.withgoogle.com/models/mrrlxN-j5/";
let model, maxPredictions;
let radarChart = null; // Chart.js 인스턴스 저장용

// Translation Data
const translations = {
  ko: {
    communityTitle: "동물농장 수다방",
    communityDesc: "결과를 자랑하고 다른 사람들과 이야기해보세요! (익명)",
    postBtn: "글 남기기",
    inputPlaceholder: "나의 동물상은? 자유롭게 이야기를 남겨보세요!",
    nickname: "닉네임",
    password: "비밀번호",
    reply: "답글",
    replyBtn: "답글 등록",
    replyPlaceholder: "답글을 남겨주세요",
    bystander: "구경꾼",
    title: "나의 동물상 찾기",
    subtitle: "인공지능이 분석하는 나의 동물상 테스트",
    uploadText: "사진을 업로드하거나 촬영하세요",
    uploadBtn: "파일 업로드",
    cameraBtn: "사진 촬영",
    captureBtn: "캡처하기",
    resultTitle: "분류 결과",
    saveBtn: "결과 이미지 저장",
    retryBtn: "다시하기",
    analyzing: "분석 중입니다...",
    contactTitle: "문의하기",
    contactDesc: "제휴 문의나 서비스에 대한 의견을 보내주세요.",
    emailLabel: "이메일",
    messageLabel: "내용",
    sendBtn: "보내기",
    emailPlaceholder: "답변 받을 이메일 주소",
    messagePlaceholder: "문의 내용을 자유롭게 적어주세요",
    chartLabels: ['귀여움', '세련미', '청순함', '화려함', '친근함'],
    celebTitle: "상 연예인",
    guideTitle: "동물상별 상세 가이드",
    guideSubtitle: "나의 동물상에 대해 더 자세히 알아보세요!",
    traitLabel: "대표적인 특징",
    styleLabel: "추천 스타일링",
    resultComment: "당신은 '{name}상'입니다!",
    unknown: "알 수 없는 동물상입니다.",
    alertModelLoading: "모델이 아직 로드되지 않았습니다. 잠시만 기다려 주세요.",
    alertError: "분석 중 오류가 발생했습니다.",
    alertImgOnly: "이미지 파일만 업로드할 수 있습니다.",
    alertCamera: "카메라를 시작할 수 없습니다: ",
    alertSaveError: "이미지를 저장하는 중 오류가 발생했습니다.",
    alertInputAll: "모든 항목을 입력해주세요.",
    alertPostSuccess: "글이 등록되었습니다! 🎉",
    alertReplySuccess: "답글이 등록되었습니다.",
    alertDeleteSuccess: "삭제되었습니다.",
    alertDeleteConfirm: "정말로 삭제하시겠습니까?",
    alertWrongPassword: "비밀번호가 일치하지 않습니다.",
    alertAlreadyLiked: "이미 공감하셨습니다! ❤️",
    promptPassword: "비밀번호를 입력하세요:"
  },
  en: {
    communityTitle: "Animal Farm Chat",
    communityDesc: "Show off your result and chat with others! (Anonymous)",
    postBtn: "Post",
    inputPlaceholder: "Share your animal type result!",
    nickname: "Nickname",
    password: "Pass",
    reply: "Reply",
    replyBtn: "Post Reply",
    replyPlaceholder: "Write a reply...",
    bystander: "Bystander",
    title: "Animal Face Test",
    subtitle: "AI-powered animal face type analysis",
    uploadText: "Upload or take a photo",
    uploadBtn: "Upload File",
    cameraBtn: "Take Photo",
    captureBtn: "Capture",
    resultTitle: "Analysis Result",
    saveBtn: "Save Result Image",
    retryBtn: "Try Again",
    analyzing: "Analyzing...",
    contactTitle: "Contact Us",
    contactDesc: "Send us your feedback or partnership inquiries.",
    emailLabel: "Email",
    messageLabel: "Message",
    sendBtn: "Send",
    emailPlaceholder: "Your email address",
    messagePlaceholder: "Write your message here",
    chartLabels: ['Cute', 'Chic', 'Pure', 'Glam', 'Friendly'],
    celebTitle: " face celebrities",
    guideTitle: "Animal Face Guide",
    guideSubtitle: "Learn more about each animal face type!",
    traitLabel: "Key Traits",
    styleLabel: "Styling Tips",
    resultComment: "You look like a {name}!",
    unknown: "Unknown animal type.",
    alertModelLoading: "Model is not loaded yet. Please wait.",
    alertError: "An error occurred during analysis.",
    alertImgOnly: "Only image files are allowed.",
    alertCamera: "Cannot start camera: ",
    alertSaveError: "An error occurred while saving the image.",
    alertInputAll: "Please fill in all fields.",
    alertPostSuccess: "Posted successfully! 🎉",
    alertReplySuccess: "Reply posted.",
    alertDeleteSuccess: "Deleted successfully.",
    alertDeleteConfirm: "Are you sure you want to delete this?",
    alertWrongPassword: "Incorrect password.",
    alertAlreadyLiked: "You already liked this! ❤️",
    promptPassword: "Enter your password:"
  }
};

let currentLang = 'ko'; // Default language

const animalDetails = {
  '강아지': {
    name: { ko: '강아지', en: 'Puppy' },
    emoji: '🐶',
    description: {
        ko: '사랑스럽고 부드러운 인상을 가진 당신은 보는 사람을 무장해제시키는 매력이 있습니다. 순둥순둥한 눈매와 따뜻한 분위기로 주변 사람들에게 인기가 많습니다.',
        en: 'You have a lovely and soft impression that disarms people. With innocent eyes and a warm atmosphere, you are popular with everyone around you.'
    },
    celebrities: ['송중기', '박보영', '강다니엘', '백현', '아이유'],
    stats: [95, 50, 70, 40, 100], 
    traits: {
      ko: '둥글둥글한 얼굴형과 처진 눈매가 특징입니다. 선하고 다정한 인상을 주며 주변 사람들에게 신뢰감을 주는 타입입니다.',
      en: 'Characterized by a rounded face and slightly drooping eyes. Gives a kind and friendly impression, earning trust from others.'
    },
    styling: {
      ko: '부드러운 니트나 캐주얼한 룩이 잘 어울립니다. 브라운 계열의 아이라이너로 순한 이미지를 강조해보세요.',
      en: 'Soft knits or casual looks suit you well. Use brown eyeliner to emphasize your gentle image.'
    },
    comments: {
      high: { ko: "인간 비타민 그 자체! 보기만 해도 기분 좋아지는 댕댕이상 🐶", en: "A human vitamin! You are a total Puppy face that makes people smile 🐶" },
      middle: { ko: "따뜻하고 선한 인상을 가진 강아지상이에요.", en: "You have a warm and kind Puppy face." },
      low: { ko: "강아지처럼 귀여운 느낌이 살짝 있네요.", en: "You have a hint of cute Puppy vibes." }
    }
  },
  '고양이': {
    name: { ko: '고양이', en: 'Cat' },
    emoji: '🐱',
    description: {
        ko: '세련되고 도시적인 분위기를 풍기는 당신은 시크하면서도 묘한 매력을 가졌습니다. 날렵한 눈매와 깔끔한 인상으로 한 번 보면 잊혀지지 않는 타입입니다.',
        en: 'You have a chic and urban vibe with a mysterious charm. With sharp eyes and a neat look, you are unforgettable once seen.'
    },
    celebrities: ['제니', '강동원', '한예슬', '시우민', '안소희'],
    stats: [60, 95, 50, 80, 40], 
    traits: {
      ko: '올라간 눈꼬리와 날카로운 콧대가 특징입니다. 도도하고 차가워 보이지만 동시에 신비로운 매력을 풍기는 타입입니다.',
      en: 'Features upturned eyes and a sharp nose. Appears chic and cold but exudes a mysterious charm.'
    },
    styling: {
      ko: '세련된 블랙 룩이나 스트릿 패션이 잘 어울립니다. 세미 스모키 메이크업으로 시크함을 더해보세요.',
      en: 'Sophisticated black looks or street fashion suit you. Add chicness with semi-smoky makeup.'
    },
    comments: {
      high: { ko: "도도하고 세련된 매력 폭발! 매혹적인 고양이상 😼", en: "Chic and sophisticated! A mesmerizing Cat face 😼" },
      middle: { ko: "시크한 도시 남녀 분위기의 고양이상이에요.", en: "You have a chic urban Cat vibe." },
      low: { ko: "고양이 같은 새침한 매력이 은근히 보이네요.", en: "A subtle hint of Cat-like charm is visible." }
    }
  },
  '여우': {
    name: { ko: '여우', en: 'Fox' },
    emoji: '🦊',
    description: {
        ko: '홀릴 듯한 매력적인 눈웃음과 화려한 이목구비를 가졌습니다. 사람을 끌어당기는 흡입력이 있으며, 어디서나 돋보이는 주인공 스타일입니다.',
        en: 'You have attractive smiling eyes and glamorous features. You have a magnetic charm that draws people in and stand out as a main character anywhere.'
    },
    celebrities: ['황민현', '예지', '지코', '아이엔', '선미'],
    stats: [50, 90, 30, 95, 60], 
    traits: {
      ko: '가늘고 긴 눈매와 화려한 이목구비가 특징입니다. 지적이고 영리해 보이는 인상을 주며 치명적인 매력을 가졌습니다.',
      en: 'Characterized by long, narrow eyes and glamorous features. Gives an intelligent and sharp impression with a fatal charm.'
    },
    styling: {
      ko: '화려한 액세서리나 포인트를 준 룩이 좋습니다. 캣츠아이 메이크업으로 눈매의 장점을 극대화해보세요.',
      en: 'Glamorous accessories or accented looks are great. Maximize your eye shape with cat-eye makeup.'
    },
    comments: {
      high: { ko: "숨만 쉬어도 플러팅? 사람을 홀리는 매력적인 여우상 🦊", en: "Just breathing is flirting? A captivating Fox face 🦊" },
      middle: { ko: "화려하고 센스 있는 분위기의 여우상!", en: "A Fox face with a glamorous and sensible vibe!" },
      low: { ko: "여우처럼 매혹적인 분위기가 살짝 풍기네요.", en: "There is a slight scent of alluring Fox vibes." }
    }
  },
  '토끼': {
    name: { ko: '토끼', en: 'Rabbit' },
    emoji: '🐰',
    description: {
        ko: '동그란 눈과 맑은 피부, 상큼한 분위기를 가진 당신은 과즙미가 터지는 인간 토끼입니다. 보호본능을 자극하며 누구에게나 사랑받는 귀염둥이입니다.',
        en: 'With round eyes and clear skin, you are a refreshing human Rabbit. You stimulate protective instincts and are a cutie loved by everyone.'
    },
    celebrities: ['나연', '정국', '수지', '도영', '장원영'],
    stats: [100, 40, 80, 50, 90], 
    traits: {
      ko: '앞니가 살짝 보이고 동그란 눈이 특징입니다. 상큼하고 발랄한 에너지를 뿜어내며 보는 이로 하여금 보호본능을 자극합니다.',
      en: 'Features slightly prominent front teeth and round eyes. Radiant with fresh energy, stimulating protective instincts in others.'
    },
    styling: {
      ko: '파스텔 톤의 밝은 옷이 잘 어울립니다. 핑크나 코랄 계열의 블러셔로 과즙미를 더해보세요.',
      en: 'Bright pastel-toned clothes suit you. Add a fruity look with pink or coral blushers.'
    },
    comments: {
      high: { ko: "상큼발랄 과즙미 팡팡! 인간 토끼 그 자체 🐰", en: "Fresh and fruity! You are a Rabbit itself 🐰" },
      middle: { ko: "귀엽고 순수한 매력의 토끼상이에요.", en: "You have a cute and pure Rabbit face." },
      low: { ko: "토끼 같은 귀여움이 얼굴에 묻어있네요.", en: "There's a touch of Rabbit-like cuteness on your face." }
    }
  },
  '사슴': {
    name: { ko: '사슴', en: 'Deer' },
    emoji: '🦌',
    description: {
        ko: '긴 목선과 맑고 깊은 눈망울을 가진 당신은 귀티가 흐르는 우아한 분위기의 소유자입니다. 차분하고 청초한 이미지로 신비로운 느낌을 줍니다.',
        en: 'With deep, clear eyes, you have an elegant and noble atmosphere. Your calm and pure image gives a mysterious feeling.'
    },
    celebrities: ['윤아', '차은우', '김진우', '미주', '최강창민'],
    stats: [60, 80, 100, 40, 70], 
    traits: {
      ko: '맑고 큰 눈망울과 가늘고 긴 목선이 특징입니다. 우아하고 기품 있는 분위기를 자아내며 정갈하고 깨끗한 느낌을 줍니다.',
      en: 'Characterized by clear, large eyes and a slender neck. Exudes an elegant and noble vibe with a neat and clean feel.'
    },
    styling: {
      ko: '깔끔한 셔츠나 우아한 원피스가 잘 어울립니다. 투명하고 깨끗한 피부 표현에 집중한 메이크업을 추천합니다.',
      en: 'Neat shirts or elegant dresses suit you. We recommend makeup that focuses on clear and transparent skin.'
    },
    comments: {
      high: { ko: "분위기 여신/남신 등극! 우아하고 청초한 사슴상 🦌", en: "Atmosphere Goddess/God! An elegant and pure Deer face 🦌" },
      middle: { ko: "맑고 깨끗한 분위기의 사슴상이에요.", en: "You have a clear and clean Deer face." },
      low: { ko: "사슴 같은 맑은 눈망울을 가지셨네요.", en: "You have clear Deer-like eyes." }
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const fileUpload = document.getElementById('file-upload');
  const startCameraBtn = document.getElementById('start-camera');
  const capturePhotoBtn = document.getElementById('capture-photo');
  const imagePreview = document.getElementById('image-preview');
  const webcamVideo = document.getElementById('webcam-video');
  const placeholder = document.getElementById('upload-placeholder');
  const resultSection = document.getElementById('result-section');
  const resultChart = document.getElementById('result-chart');
  const loading = document.getElementById('loading');
  const restartBtn = document.getElementById('restart-btn');
  const captureCanvas = document.getElementById('capture-canvas');
  const saveBtn = document.getElementById('save-btn');
  const shareCard = document.getElementById('share-card');
  const resultImageContainer = document.getElementById('result-image-container');
  const celebritySection = document.getElementById('celebrity-section');
  const themeToggle = document.getElementById('theme-toggle');
  const langToggle = document.getElementById('lang-toggle');
  const body = document.body;
  const resultComment = document.getElementById('result-comment');
  
  // Community Elements
  const commentInput = document.getElementById('comment-input');
  const nicknameInput = document.getElementById('nickname');
  const animalTypeSelect = document.getElementById('animal-type-select');
  const addCommentBtn = document.getElementById('add-comment-btn');
  const commentList = document.getElementById('comment-list');

  let stream = null;

  // 언어 설정 초기화
  const savedLang = localStorage.getItem('lang');
  if (savedLang) {
      currentLang = savedLang;
  } else {
      // 브라우저 언어 감지
      const browserLang = navigator.language || navigator.userLanguage;
      currentLang = browserLang.startsWith('ko') ? 'ko' : 'en';
  }
  updateLanguage(currentLang);

  // 언어 토글 버튼 이벤트
  langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'ko' ? 'en' : 'ko';
      localStorage.setItem('lang', currentLang);
      updateLanguage(currentLang);
      
      // 결과 화면이 떠있다면 텍스트 업데이트를 위해 UI 갱신 (이미지 재분석 없이 텍스트만)
      if (!resultSection.classList.contains('hidden') && imagePreview.src) {
           runAnalysis(imagePreview);
      }
  });

  let currentGuideIndex = 0;
  const animalKeys = Object.keys(animalDetails);

  function renderAnimalGuide(lang) {
      const guideStack = document.getElementById('guide-stack');
      const stackDots = document.getElementById('stack-dots');
      if (!guideStack || !stackDots) return;
      
      guideStack.innerHTML = '';
      stackDots.innerHTML = '';
      
      animalKeys.forEach((key, index) => {
          const detail = animalDetails[key];
          
          // 카드 생성
          const card = document.createElement('div');
          card.className = `guide-card`;
          card.dataset.index = index;
          card.innerHTML = `
            <div class="guide-card-header">
                <span class="guide-emoji">${detail.emoji}</span>
                <h3 class="guide-name">${detail.name[lang]}</h3>
            </div>
            <div class="guide-body">
                <div class="guide-item">
                    <span class="guide-label">${translations[lang].traitLabel}</span>
                    <p>${detail.traits[lang]}</p>
                </div>
                <div class="guide-item">
                    <span class="guide-label">${translations[lang].styleLabel}</span>
                    <p>${detail.styling[lang]}</p>
                </div>
            </div>
          `;
          
          // 클릭 시 다음 카드로
          card.addEventListener('click', () => {
              if (index === currentGuideIndex) nextGuide();
          });
          
          guideStack.appendChild(card);
          
          // 도트 생성
          const dot = document.createElement('div');
          dot.className = `dot ${index === currentGuideIndex ? 'active' : ''}`;
          stackDots.appendChild(dot);
      });
      
      updateStackUI();
  }

  function updateStackUI() {
      const cards = document.querySelectorAll('.guide-card');
      const dots = document.querySelectorAll('.dot');
      const total = animalKeys.length;

      cards.forEach((card, i) => {
          const index = parseInt(card.dataset.index);
          // 현재 인덱스로부터의 상대적 위치 계산 (순환형)
          let relativeIndex = (index - currentGuideIndex + total) % total;
          
          card.classList.remove('stack-1', 'stack-2', 'stack-3', 'stack-hidden', 'pass-back');
          
          if (relativeIndex === 0) {
              card.classList.add('stack-1');
          } else if (relativeIndex === 1) {
              card.classList.add('stack-2');
          } else if (relativeIndex === 2) {
              card.classList.add('stack-3');
          } else {
              card.classList.add('stack-hidden');
          }
      });

      dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentGuideIndex);
      });
  }

  function nextGuide() {
      const currentCard = document.querySelector(`.guide-card[data-index="${currentGuideIndex}"]`);
      currentCard.classList.add('pass-back');
      
      setTimeout(() => {
          currentGuideIndex = (currentGuideIndex + 1) % animalKeys.length;
          updateStackUI();
      }, 450); // 애니메이션 시간(500ms)보다 약간 짧게
  }

  function prevGuide() {
      currentGuideIndex = (currentGuideIndex - 1 + animalKeys.length) % animalKeys.length;
      updateStackUI();
  }

  // 가이드 컨트롤 이벤트 리스너 (한 번만 등록되도록 renderAnimalGuide 외부 혹은 초기화 시점에 배치)
  document.getElementById('next-guide')?.addEventListener('click', nextGuide);
  document.getElementById('prev-guide')?.addEventListener('click', prevGuide);

  function updateLanguage(lang) {

  // 다크 모드 초기 설정
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    updateThemeIcon(true);
  } else if (!currentTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // 시스템 설정이 다크 모드이고 사용자가 설정한 값이 없을 때
    body.classList.add('dark-mode');
    updateThemeIcon(true);
  }

  // 다크 모드 토글
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcon(isDarkMode);
    
    // 차트 색상 업데이트를 위해 다시 그리기 (결과가 나와있는 상태라면)
    if (radarChart) {
        updateChartTheme(isDarkMode);
    }
  });

  function updateThemeIcon(isDarkMode) {
    if (isDarkMode) {
      // Sun Icon
      themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    } else {
      // Moon Icon
      themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }
  }
  
  function updateChartTheme(isDarkMode) {
      if (!radarChart) return;
      
      const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
      const gridColor = isDarkMode ? '#475569' : '#e2e8f0';
      
      radarChart.options.scales.r.pointLabels.color = textColor;
      radarChart.options.scales.r.grid.color = gridColor;
      radarChart.options.scales.r.angleLines.color = gridColor;
      radarChart.update();
  }

  // Teachable Machine 모델 로드
  async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("Model loaded successfully");
  }

  // 초기 모델 로드 시작
  loadModel().catch(err => console.error("Failed to load model:", err));

  // 드래그 앤 드롭 처리
  const uploadSection = document.querySelector('.upload-section');
  
  // 기본 드래그 동작 방지 및 스타일 적용
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadSection.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadSection.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadSection.addEventListener(eventName, unhighlight, false);
  });

  function highlight(e) {
    uploadSection.classList.add('highlight');
  }

  function unhighlight(e) {
    uploadSection.classList.remove('highlight');
  }

  // 파일 드롭 처리
  uploadSection.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }

  function handleFiles(files) {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        // 이미지가 실제로 로드된 후에 분석 실행
        imagePreview.onload = () => {
          runAnalysis(imagePreview);
        };
        showPreview(event.target.result);
        stopCamera();
      };
      
      reader.readAsDataURL(file);
    } else if (file) {
      alert(translations[currentLang].alertImgOnly);
    }
  }

  // 파일 업로드 버튼 처리 (기존 로직 수정)
  fileUpload.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  // 카메라 시작
  startCameraBtn.addEventListener('click', async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      webcamVideo.srcObject = stream;
      webcamVideo.classList.remove('hidden');
      imagePreview.classList.add('hidden');
      placeholder.classList.add('hidden');
      startCameraBtn.classList.add('hidden');
      capturePhotoBtn.classList.remove('hidden');
    } catch (err) {
      alert(translations[currentLang].alertCamera + err.message);
    }
  });

  // 사진 캡처
  capturePhotoBtn.addEventListener('click', () => {
    const context = captureCanvas.getContext('2d');
    captureCanvas.width = webcamVideo.videoWidth;
    captureCanvas.height = webcamVideo.videoHeight;
    context.drawImage(webcamVideo, 0, 0, captureCanvas.width, captureCanvas.height);
    
    const imageData = captureCanvas.toDataURL('image/png');
    
    // 이미지가 로드된 후 분석 실행
    imagePreview.onload = () => {
      runAnalysis(imagePreview);
    };
    
    showPreview(imageData);
    stopCamera();
    capturePhotoBtn.classList.add('hidden');
    startCameraBtn.classList.remove('hidden');
  });

  // 다시하기
  restartBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    imagePreview.src = '';
    imagePreview.classList.add('hidden');
    placeholder.classList.remove('hidden');
    fileUpload.value = '';
    resultImageContainer.innerHTML = ''; 
    // 차트는 displayResults에서 새로 생성할 때 기존 것을 파괴하므로 여기선 굳이 안 해도 됨.
  });

  // 결과 이미지 저장
  saveBtn.addEventListener('click', async () => {
    if (!shareCard) return;
    
    try {
      // 다크 모드 여부 확인
      const isDarkMode = body.classList.contains('dark-mode');
      const backgroundColor = isDarkMode ? '#1e293b' : '#ffffff';

      // 캡처 전 스타일 조정 (필요 시)
      const canvas = await html2canvas(shareCard, {
        scale: 2, // 고해상도 캡처
        backgroundColor: backgroundColor,
        useCORS: true // 크로스 오리진 이미지 허용
      });
      
      const link = document.createElement('a');
      link.download = 'animal-face-result.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('이미지 저장 실패:', err);
      alert(translations[currentLang].alertSaveError);
    }
  });

  function showPreview(src) {
    imagePreview.src = src;
    imagePreview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    webcamVideo.classList.add('hidden');
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    webcamVideo.classList.add('hidden');
  }

  async function runAnalysis(imageElement) {
    if (!model) {
      alert(translations[currentLang].alertModelLoading);
      return;
    }

    loading.classList.remove('hidden');
    resultSection.classList.add('hidden');

    try {
      // Teachable Machine 모델로 예측 실행
      const prediction = await model.predict(imageElement);
      
      // 결과 가공 및 정렬 (확률 높은 순)
      const results = prediction
        .map(p => ({
          name: p.className,
          probability: p.probability * 100
        }))
        .sort((a, b) => b.probability - a.probability);

      displayResults(results, imageElement.src);
    } catch (err) {
      console.error("Prediction error:", err);
      alert(translations[currentLang].alertError);
    } finally {
      loading.classList.add('hidden');
      resultSection.classList.remove('hidden');
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function displayResults(results, imageSrc) {
    resultChart.innerHTML = '';
    celebritySection.innerHTML = '';
    resultImageContainer.innerHTML = '';
    resultComment.textContent = '';

    // 1. 사용자 이미지 복제하여 결과 카드에 추가
    const clonedImage = document.createElement('img');
    clonedImage.src = imageSrc;
    clonedImage.className = 'result-user-image';
    resultImageContainer.appendChild(clonedImage);
    
    // 가장 높은 확률의 동물 정보 가져오기
    const topResult = results[0];
    const detail = animalDetails[topResult.name] || { 
      name: { ko: topResult.name, en: 'Unknown' },
      emoji: '❓', 
      description: { ko: '알 수 없는 동물상입니다.', en: 'Unknown animal type.' }, 
      celebrities: [],
      stats: [50, 50, 50, 50, 50],
      comments: { 
          high: { ko: '', en: '' }, 
          middle: { ko: '', en: '' }, 
          low: { ko: '', en: '' } 
      }
    };
    
    // 분석 완료되면 해당 동물 이모지로 선택값 변경
    if (detail.emoji) {
        animalTypeSelect.value = detail.emoji;
        // 커뮤니티 섹션으로 이동할 때 바로 글을 쓰고 싶게끔 유도
    }
    
    const titleElement = shareCard.querySelector('h2');
    
    // Dynamic Text based on Language
    const animalName = detail.name[currentLang] || topResult.name;
    const resultTitleText = translations[currentLang].resultComment.replace('{name}', animalName);

    titleElement.innerHTML = `
      <div class="top-emoji">${detail.emoji}</div>
      <div>${resultTitleText}</div>
    `;

    // 설명 추가
    const descriptionBox = document.createElement('p');
    descriptionBox.className = 'animal-description';
    descriptionBox.textContent = detail.description[currentLang];
    resultChart.appendChild(descriptionBox);
    
    // 한줄 평
    let comment = "";
    if (topResult.probability >= 90) {
      comment = detail.comments.high[currentLang];
    } else if (topResult.probability >= 50) {
      comment = detail.comments.middle[currentLang];
    } else {
      comment = detail.comments.low[currentLang];
    }
    resultComment.textContent = comment;

    // 연예인 정보 추가
    if (detail.celebrities && detail.celebrities.length > 0) {
      const celebTitle = document.createElement('h3');
      celebTitle.textContent = animalName + translations[currentLang].celebTitle;
      celebTitle.className = 'celeb-title';
      celebritySection.appendChild(celebTitle);

      const celebList = document.createElement('div');
      celebList.className = 'celeb-list';
      
      detail.celebrities.forEach(celeb => {
        const chip = document.createElement('span');
        chip.className = 'celeb-chip';
        chip.textContent = celeb;
        celebList.appendChild(chip);
      });
      celebritySection.appendChild(celebList);
    }

    // 3. 레이더 차트 그리기
    const ctx = document.getElementById('radar-chart').getContext('2d');
    
    // 기존 차트가 있다면 파괴 (메모리 누수 및 겹침 방지)
    if (radarChart) {
        radarChart.destroy();
    }
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
    const gridColor = isDarkMode ? '#475569' : '#e2e8f0';

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: translations[currentLang].chartLabels,
            datasets: [{
                label: animalName, // Dynamic label
                data: detail.stats,
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.2)', // primary color with opacity
                borderColor: '#6366f1', // primary color
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#6366f1'
            }]
        },
        options: {
            elements: {
                line: { borderWidth: 3 }
            },
            scales: {
                r: {
                    angleLines: { color: gridColor },
                    grid: { color: gridColor },
                    pointLabels: {
                        color: textColor,
                        font: { size: 12, weight: '700', family: "'Noto Sans KR', sans-serif" }
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        display: false, // 숫자 라벨 숨김 (깔끔하게)
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: { display: false } // 범례 숨김
            }
        }
    });

    results.forEach(res => {
        const itemDetail = animalDetails[res.name];
        const itemName = itemDetail ? itemDetail.name[currentLang] : res.name;

      const item = document.createElement('div');
      item.className = 'result-item';
      item.innerHTML = `
        <div class="label-group">
          <span>${itemName}</span>
          <span>${res.probability.toFixed(1)}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: 0%"></div>
        </div>
      `;
      resultChart.appendChild(item);

      // 애니메이션 효과
      setTimeout(() => {
        item.querySelector('.progress-bar-fill').style.width = `${res.probability}%`;
      }, 100);
    });
  }
  
  // --- Community Logic (Firestore) ---
  const passwordInput = document.getElementById('password');

  // 1. 실시간 댓글 읽기 (Listener)
  if (db) {
    const q = query(collection(db, "guestbook"), orderBy("timestamp", "desc"), limit(100));
    
    onSnapshot(q, (snapshot) => {
      commentList.innerHTML = '';
      const allDocs = [];
      snapshot.forEach(doc => allDocs.push({ id: doc.id, ...doc.data() }));

      // 원문 댓글과 답글 분리
      const mainComments = allDocs.filter(d => !d.parentId);
      const replies = allDocs.filter(d => d.parentId);

      mainComments.forEach((data) => {
        const docId = data.id;
        const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : '';
        const likes = data.likes || 0;
        const isLiked = localStorage.getItem(`liked_${docId}`) === 'true';
        
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item-container';
        commentItem.innerHTML = `
          <div class="comment-item" id="comment-${docId}">
            <div class="comment-header">
              <div class="comment-info">
                <span class="comment-author">${data.animal} ${data.nickname}</span>
                <span class="comment-date">${date}</span>
              </div>
              <div class="comment-actions">
                <button class="reply-toggle-btn" data-id="${docId}">${translations[currentLang].reply}</button>
                <button class="comment-delete-btn" data-id="${docId}">×</button>
              </div>
            </div>
            <p class="comment-text">${data.message}</p>
            <div class="comment-footer">
              <button class="like-btn ${isLiked ? 'active' : ''}" data-id="${docId}">
                <span class="heart-icon">${isLiked ? '❤️' : '🤍'}</span>
                <span class="like-count">${likes}</span>
              </button>
            </div>
            <div class="reply-form hidden" id="reply-form-${docId}">
              <div class="input-row">
                <input type="text" placeholder="${translations[currentLang].nickname}" class="reply-nickname" maxlength="10">
                <input type="password" placeholder="${translations[currentLang].password}" class="reply-password" maxlength="4">
              </div>
              <textarea placeholder="${translations[currentLang].replyPlaceholder}" class="reply-input" maxlength="100"></textarea>
              <button class="btn primary full-width reply-submit-btn" data-id="${docId}">${translations[currentLang].replyBtn}</button>
            </div>
          </div>
          <div class="replies-container" id="replies-${docId}"></div>
        `;

        // 좋아요 이벤트 (메인 댓글)
        commentItem.querySelector('.like-btn').addEventListener('click', (e) => handleLike(docId, e.currentTarget));

        // 해당 댓글의 답글들 필터링하여 추가
        const currentReplies = replies.filter(r => r.parentId === docId).sort((a,b) => a.timestamp - b.timestamp);
        const repliesContainer = commentItem.querySelector('.replies-container');
        
        currentReplies.forEach(reply => {
          const rDate = reply.timestamp ? new Date(reply.timestamp.toDate()).toLocaleDateString() : '';
          const rLikes = reply.likes || 0;
          const rIsLiked = localStorage.getItem(`liked_${reply.id}`) === 'true';

          const replyEl = document.createElement('div');
          replyEl.className = 'reply-item';
          replyEl.innerHTML = `
            <div class="comment-header">
              <div class="comment-info">
                <span class="comment-author">↳ ${reply.animal} ${reply.nickname}</span>
                <span class="comment-date">${rDate}</span>
              </div>
              <button class="comment-delete-btn small" data-id="${reply.id}">×</button>
            </div>
            <p class="comment-text">${reply.message}</p>
            <div class="comment-footer">
              <button class="like-btn small ${rIsLiked ? 'active' : ''}" data-id="${reply.id}">
                <span class="heart-icon">${rIsLiked ? '❤️' : '🤍'}</span>
                <span class="like-count">${rLikes}</span>
              </button>
            </div>
          `;
          
          // 좋아요 이벤트 (답글)
          replyEl.querySelector('.like-btn').addEventListener('click', (e) => handleLike(reply.id, e.currentTarget));
          
          // 답글 삭제 이벤트
          replyEl.querySelector('.comment-delete-btn').addEventListener('click', () => deleteComment(reply.id, reply.password));
          repliesContainer.appendChild(replyEl);
        });

        // 답글 창 토글
        commentItem.querySelector('.reply-toggle-btn').addEventListener('click', () => {
          const form = document.getElementById(`reply-form-${docId}`);
          form.classList.toggle('hidden');
        });

        // 답글 등록 이벤트
        commentItem.querySelector('.reply-submit-btn').addEventListener('click', async (e) => {
          const pid = e.target.dataset.id;
          const rNickname = commentItem.querySelector('.reply-nickname').value.trim();
          const rPassword = commentItem.querySelector('.reply-password').value.trim();
          const rMessage = commentItem.querySelector('.reply-input').value.trim();
          
          if (!rNickname || !rMessage || !rPassword) {
            alert("모든 항목을 입력해주세요.");
            return;
          }

          try {
            await addDoc(collection(db, "guestbook"), {
              nickname: rNickname,
              message: rMessage,
              animal: animalTypeSelect.value, // 현재 선택된 동물 혹은 기본값
              password: rPassword,
              parentId: pid,
              timestamp: serverTimestamp()
            });
            alert("답글이 등록되었습니다.");
          } catch (err) {
            console.error(err);
          }
        });

        // 원문 삭제 이벤트
        commentItem.querySelector('.comment-delete-btn').addEventListener('click', () => deleteComment(docId, data.password));

        commentList.appendChild(commentItem);
      });
    });
  }

  async function handleLike(docId, btnElement) {
    const isLiked = localStorage.getItem(`liked_${docId}`) === 'true';
    
    // 이미 눌렀다면 취소는 일단 막거나, 원하신다면 -1 로직을 넣을 수 있습니다.
    // 여기서는 간단하게 한 번만 누를 수 있게 구현합니다.
    if (isLiked) {
        alert("이미 공감하셨습니다! ❤️");
        return;
    }

    try {
      // UI 즉시 반영 (낙관적 업데이트)
      const countEl = btnElement.querySelector('.like-count');
      const heartEl = btnElement.querySelector('.heart-icon');
      countEl.textContent = parseInt(countEl.textContent) + 1;
      heartEl.textContent = '❤️';
      btnElement.classList.add('active');
      localStorage.setItem(`liked_${docId}`, 'true');

      // Firestore 업데이트
      const docRef = doc(db, "guestbook", docId);
      await updateDoc(docRef, {
        likes: increment(1)
      });
    } catch (e) {
      console.error("Like update failed:", e);
    }
  }

  async function deleteComment(docId, correctPassword) {
    const inputPassword = prompt("비밀번호를 입력하세요:");
    if (!inputPassword) return;

    if (inputPassword === correctPassword) {
      if (confirm("정말로 삭제하시겠습니까?")) {
        try {
          await deleteDoc(doc(db, "guestbook", docId));
          alert("삭제되었습니다.");
        } catch (e) {
          alert("삭제 중 오류가 발생했습니다.");
        }
      }
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  }

  // 2. 댓글 쓰기
  addCommentBtn.addEventListener('click', async () => {
    if (!db) {
        alert("데이터베이스가 연결되지 않았습니다.");
        return;
    }

    const nickname = nicknameInput.value.trim();
    const message = commentInput.value.trim();
    const animal = animalTypeSelect.value;
    const password = passwordInput.value.trim();

    if (!nickname || !message || !password) {
      alert("닉네임, 내용, 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // Firestore 'guestbook' 컬렉션에 데이터 추가
      await addDoc(collection(db, "guestbook"), {
        nickname: nickname,
        message: message,
        animal: animal,
        password: password, // 비밀번호 저장
        timestamp: serverTimestamp() // 서버 시간 자동 기록
      });
      
      // 입력창 초기화
      commentInput.value = '';
      passwordInput.value = ''; // 비밀번호 창도 비움
      // 닉네임은 보통 유지하고 싶어 하므로 놔둠
      alert("글이 등록되었습니다! 🎉");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("글 등록 중 오류가 발생했습니다.");
    }
  });

});