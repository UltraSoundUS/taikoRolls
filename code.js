/**
 * 連打数 → 秒速
 * @param {number} duration 
 * @param {number} roll 
 * @returns {number} 
 */
const roll2density = (duration, roll) => roll / duration;

/**
 * 秒速 → 連打数
 * @param {number} duration 
 * @param {number} density 
 * @returns {number} 
 */
const density2roll = (duration, density) => Math.floor(density * duration);

/**
 * 太鼓の達人の連打は48分音符1個分短い分も考慮する
 * @param {number} bpm 
 * @param {number} beat 
 * @returns {number} 
 */
const calcDuration = (bpm, beat) => Math.max(Number.MIN_VALUE, 5 * (12 * beat - 1) / bpm);

/**
 * 数字かどうか判定
 * 参考: https://qiita.com/taku-0728/items/329e0bee1c49b7ce7cd1#%E6%AD%A3%E8%A6%8F%E8%A1%A8%E7%8F%BE
 * 　　  https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Regular_Expressions
 * @param {string} s 
 * @returns {boolean} 
 */
const isNumber = s => {
  const re = /^[0-9]+(\.[0-9]*)?$/
  return re.test(s);
}

/**
 * Pythonのzip風処理
 * @param  {...any} arr 
 * @returns {any[][]} 
 */
const zip = (...arr) => {
  const size = Math.min(...arr.map(x => x.length));
  return Array(size).fill(0).map((_, i) => arr.map(x => x[i]));
};

/**
 * 出力結果を1行作成
 * @param {number[]} line 
 * @param {boolean} flag 
 * @param {(duration: number, arg: number) => number} fn 
 * @param {number} digit 
 * @returns {string} 
 */
const calcEach = (line, flag, fn, digit) => {
  if (!flag) {
    return '';
  }
  const f = Math.pow(10, digit);
  const [bpm, beat, val] = line.map(Number);
  const duration = calcDuration(bpm, beat);
  const newVal = Math.round(f * fn(duration, val)) / f;
  return [bpm, beat, newVal].join(' ');
};

/**
 * 各行和をとって処理
 * calcEachと合わせて2回同じ計算をさせているが面倒なので修正しない
 * TODO: 楽しくなって1行で書こうとしてしまっているため可読性が低い
 * TODO: エラー防止に余分なデータを追加しているのを除去
 * @param {number[][]} lines 
 * @param {boolean[]} flags 
 * @param {(duration: number, arg: number) => number} fn 
 * @param {number} digit 
 * @returns {string} 
 */
const reduceDouble = (lines, checks, fn, digit) => {
  const f = Math.pow(10, digit);
  return Math.round(f * fn(...zip(
    ...zip(lines.concat([[120, 0, 0], [120, 0, 0]]), checks.concat([true, true]))
      .filter(args => args[1])
      .map(args => args[0].map(Number))
      .map(line => [calcDuration(line[0], line[1]), line[2]])
  ).map(args => args.reduce((a, b) => a + b)))) / f;
};

const calcRoll2Density = () => {
  /** @type {HTMLTextAreaElement} */
  const inputText = document.getElementById('roll-density-input');
  /** @type {HTMLTextAreaElement} */
  const outputText = document.getElementById('roll-density-output');
  /** @type {HTMLSpanElement} */
  const spanText = document.getElementById('roll-density-average');
  const lines = inputText.value.split('\n').map(line => line.split(' '));
  const flags = lines.map(line => line.length == 3 && line.every(isNumber));
  /** @type {number[]} */
  const newLines = zip(lines, flags).map(args => calcEach(...args, roll2density, 1));
  outputText.value = newLines.join('\n');
  spanText.innerText = reduceDouble(lines, flags, (d, val) => val / d, 1);
};

const calcDensity2Roll = () => {
  /** @type {HTMLTextAreaElement} */
  const inputText = document.getElementById('density-roll-input');
  /** @type {HTMLTextAreaElement} */
  const outputText = document.getElementById('density-roll-output');
  /** @type {HTMLSpanElement} */
  const spanText = document.getElementById('density-roll-total');
  const lines = inputText.value.split('\n').map(line => line.split(' '));
  const flags = lines.map(line => line.length == 3 && line.every(isNumber));
  /** @type {number[]} */
  const newLines = zip(lines, flags).map(args => calcEach(...args, density2roll, 0));
  outputText.value = newLines.join('\n');
  spanText.innerText = reduceDouble(lines, flags, (d, val) => val, 0);
};

const clear1 = () => {
  document.getElementById('roll-density-input').value = '';
  calcRoll2Density();
};

const clear2 = () => {
  document.getElementById('density-roll-input').value = '';
  calcDensity2Roll();
};

// 読み込み完了時の処理
window.addEventListener('load', () => {
  document.getElementById('roll-density-input').addEventListener('input', calcRoll2Density);
  document.getElementById('density-roll-input').addEventListener('input', calcDensity2Roll);
  document.getElementById('clear-button-1').addEventListener('click', clear1);
  document.getElementById('clear-button-2').addEventListener('click', clear2);
  calcRoll2Density();
  calcDensity2Roll();
});