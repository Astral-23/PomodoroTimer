// DOM要素の取得
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const workDurationInput = document.getElementById('work-duration');
const breakDurationInput = document.getElementById('break-duration');
const totalWorkTimeDisplay = document.getElementById('total-work-time');
const resetSummaryBtn = document.getElementById('reset-summary-btn');
const alarmSound = document.getElementById('alarm-sound');

let timerWorker = new Worker('worker.js'); // Web Workerの作成
let isRunning = false; // タイマーが動作中かどうか
let timeLeft = 0; // 残り時間（秒）
let isWorkTime = true; // 現在が作業時間かどうか
let totalWorkTime = 0; // 累計作業時間（分）

// Workerからのメッセージを受信
timerWorker.onmessage = function(e) {
    if (e.data === 'tick') {
        updateTimer();
    }
};

// 初期設定（作業時間）をタイマーに反映
resetTimer();

// --- 関数定義 ---

// タイマーを更新する関数
function updateTimer() {
    timeLeft--;

    // 作業時間中、1分経過するごとに累計作業時間を1分加算
    // timeLeftが60の倍数になった時点（例: 1500→1440）で1分経過したと判断
    if (isWorkTime && timeLeft % 60 === 0 && timeLeft >= 0) {
        totalWorkTime += 1;
        updateSummaryDisplay();
    }

    updateDisplay();

    if (timeLeft < 0) {
        // タイマー終了
        playAlarm(); // 通知音を鳴らす
        
        if (isWorkTime) {
            // 作業終了 -> 休憩開始
            isWorkTime = false;
            timeLeft = parseInt(breakDurationInput.value, 10) * 60;
            // CSSクラスを休憩用に変更
            timerDisplay.classList.remove('timer-work');
            timerDisplay.classList.add('timer-break');
        } else {
            // 休憩終了 -> 作業開始
            isWorkTime = true;
            timeLeft = parseInt(workDurationInput.value, 10) * 60;
            // CSSクラスを作業用に変更
            timerDisplay.classList.remove('timer-break');
            timerDisplay.classList.add('timer-work');
        }
        updateDisplay();
    }
}

// 表示を更新する関数
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 累計表示を更新する関数
function updateSummaryDisplay() {
    totalWorkTimeDisplay.textContent = `${totalWorkTime} 分`;
}

// タイマーをスタートする関数
function startTimer() {
    if (!isRunning) { // タイマーが動いていない時だけ実行
        isRunning = true;
        // 現在の設定値を読み込む
        if (timeLeft === parseInt(workDurationInput.value, 10) * 60 || timeLeft === parseInt(breakDurationInput.value, 10) * 60) {
             if(isWorkTime) {
                 timeLeft = parseInt(workDurationInput.value, 10) * 60;
             } else {
                 timeLeft = parseInt(breakDurationInput.value, 10) * 60;
             }
        }
        
        timerWorker.postMessage('start'); // Workerに開始を指示
    }
}

// タイマーをストップする関数
function stopTimer() {
    timerWorker.postMessage('stop'); // Workerに停止を指示
    isRunning = false;
}

// タイマーをリセットする関数
function resetTimer() {
    stopTimer();
    isWorkTime = true; // 作業時間に戻す
    timeLeft = parseInt(workDurationInput.value, 10) * 60; // 設定中の作業時間でリセット
    // CSSクラスを作業用に変更
    timerDisplay.classList.remove('timer-break');
    timerDisplay.classList.add('timer-work');
    updateDisplay();
}

// 累計をリセットする関数
function resetSummary() {
    totalWorkTime = 0;
    updateSummaryDisplay();
}

// 通知音を再生する関数
function playAlarm() {
    alarmSound.currentTime = 0; // 音を最初から再生
    alarmSound.play().catch(error => {
        // ブラウザのポリシーにより自動再生がブロックされた場合のフォールバック
        console.warn("通知音の再生がブラウザにブロックされました。", error);
        // 必要に応じてアラートなどで代用
        // alert("時間です！"); 
    });
}


// --- イベントリスナーの設定 ---

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);
resetSummaryBtn.addEventListener('click', resetSummary);

// 設定が変更されたら、リセット時にそれが反映されるように
workDurationInput.addEventListener('change', () => {
    if (isWorkTime && !isRunning) { // 作業時間中で、タイマーが止まっている時だけ即時反映
        resetTimer();
    }
});
breakDurationInput.addEventListener('change', () => {
    if (!isWorkTime && !isRunning) { // 休憩時間中で、タイマーが止まっている時だけ即時反映
        stopTimer();
        timeLeft = parseInt(breakDurationInput.value, 10) * 60;
        updateDisplay();
    }
});