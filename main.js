// Suggested code may be subject to a license. Learn more: ~LicenseLog:2995528663.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:4155450728.

// Add JS here

document.addEventListener('DOMContentLoaded', () => {
  const generateButton = document.getElementById('generate-button');
  const lotteryNumbersContainer = document.getElementById('lottery-numbers');

  function getRandomNumber(min, max) {

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateLottoNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) { // 일반적으로 로또는 6개의 숫자를 사용합니다.
      numbers.add(getRandomNumber(1, 45)); // 1부터 45 사이의 숫자를 생성합니다.
    }
    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b); // 숫자를 오름차순으로 정렬합니다.
    return sortedNumbers;
  }

  function displayNumbers(numbers) {
    lotteryNumbersContainer.innerHTML = ''; // 이전 번호를 지웁니다.
    numbers.forEach(number => {
      const ball = document.createElement('div');
      ball.classList.add('lottery-ball');
      ball.textContent = number;
      lotteryNumbersContainer.appendChild(ball);
    });
  }

  generateButton.addEventListener('click', () => {
    const newNumbers = generateLottoNumbers();
    displayNumbers(newNumbers);
  });

  // 페이지 로드 시 초기 번호를 생성 및 표시합니다.
  const initialNumbers = generateLottoNumbers();
  displayNumbers(initialNumbers);
});
// Add JS here