const URL = "https://teachablemachine.withgoogle.com/models/mrrlxN-j5/";
let model, maxPredictions;

const animalDetails = {
  '강아지': {
    emoji: '🐶',
    description: '다정다감하고 사교적인 성격을 가진 당신은 주변 사람들에게 에너지를 주는 매력적인 사람입니다. 충성심이 강하며 밝은 미소가 사람들을 편안하게 해줍니다.',
    celebrities: ['송중기', '박보영', '강다니엘', '백현', '아이유']
  },
  '고양이': {
    emoji: '🐱',
    description: '도도하고 신비로운 분위기를 가진 당신은 처음엔 차가워 보일 수 있지만, 알면 알수록 깊은 매력을 가진 사람입니다. 깔끔하고 독립적인 성향이 돋보입니다.',
    celebrities: ['제니', '강동원', '한예슬', '시우민', '안소희']
  },
  '여우': {
    emoji: '🦊',
    description: '지적이고 눈치가 빠른 당신은 상황 판단력이 뛰어나며 매혹적인 분위기를 풍깁니다. 영리하고 세련된 매력으로 사람들의 시선을 사로잡는 능력이 있습니다.',
    celebrities: ['황민현', '예지', '지코', '아이엔', '선미']
  },
  '토끼': {
    emoji: '🐰',
    description: '귀엽고 사랑스러운 외모와 발랄한 에너지를 가진 당신은 존재만으로도 주변을 환하게 밝힙니다. 호기심이 많고 다정하여 누구에게나 사랑받는 타입입니다.',
    celebrities: ['나연', '정국', '수지', '도영', '장원영']
  },
  '햄스터': {
    emoji: '🐹',
    description: '작고 소중한 느낌의 당신은 보호 본능을 자극하는 귀여운 매력을 가졌습니다. 부지런하고 활동적이며, 소소한 행복을 소중히 여길 줄 아는 따뜻한 마음을 가졌습니다.',
    celebrities: ['호시', '츄', '문별', '진', '승연']
  },
  '사슴': {
    emoji: '🦌',
    description: '맑고 깊은 눈망울을 가진 당신은 우아하고 고결한 분위기를 풍깁니다. 평화로운 성격과 섬세한 감수성을 가지고 있어 주변 사람들에게 힐링을 주는 존재입니다.',
    celebrities: ['윤아', '차은우', '김진우', '미주', '최강창민']
  },
  '곰': {
    emoji: '🐻',
    description: '든든하고 포근한 인상을 주는 당신은 믿음직스럽고 온화한 성격을 가졌습니다. 우직하게 자신의 자리를 지키며 타인을 배려하는 넓은 마음씨가 당신의 가장 큰 매력입니다.',
    celebrities: ['마동석', '조진웅', '셔누', '김태우', '안재홍']
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

  // 파일 업로드 처리
  fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        showPreview(event.target.result);
        stopCamera();
        runAnalysis(imagePreview);
      };
      reader.readAsDataURL(file);
    }
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
    resultImageContainer.innerHTML = ''; // 이미지 컨테이너 초기화
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

    // 1. 사용자 이미지 복제하여 결과 카드에 추가
    const clonedImage = document.createElement('img');
    clonedImage.src = imageSrc;
    clonedImage.className = 'result-user-image';
    resultImageContainer.appendChild(clonedImage);
    
    // 가장 높은 확률의 동물 정보 가져오기
    const topResult = results[0];
    const detail = animalDetails[topResult.name] || { emoji: '❓', description: '알 수 없는 동물상입니다.', celebrities: [] };
    
    const titleElement = shareCard.querySelector('h2');
    titleElement.innerHTML = `
      <div class="top-emoji">${detail.emoji}</div>
      <div>당신은 '${topResult.name}상'입니다!</div>
    `;

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