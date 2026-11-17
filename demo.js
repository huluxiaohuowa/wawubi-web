const stage = document.querySelector('#try');
const input = document.querySelector('#play');
const codeLabel = document.querySelector('#code');
const choices = document.querySelector('#choices');
const typed = document.querySelector('#typed');
const keyboard = document.querySelector('#keys');
const replay = document.querySelector('#replay');
const clear = document.querySelector('#clear');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const dictionaries = new Map();
const keyButtons = new Map();
let task = 0;
let playback = 0;
let interacted = false;

function dictionary(letter) {
  if (!dictionaries.has(letter)) {
    const request = fetch('./demo-data/' + letter + '.json')
      .then(response => {
        if (!response.ok) throw new Error('Dictionary unavailable');
        return response.json();
      }).catch(error => {
        dictionaries.delete(letter);
        throw error;
      });
    dictionaries.set(letter, request);
  }
  return dictionaries.get(letter);
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4);
}

function status(message) {
  const label = document.createElement('span');
  label.className = 'waiting';
  label.textContent = message;
  choices.replaceChildren(label);
}

async function rowsFor(value) {
  return value ? (await dictionary(value[0]))[value] ?? [] : [];
}

async function render(active = 0) {
  const revision = ++task;
  const value = normalize(input.value);
  codeLabel.textContent = value || '—';
  if (!value) {
    status('输入后显示候选');
    return [];
  }
  status('查码中…');
  try {
    const rows = await rowsFor(value);
    if (revision !== task) return [];
    if (rows.length === 0) {
      status('没有候选');
      return [];
    }
    choices.replaceChildren();
    rows.forEach(([word, hint], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.toggleAttribute('data-active', index === active);
      const number = document.createElement('small');
      number.textContent = index + 1;
      button.append(number, word);
      if (hint) {
        const suffix = document.createElement('code');
        suffix.textContent = hint;
        button.append(suffix);
      }
      button.addEventListener('click', () => {
        interrupt();
        void select(index, true);
      });
      choices.append(button);
    });
    return rows;
  } catch {
    if (revision === task) status('码表载入失败，重新输入可重试');
    return [];
  }
}

function setCode(value, active) {
  input.value = value;
  return render(active);
}

function append(value) {
  const start = typed.selectionStart;
  const end = typed.selectionEnd;
  const room = Math.max(0, typed.maxLength - typed.value.length + end - start);
  typed.setRangeText(value.slice(0, room), start, end, 'end');
}

function erase() {
  const start = typed.selectionStart;
  const end = typed.selectionEnd;
  if (start !== end) {
    typed.setRangeText('', start, end, 'end');
  } else if (start > 0) {
    const preceding = typed.value.slice(0, start);
    const parts = typeof Intl.Segmenter === 'function'
      ? Array.from(new Intl.Segmenter().segment(preceding), part => part.segment)
      : Array.from(preceding);
    typed.setRangeText('', start - parts.at(-1).length, end, 'end');
  }
}

function select(index, focus = false) {
  const code = input.value;
  if (!code) return Promise.resolve(false);
  return rowsFor(code).then(rows => {
    if (input.value !== code || !rows[index]) return false;
    append(rows[index][0]);
    void setCode('');
    if (focus) input.focus();
    return true;
  }).catch(() => false);
}

async function typeLetter(letter) {
  const code = input.value;
  if (code.length === 4) {
    if (!(await select(0))) return;
  } else if (input.value !== code) return;
  await setCode(input.value + letter);
}

function interrupt() {
  interacted = true;
  playback++;
  stage.removeAttribute('data-playing');
  typed.removeAttribute('data-commit');
  for (const button of keyButtons.values()) button.removeAttribute('data-hit');
}

function addKey(row, value, label = value) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'key';
  button.textContent = label;
  keyButtons.set(value, button);
  if (value === ' ') button.classList.add('space-key');
  if (value === 'Backspace') button.classList.add('key-wide');
  button.addEventListener('click', () => {
    interrupt();
    if (value === ' ' || value === ';') void select(value === ' ' ? 0 : 1, true);
    else if (value === 'Backspace') {
      if (input.value) void setCode(input.value.slice(0, -1));
      else erase();
    }
    else void typeLetter(value);
  });
  row.append(button);
}

for (const line of ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']) {
  const row = document.createElement('div');
  row.className = 'key-row';
  for (const key of line) addKey(row, key);
  keyboard.append(row);
}
const last = document.createElement('div');
last.className = 'key-row';
addKey(last, 'Backspace', '退格');
addKey(last, ' ', '空格');
addKey(last, ';');
keyboard.append(last);
keyboard.hidden = replay.hidden = clear.hidden = false;

input.addEventListener('focus', interrupt);
typed.addEventListener('focus', interrupt);
typed.addEventListener('input', interrupt);
input.addEventListener('input', () => {
  interrupt();
  input.value = normalize(input.value);
  void render();
});
input.addEventListener('keydown', event => {
  if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
  const selection = event.key === ' ' ? 0 : event.key === ';' ? 1 :
    /^[1-9]$/.test(event.key) ? Number(event.key) - 1 : -1;
  if (input.value && selection >= 0) {
    event.preventDefault();
    void select(selection);
  } else if (!input.value && event.key === 'Backspace') {
    event.preventDefault();
    erase();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    void setCode('');
  } else if (input.value.length === 4 && /^[a-z]$/i.test(event.key) &&
             input.selectionStart === input.selectionEnd) {
    event.preventDefault();
    void typeLetter(event.key.toLowerCase());
  }
});
clear.addEventListener('click', () => {
  interrupt();
  typed.value = '';
  void setCode('');
  input.focus();
});

const pause = duration => new Promise(resolve => window.setTimeout(resolve, duration));
async function playExample() {
  interrupt();
  const id = playback;
  typed.value = '';
  const sequence = ['ggtt', 'ltif'];
  await Promise.all(sequence.map(value => dictionary(value[0]))).catch(() => []);
  if (id !== playback) return;
  stage.setAttribute('data-playing', '');
  await setCode('');
  for (const value of sequence) {
    for (const letter of value) {
      if (id !== playback) return;
      const button = keyButtons.get(letter);
      if (!reduced.matches) button.setAttribute('data-hit', '');
      await setCode(input.value + letter);
      if (!reduced.matches) await pause(160);
      button.removeAttribute('data-hit');
    }
    if (!reduced.matches) await pause(420);
    if (id !== playback) return;
    if (await select(0)) {
      typed.setAttribute('data-commit', '');
      if (!reduced.matches) await pause(290);
      typed.removeAttribute('data-commit');
    } else {
      await setCode('');
    }
  }
  if (id === playback) stage.removeAttribute('data-playing');
}
replay.addEventListener('click', () => { void playExample(); });
if (!reduced.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    window.setTimeout(() => { if (!interacted && !reduced.matches) void playExample(); }, 650);
  }, { threshold: .4 });
  observer.observe(stage);
}
