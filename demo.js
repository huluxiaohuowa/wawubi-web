const input = document.querySelector('#play');
const code = document.querySelector('#code');
const choices = document.querySelector('#choices');
const typed = document.querySelector('#typed');
const names = { a: '工', b: '子', c: '又', d: '大', e: '月', f: '土', g: '王', h: '目', i: '水', j: '日', k: '口', l: '田', m: '山', n: '已', o: '火', p: '之', q: '金', r: '白', s: '木', t: '禾', u: '立', v: '女', w: '人', x: '纟', y: '言' };
const first = {"a": "恭恭敬敬", "b": "子子孙孙", "c": "双双", "d": "大厦", "e": "朦朦胧胧", "f": "垚", "g": "五一", "h": "上", "i": "洋洋洒洒", "j": "𣊫", "k": "咒骂", "l": "〇", "m": "崇山峻岭", "n": "书局", "o": "迷迷糊糊", "p": "这", "q": "㸚", "r": "抓拍", "s": "森林", "t": "自私自利", "u": "痒痒", "v": "妇女", "w": "偷偷", "x": "幽幽", "y": "方言"};
let rows = [];
function show(value) {
  code.textContent = value || '—';
  choices.replaceChildren();
  const key = value[0];
  rows = /^([a-y])\1{3}$/.test(value) ? [first[key], names[key]] : [];
  rows.forEach((word, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.toggle('selected', index === 1);
    const number = document.createElement('small');
    number.textContent = index + 1;
    button.append(number, ' ' + word);
    button.addEventListener('click', () => commit(index));
    choices.append(button);
  });
}
function commit(index) {
  if (!rows[index]) return;
  typed.textContent = (typed.textContent + rows[index]).slice(-13);
  input.value = '';
  show('');
  input.focus();
}
input.addEventListener('input', () => {
  input.value = input.value.toLowerCase().replace(/[^a-y]/g, '').slice(0, 4);
  show(input.value);
});
input.addEventListener('keydown', event => {
  if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
  const index = ({ ';': 1, '2': 1, '1': 0, ' ': 0 })[event.key];
  if (index !== undefined && rows.length) {
    event.preventDefault();
    commit(index);
  }
});
show('');
