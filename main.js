// Firebase 라이브러리 (CDN) - 모듈 방식
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, limit, serverTimestamp, deleteDoc, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyC3JZSxZUq_iCZgMCf0XnFSVjonZqQogMo",
  authDomain: "animal-face-chat-9bce8.firebaseapp.com",
  projectId: "animal-face-chat-9bce8",
  storageBucket: "animal-face-chat-9bce8.firebasestorage.app",
  messagingSenderId: "797389459508",
  appId: "1:797389459508:web:8e327983193570de837a61",
  measurementId: "G-M8Z43V517V"
};


let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.log("Firebase config error.");
}

const URL = "https://teachablemachine.withgoogle.com/models/mrrlxN-j5/";
let model, maxPredictions;
let radarChart = null;
let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('ko') ? 'ko' : 'en');
let currentGuideIndex = 0;
let stream = null;

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
    navTest: "테스트",
    navGuide: "가이드",
    navCommunity: "수다방",
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
    promptPassword: "비밀번호를 입력하세요:",
    privacyPolicy: "개인정보 처리방침"
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
    navTest: "Test",
    navGuide: "Guide",
    navCommunity: "Chat",
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
    promptPassword: "Enter your password:",
    privacyPolicy: "Privacy Policy"
  }
};

const animalDetails = {
  '강아지': {
    name: { ko: '강아지', en: 'Puppy' },
    emoji: '🐶',
    description: { ko: '사랑스럽고 부드러운 인상을 가진 당신은 보는 사람을 무장해제시키는 매력이 있습니다.', en: 'You have a lovely and soft impression.' },
    celebrities: ['송중기', '박보영', '강다니엘'],
    stats: [95, 50, 70, 40, 100], 
    traits: { ko: '둥글둥글한 얼굴형과 처진 눈매가 특징입니다. 선하고 다정한 인상을 줍니다.', en: 'Characterized by a rounded face and friendly eyes.' },
    styling: { ko: '부드러운 니트나 캐주얼한 룩이 잘 어울립니다. 브라운 계열 메이크업을 추천합니다.', en: 'Soft knits and brown makeup suit you well.' },
    comments: { high: { ko: "인간 비타민! 🐶", en: "Human Vitamin! 🐶" }, middle: { ko: "따뜻한 강아지상이에요.", en: "Warm Puppy face." }, low: { ko: "귀여운 느낌이 있네요.", en: "A bit of cute vibes." } }
  },
  '고양이': {
    name: { ko: '고양이', en: 'Cat' },
    emoji: '🐱',
    description: { ko: '세련되고 도시적인 분위기를 풍기는 당신은 시크하면서도 묘한 매력을 가졌습니다.', en: 'You have a chic and urban vibe.' },
    celebrities: ['제니', '강동원', '한예슬'],
    stats: [60, 95, 50, 80, 40], 
    traits: { ko: '올라간 눈꼬리와 날카로운 콧대가 특징입니다. 신비롭고 도도한 매력을 풍깁니다.', en: 'Features upturned eyes and a sharp nose.' },
    styling: { ko: '세련된 블랙 룩이나 스트릿 패션이 잘 어울립니다. 세미 스모키 메이크업이 좋습니다.', en: 'Sophisticated black looks suit you.' },
    comments: { high: { ko: "매혹적인 고양이상 😼", en: "Mesmerizing Cat face 😼" }, middle: { ko: "시크한 분위기의 고양이상이에요.", en: "Chic Cat vibe." }, low: { ko: "고양이 같은 매력이 보이네요.", en: "Cat-like charm visible." } }
  },
  '여우': {
    name: { ko: '여우', en: 'Fox' },
    emoji: '🦊',
    description: { ko: '홀릴 듯한 매력적인 눈웃음과 화려한 이목구비를 가졌습니다.', en: 'You have attractive smiling eyes.' },
    celebrities: ['황민현', '예지', '지코'],
    stats: [50, 90, 30, 95, 60], 
    traits: { ko: '가늘고 긴 눈매와 화려한 이목구비가 특징입니다. 지적이고 영리해 보입니다.', en: 'Characterized by long eyes and glamorous features.' },
    styling: { ko: '화려한 액세서리나 포인트를 준 룩이 좋습니다. 캣츠아이 메이크업을 해보세요.', en: 'Glamorous accessories are great.' },
    comments: { high: { ko: "사람을 홀리는 매력적인 여우상 🦊", en: "Captivating Fox face 🦊" }, middle: { ko: "화려한 분위기의 여우상!", en: "Fox face with glamour!" }, low: { ko: "여우 같은 분위기가 풍기네요.", en: "Fox vibes visible." } }
  },
  '토끼': {
    name: { ko: '토끼', en: 'Rabbit' },
    emoji: '🐰',
    description: { ko: '동그란 눈과 맑은 피부, 상큼한 분위기를 가진 당신은 인간 토끼입니다.', en: 'With round eyes, you are a human Rabbit.' },
    celebrities: ['나연', '정국', '수지'],
    stats: [100, 40, 80, 50, 90], 
    traits: { ko: '앞니가 살짝 보이고 동그란 눈이 특징입니다. 상큼하고 발랄한 에너지를 뿜어냅니다.', en: 'Features round eyes and fresh energy.' },
    styling: { ko: '파스텔 톤의 밝은 옷이 잘 어울립니다. 핑크나 코랄 블러셔를 활용해보세요.', en: 'Bright pastel clothes suit you.' },
    comments: { high: { ko: "인간 토끼 그 자체 🐰", en: "Rabbit itself 🐰" }, middle: { ko: "순수한 매력의 토끼상이에요.", en: "Pure Rabbit face." }, low: { ko: "토끼 같은 귀여움이 있네요.", en: "Rabbit-like cuteness." } }
  },
  '사슴': {
    name: { ko: '사슴', en: 'Deer' },
    emoji: '🦌',
    description: { ko: '긴 목선과 맑고 깊은 눈망울을 가진 당신은 우아한 분위기의 소유자입니다.', en: 'You have an elegant atmosphere.' },
    celebrities: ['윤아', '차은우', '김진우'],
    stats: [60, 80, 100, 40, 70], 
    traits: { ko: '맑고 큰 눈망울과 가늘고 긴 목선이 특징입니다. 기품 있고 정갈한 느낌을 줍니다.', en: 'Characterized by clear eyes and a slender neck.' },
    styling: { ko: '깔끔한 셔츠나 우아한 원피스가 잘 어울립니다. 깨끗한 메이크업을 추천합니다.', en: 'Neat shirts suit you.' },
    comments: { high: { ko: "우아하고 청초한 사슴상 🦌", en: "Elegant Deer face 🦌" }, middle: { ko: "맑은 분위기의 사슴상이에요.", en: "Clear Deer face." }, low: { ko: "사슴 같은 눈망울을 가지셨네요.", en: "Deer-like eyes." } }
  }
};

const animalKeys = Object.keys(animalDetails);

document.addEventListener('DOMContentLoaded', async () => {
  // --- DOM Elements ---
  const langToggle = document.getElementById('lang-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
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
  const saveBtn = document.getElementById('save-btn');
  const shareCard = document.getElementById('share-card');
  const resultImageContainer = document.getElementById('result-image-container');
  const celebritySection = document.getElementById('celebrity-section');
  const resultComment = document.getElementById('result-comment');
  const nicknameInput = document.getElementById('nickname');
  const passwordInput = document.getElementById('password');
  const commentInput = document.getElementById('comment-input');
  const addCommentBtn = document.getElementById('add-comment-btn');
  const commentList = document.getElementById('comment-list');
  const guideStack = document.getElementById('guide-stack');
  const stackDots = document.getElementById('stack-dots');

  // --- Theme & Language ---
  function updateThemeIcon(isDarkMode) {
    themeToggle.innerHTML = isDarkMode 
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  }

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcon(isDarkMode);
    if (radarChart) updateChartTheme(isDarkMode);
  });

  function updateChartTheme(isDark) {
    if (!radarChart) return;
    const color = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    radarChart.options.scales.r.angleLines.color = gridColor;
    radarChart.options.scales.r.grid.color = gridColor;
    radarChart.options.scales.r.pointLabels.color = color;
    radarChart.update();
  }

  function updateLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    const emailEl = document.getElementById('email');
    const messageEl = document.getElementById('message');
    if (emailEl) emailEl.placeholder = translations[lang].emailPlaceholder;
    if (messageEl) messageEl.placeholder = translations[lang].messagePlaceholder;
    if (nicknameInput) nicknameInput.placeholder = translations[lang].nickname;
    if (passwordInput) passwordInput.placeholder = translations[lang].password;
    if (commentInput) commentInput.placeholder = translations[lang].inputPlaceholder;
    
    renderAnimalGuide(lang);
    langToggle.textContent = lang === 'ko' ? 'EN' : 'KO';
    document.documentElement.lang = lang;
  }

  langToggle.addEventListener('click', () => {
    const nextLang = currentLang === 'ko' ? 'en' : 'ko';
    localStorage.setItem('lang', nextLang);
    updateLanguage(nextLang);
  });

  // --- Guide Card Stack Logic ---
  function renderAnimalGuide(lang) {
    if (!guideStack || !stackDots) return;
    guideStack.innerHTML = '';
    stackDots.innerHTML = '';
    animalKeys.forEach((key, index) => {
      const detail = animalDetails[key];
      const card = document.createElement('div');
      card.className = `guide-card`;
      card.dataset.index = index;
      card.innerHTML = `
        <div class="guide-card-header"><span class="guide-emoji">${detail.emoji}</span><h3 class="guide-name">${detail.name[lang]}</h3></div>
        <div class="guide-body">
          <div class="guide-item"><span class="guide-label">${translations[lang].traitLabel}</span><p>${detail.traits[lang]}</p></div>
          <div class="guide-item"><span class="guide-label">${translations[lang].styleLabel}</span><p>${detail.styling[lang]}</p></div>
        </div>
      `;
      card.addEventListener('click', () => { if (index === currentGuideIndex) nextGuide(); });
      guideStack.appendChild(card);
      const dot = document.createElement('div');
      dot.className = `dot ${index === currentGuideIndex ? 'active' : ''}`;
      stackDots.appendChild(dot);
    });
    updateStackUI();
  }

  function updateStackUI() {
    const cards = document.querySelectorAll('.guide-card');
    const dots = document.querySelectorAll('.dot');
    if (cards.length === 0) return;

    cards.forEach((card) => {
      const index = parseInt(card.dataset.index);
      let relativeIndex = (index - currentGuideIndex + animalKeys.length) % animalKeys.length;
      card.classList.remove('stack-1', 'stack-2', 'stack-3', 'stack-hidden', 'pass-back');
      if (relativeIndex === 0) card.classList.add('stack-1');
      else if (relativeIndex === 1) card.classList.add('stack-2');
      else if (relativeIndex === 2) card.classList.add('stack-3');
      else card.classList.add('stack-hidden');
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentGuideIndex));
  }

  function nextGuide() {
    const currentCard = document.querySelector(`.guide-card[data-index="${currentGuideIndex}"]`);
    if (!currentCard || currentCard.classList.contains('pass-back')) return;
    currentCard.classList.add('pass-back');
    setTimeout(() => {
      currentGuideIndex = (currentGuideIndex + 1) % animalKeys.length;
      updateStackUI();
    }, 650);
  }

  function prevGuide() {
    currentGuideIndex = (currentGuideIndex - 1 + animalKeys.length) % animalKeys.length;
    updateStackUI();
  }

  document.getElementById('next-guide')?.addEventListener('click', (e) => { e.preventDefault(); nextGuide(); });
  document.getElementById('prev-guide')?.addEventListener('click', (e) => { e.preventDefault(); prevGuide(); });

  // --- Community Logic ---
  const animalChips = document.querySelectorAll('.animal-chip');
  const animalTypeHidden = document.getElementById('animal-type-hidden');

  animalChips.forEach(chip => {
    chip.addEventListener('click', () => {
      animalChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      if (animalTypeHidden) animalTypeHidden.value = chip.dataset.value;
    });
  });

  if (db) {
    const q = query(collection(db, "guestbook"), orderBy("timestamp", "desc"), limit(100));
    onSnapshot(q, (snapshot) => {
      if (!commentList) return;
      commentList.innerHTML = '';
      const allDocs = [];
      snapshot.forEach(doc => allDocs.push({ id: doc.id, ...doc.data() }));
      const mainComments = allDocs.filter(d => !d.parentId);
      const replies = allDocs.filter(d => d.parentId);

      mainComments.forEach((data) => {
        const docId = data.id;
        const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : '';
        const likes = data.likes || 0;
        const isLiked = localStorage.getItem(`liked_${docId}`) === 'true';
        
        const container = document.createElement('div');
        container.className = 'comment-item-container';
        container.innerHTML = `
          <div class="comment-item">
            <div class="comment-header">
              <div class="comment-info"><span class="comment-author">${data.animal} ${data.nickname}</span><span class="comment-date">${date}</span></div>
              <div class="comment-actions">
                <button class="reply-toggle-btn">${translations[currentLang].reply}</button>
                <button class="comment-delete-btn">×</button>
              </div>
            </div>
            <p class="comment-text">${data.message}</p>
            <div class="comment-footer">
              <button class="like-btn ${isLiked ? 'active' : ''}"><span class="heart-icon">${isLiked ? '❤️' : '🤍'}</span> <span class="like-count">${likes}</span></button>
            </div>
            <div class="reply-form hidden">
              <div class="input-row">
                <input type="text" placeholder="${translations[currentLang].nickname}" class="reply-nickname" maxlength="10">
                <input type="password" placeholder="${translations[currentLang].password}" class="reply-password" maxlength="4">
              </div>
              <textarea placeholder="${translations[currentLang].replyPlaceholder}" class="reply-input" maxlength="100"></textarea>
              <button class="btn primary full-width reply-submit-btn">${translations[currentLang].replyBtn}</button>
            </div>
          </div>
          <div class="replies-container"></div>
        `;

        container.querySelector('.like-btn').addEventListener('click', (e) => handleLike(docId, e.currentTarget));
        container.querySelector('.reply-toggle-btn').addEventListener('click', () => container.querySelector('.reply-form').classList.toggle('hidden'));
        container.querySelector('.comment-delete-btn').addEventListener('click', () => deleteComment(docId, data.password));
        container.querySelector('.reply-submit-btn').addEventListener('click', () => submitReply(docId, container));

        const repliesContainer = container.querySelector('.replies-container');
        replies.filter(r => r.parentId === docId).sort((a,b) => a.timestamp - b.timestamp).forEach(reply => {
          const rDate = reply.timestamp ? new Date(reply.timestamp.toDate()).toLocaleDateString() : '';
          const rIsLiked = localStorage.getItem(`liked_${reply.id}`) === 'true';
          const replyEl = document.createElement('div');
          replyEl.className = 'reply-item';
          replyEl.innerHTML = `
            <div class="comment-header">
              <div class="comment-info"><span class="comment-author">↳ ${reply.animal} ${reply.nickname}</span><span class="comment-date">${rDate}</span></div>
              <button class="comment-delete-btn small">×</button>
            </div>
            <p class="comment-text">${reply.message}</p>
            <div class="comment-footer">
              <button class="like-btn small ${rIsLiked ? 'active' : ''}"><span class="heart-icon">${rIsLiked ? '❤️' : '🤍'}</span> <span class="like-count">${reply.likes || 0}</span></button>
            </div>
          `;
          replyEl.querySelector('.like-btn').addEventListener('click', (e) => handleLike(reply.id, e.currentTarget));
          replyEl.querySelector('.comment-delete-btn').addEventListener('click', () => deleteComment(reply.id, reply.password));
          repliesContainer.appendChild(replyEl);
        });
        commentList.appendChild(container);
      });
    });
  }

  async function handleLike(docId, btn) {
    if (localStorage.getItem(`liked_${docId}`)) { alert(translations[currentLang].alertAlreadyLiked); return; }
    try {
      const countEl = btn.querySelector('.like-count');
      countEl.textContent = parseInt(countEl.textContent) + 1;
      btn.querySelector('.heart-icon').textContent = '❤️';
      btn.classList.add('active');
      localStorage.setItem(`liked_${docId}`, 'true');
      await updateDoc(doc(db, "guestbook", docId), { likes: increment(1) });
    } catch (e) { console.error(e); }
  }

  async function deleteComment(docId, correctPw) {
    const pw = prompt(translations[currentLang].promptPassword);
    if (pw === correctPw) {
      if (confirm(translations[currentLang].alertDeleteConfirm)) {
        await deleteDoc(doc(db, "guestbook", docId));
        alert(translations[currentLang].alertDeleteSuccess);
      }
    } else if (pw) { alert(translations[currentLang].alertWrongPassword); }
  }

  async function submitReply(pid, container) {
    const nickInput = container.querySelector('.reply-nickname');
    const pwInput = container.querySelector('.reply-password');
    const msgInput = container.querySelector('.reply-input');
    const nick = nickInput.value.trim();
    const pw = pwInput.value.trim();
    const msg = msgInput.value.trim();
    if (!nick || !pw || !msg) { alert(translations[currentLang].alertInputAll); return; }
    if (db) {
      await addDoc(collection(db, "guestbook"), { 
        nickname: nick, 
        password: pw, 
        message: msg, 
        animal: animalTypeHidden.value, 
        parentId: pid, 
        timestamp: serverTimestamp() 
      });
      msgInput.value = '';
      pwInput.value = '';
      container.querySelector('.reply-form').classList.add('hidden');
      alert(translations[currentLang].alertReplySuccess);
    }
  }

  if (addCommentBtn) {
    addCommentBtn.addEventListener('click', async () => {
      const nick = nicknameInput.value.trim();
      const pw = passwordInput.value.trim();
      const msg = commentInput.value.trim();
      if (!nick || !pw || !msg) { alert(translations[currentLang].alertInputAll); return; }
      if (db) await addDoc(collection(db, "guestbook"), { nickname: nick, password: pw, message: msg, animal: animalTypeHidden.value, timestamp: serverTimestamp() });
      commentInput.value = ''; passwordInput.value = '';
      alert(translations[currentLang].alertPostSuccess);
    });
  }

  // --- TM Model Logic ---
  async function loadModel() {
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    maxPredictions = model.getTotalClasses();
  }
  loadModel().catch(e => console.error(e));

  window.runAnalysis = async function(imageElement) {
    if (!model) { alert(translations[currentLang].alertModelLoading); return; }
    loading.classList.remove('hidden'); resultSection.classList.add('hidden');
    
    try {
      await tf.ready();
      if (typeof imageElement.decode === 'function') {
        try { await imageElement.decode(); } catch (e) { console.warn("Image decode failed"); }
      }

      const analysisCanvas = document.createElement('canvas');
      const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas context is null");

      const maxSize = 400; 
      let width = imageElement.naturalWidth || imageElement.width;
      let height = imageElement.naturalHeight || imageElement.height;
      if (width === 0 || height === 0) throw new Error("Image not loaded");

      if (width > height) {
        if (width > maxSize) { height *= maxSize / width; width = maxSize; }
      } else {
        if (height > maxSize) { width *= maxSize / height; height = maxSize; }
      }
      
      analysisCanvas.width = width;
      analysisCanvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(imageElement, 0, 0, width, height);
      
      const prediction = await model.predict(analysisCanvas);
      const results = prediction.map(p => ({ name: p.className, probability: p.probability * 100 })).sort((a, b) => b.probability - a.probability);
      displayResults(results, imageElement.src);
    } catch (err) { 
      console.error("Analysis Error:", err);
      alert(translations[currentLang].alertError + "\n(" + err.message.substring(0, 40) + ")"); 
    }
    finally { 
      loading.classList.add('hidden'); 
      resultSection.classList.remove('hidden'); 
      resultSection.scrollIntoView({ behavior: 'smooth' }); 
    }
  };

  function displayResults(results, imageSrc) {
    if (!resultChart || !celebritySection || !resultImageContainer || !resultComment) return;
    resultChart.innerHTML = ''; celebritySection.innerHTML = ''; resultImageContainer.innerHTML = ''; resultComment.textContent = '';
    const clonedImage = document.createElement('img'); clonedImage.src = imageSrc; clonedImage.className = 'result-user-image'; resultImageContainer.appendChild(clonedImage);
    const topResult = results[0];
    const detail = animalDetails[topResult.name] || { name: { ko: topResult.name, en: 'Unknown' }, emoji: '❓', description: { ko: '', en: '' }, celebrities: [], stats: [50,50,50,50,50], comments: { high:{ko:'',en:''}, middle:{ko:'',en:''}, low:{ko:'',en:''} } };
    
    if (detail.emoji) {
      if (animalTypeHidden) animalTypeHidden.value = detail.emoji;
      const chips = document.querySelectorAll('.animal-chip');
      chips.forEach(chip => {
        if (chip.dataset.value === detail.emoji) chip.classList.add('selected');
        else chip.classList.remove('selected');
      });
    }

    const animalName = detail.name[currentLang] || topResult.name;
    const shareCardH2 = shareCard.querySelector('h2');
    if (shareCardH2) shareCardH2.innerHTML = `<div class="top-emoji">${detail.emoji}</div><div>${translations[currentLang].resultComment.replace('{name}', animalName)}</div>`;
    
    const desc = document.createElement('p'); desc.className = 'animal-description'; desc.textContent = detail.description[currentLang]; resultChart.appendChild(desc);
    resultComment.textContent = topResult.probability >= 90 ? detail.comments.high[currentLang] : topResult.probability >= 50 ? detail.comments.middle[currentLang] : detail.comments.low[currentLang];
    
    if (detail.celebrities) {
      const t = document.createElement('h3'); t.textContent = animalName + translations[currentLang].celebTitle; t.className = 'celeb-title'; celebritySection.appendChild(t);
      const list = document.createElement('div'); list.className = 'celeb-list';
      detail.celebrities.forEach(c => { const chip = document.createElement('span'); chip.className = 'celeb-chip'; chip.textContent = c; list.appendChild(chip); });
      celebritySection.appendChild(list);
    }

    const radarCanvas = document.getElementById('radar-chart');
    if (radarCanvas) {
      const ctx = radarCanvas.getContext('2d');
      if (radarChart) radarChart.destroy();
      const isDark = body.classList.contains('dark-mode');
      let primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#6366f1';
      let bgColor = primaryColor.startsWith('rgb') ? primaryColor.replace('rgb', 'rgba').replace(')', ', 0.2)') : primaryColor + '33';

      radarChart = new Chart(ctx, {
        type: 'radar',
        data: { labels: translations[currentLang].chartLabels, datasets: [{ label: animalName, data: detail.stats, fill: true, backgroundColor: bgColor, borderColor: primaryColor, pointBackgroundColor: primaryColor }] },
        options: { scales: { r: { angleLines: { color: isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)' }, grid: { color: isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)' }, pointLabels: { color: isDark?'#f1f5f9':'#1e293b' }, suggestedMin: 0, suggestedMax: 100, ticks: { display: false } } }, plugins: { legend: { display: false } } }
      });
    }

    results.forEach(res => {
      const item = document.createElement('div'); item.className = 'result-item';
      item.innerHTML = `<div class="label-group"><span>${animalDetails[res.name]?.name[currentLang] || res.name}</span><span>${res.probability.toFixed(1)}%</span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width: 0%"></div></div>`;
      resultChart.appendChild(item);
      setTimeout(() => { const fill = item.querySelector('.progress-bar-fill'); if (fill) fill.style.width = `${res.probability}%`; }, 100);
    });
  }

  // --- Upload Handlers ---
  const uploadSection = document.querySelector('.upload-section');
  if (uploadSection) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => { uploadSection.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false); });
    ['dragenter', 'dragover'].forEach(eventName => { uploadSection.addEventListener(eventName, () => uploadSection.classList.add('highlight'), false); });
    ['dragleave', 'drop'].forEach(eventName => { uploadSection.addEventListener(eventName, () => uploadSection.classList.remove('highlight'), false); });
    uploadSection.addEventListener('drop', (e) => { handleFile(e.dataTransfer.files[0]); });
  }

  if (fileUpload) { fileUpload.addEventListener('change', (e) => { handleFile(e.target.files[0]); }); }

  function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => { 
        imagePreview.onload = () => runAnalysis(imagePreview); 
        imagePreview.src = ev.target.result; 
        imagePreview.classList.remove('hidden'); 
        placeholder.classList.add('hidden'); 
        webcamVideo.classList.add('hidden');
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
        startCameraBtn.classList.remove('hidden'); capturePhotoBtn.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  }

  if (startCameraBtn) {
    startCameraBtn.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        webcamVideo.srcObject = stream; webcamVideo.classList.remove('hidden'); imagePreview.classList.add('hidden'); placeholder.classList.add('hidden');
        startCameraBtn.classList.add('hidden'); capturePhotoBtn.classList.remove('hidden');
      } catch (err) { alert(translations[currentLang].alertCamera + err.message); }
    });
  }

  if (capturePhotoBtn) {
    capturePhotoBtn.addEventListener('click', () => {
      const canvas = document.getElementById('capture-canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = webcamVideo.videoWidth; canvas.height = webcamVideo.videoHeight;
      ctx.drawImage(webcamVideo, 0, 0);
      imagePreview.onload = () => runAnalysis(imagePreview);
      imagePreview.src = canvas.toDataURL('image/png');
      imagePreview.classList.remove('hidden'); webcamVideo.classList.add('hidden');
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
      capturePhotoBtn.classList.add('hidden'); startCameraBtn.classList.remove('hidden');
    });
  }

  if (restartBtn) { restartBtn.addEventListener('click', () => { resultSection.classList.add('hidden'); imagePreview.src = ''; imagePreview.classList.add('hidden'); placeholder.classList.remove('hidden'); }); }
  if (saveBtn) { saveBtn.addEventListener('click', async () => { const canvas = await html2canvas(shareCard, { scale: 2, backgroundColor: body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff', useCORS: true }); const link = document.createElement('a'); link.download = 'result.png'; link.href = canvas.toDataURL(); link.click(); }); }

  updateLanguage(currentLang);
  if (localStorage.getItem('theme') === 'dark') { body.classList.add('dark-mode'); updateThemeIcon(true); }

  // Smooth scroll for nav links
  document.querySelectorAll('.main-nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const offset = document.querySelector('.main-nav').offsetHeight + 20;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });
});