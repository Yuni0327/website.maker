const URL = "https://teachablemachine.withgoogle.com/models/mrrlxN-j5/";
let model, maxPredictions;

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

  let stream = null;

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

      displayResults(results);
    } catch (err) {
      console.error("Prediction error:", err);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      loading.classList.add('hidden');
      resultSection.classList.remove('hidden');
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }
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