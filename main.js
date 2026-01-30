const URL = "https://teachablemachine.withgoogle.com/models/mrrlxN-j5/";
let model, maxPredictions;
let radarChart = null; // Chart.js 인스턴스 저장용

const animalDetails = {
  '강아지': {
    emoji: '🐶',
    description: '다정다감하고 사교적인 성격을 가진 당신은 주변 사람들에게 에너지를 주는 매력적인 사람입니다. 충성심이 강하며 밝은 미소가 사람들을 편안하게 해줍니다.',
    celebrities: ['송중기', '박보영', '강다니엘', '백현', '아이유'],
    stats: [95, 90, 100, 95, 60], // 애교, 활동성, 충성심, 친화력, 눈치
    comments: {
      high: "이 정도면 전생에 진짜 댕댕이 아니었나요? 🐶 꼬리가 보일 것 같아요!",
      middle: "빼박 강아지상! 멍멍 해보세요.",
      low: "강아지 느낌이 살짝 묻어있네요."
    }
  },
  '고양이': {
    emoji: '🐱',
    description: '도도하고 신비로운 분위기를 가진 당신은 처음엔 차가워 보일 수 있지만, 알면 알수록 깊은 매력을 가진 사람입니다. 깔끔하고 독립적인 성향이 돋보입니다.',
    celebrities: ['제니', '강동원', '한예슬', '시우민', '안소희'],
    stats: [50, 40, 60, 30, 95], // 애교, 활동성, 충성심, 친화력, 눈치 (고양이는 시크함이 매력이라 애교/친화력은 낮게 설정)
    comments: {
      high: "츄르를 바치고 싶어지는 완벽한 고양이상! 😼",
      middle: "시크한 매력이 돋보이는 냥이 스타일.",
      low: "고양이 같은 새침함이 조금 보이네요."
    }
  },
  '여우': {
    emoji: '🦊',
    description: '지적이고 눈치가 빠른 당신은 상황 판단력이 뛰어나며 매혹적인 분위기를 풍깁니다. 영리하고 세련된 매력으로 사람들의 시선을 사로잡는 능력이 있습니다.',
    celebrities: ['황민현', '예지', '지코', '아이엔', '선미'],
    stats: [70, 70, 50, 85, 100], 
    comments: {
      high: "홀릴 것 같은 매력! 사람을 끌어당기는 여우상 그 자체 🦊",
      middle: "눈치가 빠르고 센스 넘치는 여우상!",
      low: "여우 같은 매력이 은근히 풍기네요."
    }
  },
  '토끼': {
    emoji: '🐰',
    description: '귀엽고 사랑스러운 외모와 발랄한 에너지를 가진 당신은 존재만으로도 주변을 환하게 밝힙니다. 호기심이 많고 다정하여 누구에게나 사랑받는 타입입니다.',
    celebrities: ['나연', '정국', '수지', '도영', '장원영'],
    stats: [90, 85, 70, 90, 50], 
    comments: {
      high: "인간 당근 등장! 🥕 너무 귀여워서 깨물어주고 싶어요.",
      middle: "발랄하고 상큼한 토끼상!",
      low: "토끼 같은 귀여움이 살짝 보이네요."
    }
  },
  '사슴': {
    emoji: '🦌',
    description: '맑고 깊은 눈망울을 가진 당신은 우아하고 고결한 분위기를 풍깁니다. 평화로운 성격과 섬세한 감수성을 가지고 있어 주변 사람들에게 힐링을 주는 존재입니다.',
    celebrities: ['윤아', '차은우', '김진우', '미주', '최강창민'],
    stats: [60, 50, 80, 75, 80], 
    comments: {
      high: "숲속에서 방금 나오셨나요? 신비로운 사슴상 🦌",
      middle: "우아하고 차분한 분위기의 사슴상.",
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
  // ... (기존 코드 유지)

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

  // ... (드래그 앤 드롭 및 카메라 로직 유지)

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
        showPreview(event.target.result);
        stopCamera();
        runAnalysis(imagePreview);
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
    showPreview(imageData);
    stopCamera();
    capturePhotoBtn.classList.add('hidden');
    startCameraBtn.classList.remove('hidden');
    
    // 캡처된 이미지가 담긴 imagePreview 엘리먼트로 분석
    setTimeout(() => runAnalysis(imagePreview), 100);
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

    // 1. 사용자 이미지 복제
    const clonedImage = document.createElement('img');
    clonedImage.src = imageSrc;
    clonedImage.className = 'result-user-image';
    resultImageContainer.appendChild(clonedImage);
    
    // 가장 높은 확률의 동물 정보
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
            labels: ['애교', '활동성', '충성심', '친화력', '눈치'],
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

      setTimeout(() => {
        item.querySelector('.progress-bar-fill').style.width = `${res.probability}%`;
      }, 100);
    });
  }
});
// Triggering Cloudflare rebuild - 2026-01-29