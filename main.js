const URL = "https://teachablemachine.withgoogle.com/models/mrrlxN-j5/";
let model, maxPredictions;
let radarChart = null; // Chart.js 인스턴스 저장용

// Translation Data
const translations = {
  ko: {
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
    resultComment: "당신은 '{name}상'입니다!",
    unknown: "알 수 없는 동물상입니다.",
    alertModelLoading: "모델이 아직 로드되지 않았습니다. 잠시만 기다려 주세요.",
    alertError: "분석 중 오류가 발생했습니다.",
    alertImgOnly: "이미지 파일만 업로드할 수 있습니다.",
    alertCamera: "카메라를 시작할 수 없습니다: ",
    alertSaveError: "이미지를 저장하는 중 오류가 발생했습니다."
  },
  en: {
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
    chartLabels: ['Cuteness', 'Chic', 'Purity', 'Glamour', 'Friendliness'],
    celebTitle: " face celebrities",
    resultComment: "You look like a {name}!",
    unknown: "Unknown animal type.",
    alertModelLoading: "Model is not loaded yet. Please wait.",
    alertError: "An error occurred during analysis.",
    alertImgOnly: "Only image files are allowed.",
    alertCamera: "Cannot start camera: ",
    alertSaveError: "An error occurred while saving the image."
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
           // 이미 분석된 결과가 있다면 다시 분석을 돌리는 것보다는, 
           // 현재 구조상 runAnalysis를 호출하지 않고는 동적 텍스트를 바꾸기 어려우므로
           // 간단히 새로고침을 유도하거나, 변수에 저장된 결과로 다시 그리는게 좋음.
           // 여기서는 UX상 다시 분석하도록 트리거하는 것이 깔끔함 (이미지가 있으므로 빠름)
           runAnalysis(imagePreview);
      }
  });

  function updateLanguage(lang) {
      // 1. Static Text Update
      document.querySelectorAll('[data-i18n]').forEach(element => {
          const key = element.getAttribute('data-i18n');
          if (translations[lang][key]) {
              element.textContent = translations[lang][key];
          }
      });
      
      // 2. Placeholder Update
      document.getElementById('email').placeholder = translations[lang]['emailPlaceholder'];
      document.getElementById('message').placeholder = translations[lang]['messagePlaceholder'];

      // 3. Toggle Button Text
      langToggle.textContent = lang === 'ko' ? 'EN' : 'KO';
      
      // 4. HTML lang attribute
      document.documentElement.lang = lang;
  }

  // ... (다크모드 및 기존 로직 유지) ...

  // 다크 모드 초기 설정
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    updateThemeIcon(true);
  } else if (!currentTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    body.classList.add('dark-mode');
    updateThemeIcon(true);
  }

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcon(isDarkMode);
    if (radarChart) {
        updateChartTheme(isDarkMode);
    }
  });

  function updateThemeIcon(isDarkMode) {
    if (isDarkMode) {
      themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    } else {
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

  loadModel().catch(err => console.error("Failed to load model:", err));

  // 드래그 앤 드롭 및 파일 처리 로직 (기존과 동일)
  const uploadSection = document.querySelector('.upload-section');
  
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

  fileUpload.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

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

  capturePhotoBtn.addEventListener('click', () => {
    const context = captureCanvas.getContext('2d');
    captureCanvas.width = webcamVideo.videoWidth;
    captureCanvas.height = webcamVideo.videoHeight;
    context.drawImage(webcamVideo, 0, 0, captureCanvas.width, captureCanvas.height);
    
    const imageData = captureCanvas.toDataURL('image/png');
    
    imagePreview.onload = () => {
      runAnalysis(imagePreview);
    };
    
    showPreview(imageData);
    stopCamera();
    capturePhotoBtn.classList.add('hidden');
    startCameraBtn.classList.remove('hidden');
  });

  restartBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    imagePreview.src = '';
    imagePreview.classList.add('hidden');
    placeholder.classList.remove('hidden');
    fileUpload.value = '';
    resultImageContainer.innerHTML = ''; 
  });

  saveBtn.addEventListener('click', async () => {
    if (!shareCard) return;
    try {
      const isDarkMode = body.classList.contains('dark-mode');
      const backgroundColor = isDarkMode ? '#1e293b' : '#ffffff';
      const canvas = await html2canvas(shareCard, {
        scale: 2,
        backgroundColor: backgroundColor,
        useCORS: true
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
      const prediction = await model.predict(imageElement);
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

    const clonedImage = document.createElement('img');
    clonedImage.src = imageSrc;
    clonedImage.className = 'result-user-image';
    resultImageContainer.appendChild(clonedImage);
    
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
    
    // Dynamic Text based on Language
    const animalName = detail.name[currentLang] || topResult.name;
    const resultTitleText = translations[currentLang].resultComment.replace('{name}', animalName);

    const titleElement = shareCard.querySelector('h2');
    titleElement.innerHTML = `
      <div class="top-emoji">${detail.emoji}</div>
      <div>${resultTitleText}</div>
    `;

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

    // 레이더 차트
    const ctx = document.getElementById('radar-chart').getContext('2d');
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
                label: animalName,
                data: detail.stats,
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366f1',
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
                        display: false,
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    const descriptionBox = document.createElement('p');
    descriptionBox.className = 'animal-description';
    descriptionBox.textContent = detail.description[currentLang];
    resultChart.appendChild(descriptionBox);

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

      setTimeout(() => {
        item.querySelector('.progress-bar-fill').style.width = `${res.probability}%`;
      }, 100);
    });
  }
});