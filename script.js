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

let timerId = null; // タイマーのID
let timeLeft = 0; // 残り時間（秒）
let isWorkTime = true; // 現在が作業時間かどうか
let totalWorkTime = 0; // 累計作業時間（分）

// 初期設定（作業時間）をタイマーに反映
resetTimer();

// --- 関数定義 ---

// タイマーを更新する関数
function updateTimer() {
    timeLeft--;
    updateDisplay();

    if (timeLeft < 0) {
        // タイマー終了
        playAlarm(); // 通知音を鳴らす
        
        if (isWorkTime) {
            // 作業終了 -> 休憩開始
            totalWorkTime += parseInt(workDurationInput.value, 10); // 累計作業時間を加算
            updateSummaryDisplay();
            isWorkTime = false;
            timeLeft = parseInt(breakDurationInput.value, 10) * 60;
            timerDisplay.style.color = '#28a745'; // 休憩中の色
        } else {
            // 休憩終了 -> 作業開始
            isWorkTime = true;
            timeLeft = parseInt(workDurationInput.value, 10) * 60;
            timerDisplay.style.color = '#005a9c'; // 作業中の色
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
    if (timerId === null) { // タイマーが動いていない時だけ実行
        // 現在の設定値を読み込む
        // (タイマー動作中に設定を変更しても、次のセッションまで反映されない仕様)
        if (timeLeft === parseInt(workDurationInput.value, 10) * 60 || timeLeft === parseInt(breakDurationInput.value, 10) * 60) {
             if(isWorkTime) {
                 timeLeft = parseInt(workDurationInput.value, 10) * 60;
             } else {
                 timeLeft = parseInt(breakDurationInput.value, 10) * 60;
             }
        }
        
        timerId = setInterval(updateTimer, 1000); // 1秒ごとにupdateTimerを実行
    }
}

// タイマーをストップする関数
function stopTimer() {
    clearInterval(timerId); // setIntervalを停止
    timerId = null;
}

// タイマーをリセットする関数
function resetTimer() {
    stopTimer();
    isWorkTime = true; // 作業時間に戻す
    timeLeft = parseInt(workDurationInput.value, 10) * 60; // 設定中の作業時間でリセット
    timerDisplay.style.color = '#005a9c'; // 作業中の色
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
    if (isWorkTime && timerId === null) { // 作業時間中で、タイマーが止まっている時だけ即時反映
        resetTimer();
    }
});
breakDurationInput.addEventListener('change', () => {
    if (!isWorkTime && timerId === null) { // 休憩時間中で、タイマーが止まっている時だけ即時反映
        stopTimer();
        timeLeft = parseInt(breakDurationInput.value, 10) * 60;
        updateDisplay();
    }
});