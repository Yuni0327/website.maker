const animals = ['강아지', '고양이', '여우', '토끼', '햄스터', '사슴', '곰'];

document.addEventListener('DOMContentLoaded', () => {
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

  let stream = null;

  // 파일 업로드 처리
  fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        showPreview(event.target.result);
        stopCamera();
        runAnalysis();
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
    runAnalysis();
  });

  // 다시하기
  restartBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    imagePreview.src = '';
    imagePreview.classList.add('hidden');
    placeholder.classList.remove('hidden');
    fileUpload.value = '';
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

  async function runAnalysis() {
    loading.classList.remove('hidden');
    resultSection.classList.add('hidden');

    // 인공지능 분석 시뮬레이션 (1.5초 대기)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const results = generateMockResults();
    displayResults(results);

    loading.classList.add('hidden');
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth' });
  }

  function generateMockResults() {
    // 랜덤 결과 생성 (실제 모델이 있다면 여기서 API 호출)
    let total = 0;
    const scores = animals.map(() => {
      const score = Math.random() * 100;
      total += score;
      return score;
    });

    return animals.map((animal, i) => ({
      name: animal,
      probability: (scores[i] / total) * 100
    })).sort((a, b) => b.probability - a.probability);
  }

  function displayResults(results) {
    resultChart.innerHTML = '';
    
    // 가장 높은 확률의 동물 강조
    const topAnimal = results[0].name;
    const titleElement = resultSection.querySelector('h2');
    titleElement.textContent = `당신은 '${topAnimal}상'입니다!`;

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
