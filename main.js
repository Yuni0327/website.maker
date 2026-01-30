const URL = "https://teachablemachine.withgoogle.com/models/mrrlxN-j5/";
let model, maxPredictions;
let radarChart = null; // Chart.js 인스턴스 저장용

const animalDetails = {
  '강아지': {
    emoji: '🐶',
    description: '사랑스럽고 부드러운 인상을 가진 당신은 보는 사람을 무장해제시키는 매력이 있습니다. 순둥순둥한 눈매와 따뜻한 분위기로 주변 사람들에게 인기가 많습니다.',
    celebrities: ['송중기', '박보영', '강다니엘', '백현', '아이유'],
    stats: [95, 50, 70, 40, 100], // 귀여움, 세련미, 청순함, 화려함, 친근함
    comments: {
      high: "인간 비타민 그 자체! 보기만 해도 기분 좋아지는 댕댕이상 🐶",
      middle: "따뜻하고 선한 인상을 가진 강아지상이에요.",
      low: "강아지처럼 귀여운 느낌이 살짝 있네요."
    }
  },
  '고양이': {
    emoji: '🐱',
    description: '세련되고 도시적인 분위기를 풍기는 당신은 시크하면서도 묘한 매력을 가졌습니다. 날렵한 눈매와 깔끔한 인상으로 한 번 보면 잊혀지지 않는 타입입니다.',
    celebrities: ['제니', '강동원', '한예슬', '시우민', '안소희'],
    stats: [60, 95, 50, 80, 40], // 귀여움, 세련미, 청순함, 화려함, 친근함
    comments: {
      high: "도도하고 세련된 매력 폭발! 매혹적인 고양이상 😼",
      middle: "시크한 도시 남녀 분위기의 고양이상이에요.",
      low: "고양이 같은 새침한 매력이 은근히 보이네요."
    }
  },
  '여우': {
    emoji: '🦊',
    description: '홀릴 듯한 매력적인 눈웃음과 화려한 이목구비를 가졌습니다. 사람을 끌어당기는 흡입력이 있으며, 어디서나 돋보이는 주인공 스타일입니다.',
    celebrities: ['황민현', '예지', '지코', '아이엔', '선미'],
    stats: [50, 90, 30, 95, 60], // 귀여움, 세련미, 청순함, 화려함, 친근함
    comments: {
      high: "숨만 쉬어도 플러팅? 사람을 홀리는 매력적인 여우상 🦊",
      middle: "화려하고 센스 있는 분위기의 여우상!",
      low: "여우처럼 매혹적인 분위기가 살짝 풍기네요."
    }
  },
  '토끼': {
    emoji: '🐰',
    description: '동그란 눈과 맑은 피부, 상큼한 분위기를 가진 당신은 과즙미가 터지는 인간 토끼입니다. 보호본능을 자극하며 누구에게나 사랑받는 귀염둥이입니다.',
    celebrities: ['나연', '정국', '수지', '도영', '장원영'],
    stats: [100, 40, 80, 50, 90], // 귀여움, 세련미, 청순함, 화려함, 친근함
    comments: {
      high: "상큼발랄 과즙미 팡팡! 인간 토끼 그 자체 🐰",
      middle: "귀엽고 순수한 매력의 토끼상이에요.",
      low: "토끼 같은 귀여움이 얼굴에 묻어있네요."
    }
  },
  '사슴': {
    emoji: '🦌',
    description: '긴 목선과 맑고 깊은 눈망울을 가진 당신은 귀티가 흐르는 우아한 분위기의 소유자입니다. 차분하고 청초한 이미지로 신비로운 느낌을 줍니다.',
    celebrities: ['윤아', '차은우', '김진우', '미주', '최강창민'],
    stats: [60, 80, 100, 40, 70], // 귀여움, 세련미, 청순함, 화려함, 친근함
    comments: {
      high: "분위기 여신/남신 등극! 우아하고 청초한 사슴상 🦌",
      middle: "맑고 깨끗한 분위기의 사슴상이에요.",
      low: "사슴 같은 맑은 눈망울을 가지셨네요."
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
  const body = document.body;
  const resultComment = document.getElementById('result-comment');

  let stream = null;

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
      alert('이미지 파일만 업로드할 수 있습니다.');
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
      alert('카메라를 시작할 수 없습니다: ' + err.message);
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
      alert('이미지를 저장하는 중 오류가 발생했습니다.');
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
      alert("모델이 아직 로드되지 않았습니다. 잠시만 기다려 주세요.");
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
      alert("분석 중 오류가 발생했습니다.");
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
      emoji: '❓', 
      description: '알 수 없는 동물상입니다.', 
      celebrities: [],
      stats: [50, 50, 50, 50, 50],
      comments: { high: '', middle: '', low: '' }
    };
    
    const titleElement = shareCard.querySelector('h2');
    titleElement.innerHTML = `
      <div class="top-emoji">${detail.emoji}</div>
      <div>당신은 '${topResult.name}상'입니다!</div>
    `;

    // 2. 재치 있는 한줄 평 표시
    let comment = "";
    if (topResult.probability >= 90) {
      comment = detail.comments.high;
    } else if (topResult.probability >= 50) {
      comment = detail.comments.middle;
    } else {
      comment = detail.comments.low;
    }
    resultComment.textContent = comment;

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
            labels: ['귀여움', '세련미', '청순함', '화려함', '친근함'],
            datasets: [{
                label: `${topResult.name} 매력 분석`,
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

    // 설명 추가
    const descriptionBox = document.createElement('p');
    descriptionBox.className = 'animal-description';
    descriptionBox.textContent = detail.description;
    resultChart.appendChild(descriptionBox);

    // 연예인 정보 추가
    if (detail.celebrities && detail.celebrities.length > 0) {
      const celebTitle = document.createElement('h3');
      celebTitle.textContent = `${topResult.name}상 연예인`;
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

    // 나머지 확률 막대 그래프
    results.forEach(res => {
      const item = document.createElement('div');
      item.className = 'result-item';
      item.innerHTML = `
        <div class="label-group">
          <span>${res.name}</span>
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
});