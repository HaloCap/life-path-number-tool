
function reduceToOneDigit(n) {
    while (n > 9) {
      n = String(n)
        .split('')
        .map(d => +d)
        .reduce((s, v) => s + v, 0);
    }
    return n;
  }
  
function getZodiacNumber(m, d) {
    const ranges = [
      { start:[1,1],   end:[1,19], num:1 },
      { start:[1,20],  end:[2,18], num:2 },
      { start:[2,19],  end:[3,20], num:3 },
      { start:[3,21],  end:[4,19], num:1 },
      { start:[4,20],  end:[5,20], num:2 },
      { start:[5,21],  end:[6,20], num:3 },
      { start:[6,21],  end:[7,22], num:4 },
      { start:[7,23],  end:[8,22], num:5 },
      { start:[8,23],  end:[9,22], num:6 },
      { start:[9,23],  end:[10,22],num:7 },
      { start:[10,23], end:[11,21],num:8 },
      { start:[11,22], end:[12,21],num:9 },
      { start:[12,22], end:[12,31],num:1 }
    ];
    const hit = ranges.find(z => {
      const [sm, sd] = z.start, [em, ed] = z.end;
      return (m === sm && d >= sd) ||
             (m === em && d <= ed) ||
             (m > sm  && m <  em);
    });
    return hit ? hit.num : null;
}
  
function drawEmptyGrid() {
    const c = document.getElementById('gridCanvas');
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height, cell = W / 3;
    ctx.clearRect(0, 0, W, H);
  
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cell * i, 0);
      ctx.lineTo(cell * i, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, cell * i);
      ctx.lineTo(W, cell * i);
      ctx.stroke();
    }
  
    const pos = {
      1:[0,0], 4:[1,0], 7:[2,0],
      2:[0,1], 5:[1,1], 8:[2,1],
      3:[0,2], 6:[1,2], 9:[2,2],
    };
    ctx.fillStyle = '#a65';
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let n = 1; n <= 9; n++) {
      const [cx, cy] = pos[n];
      ctx.fillText(n, cx * cell + cell/2, cy * cell + cell/2);
    }
}
  
function initForm() {
    const now = new Date().getFullYear();
    const yearInput = document.getElementById('year');
    const monthSel  = document.getElementById('month');
    const daySel    = document.getElementById('day');
  
    yearInput.setAttribute('min', '1900');
    yearInput.setAttribute('max', now);
    yearInput.value = now;
  
    for (let m = 1; m <= 12; m++) {
      monthSel.add(new Option(`${m} 月`, m));
    }
    monthSel.value = 1;
  
    function updateDays() {
      const y = parseInt(yearInput.value, 10) || now;
      const m = parseInt(monthSel.value, 10);
      const days = new Date(y, m, 0).getDate();
      daySel.options.length = 0;
      for (let d = 1; d <= days; d++) {
        daySel.add(new Option(`${d} 日`, d));
      }
    }
  
    yearInput.addEventListener('change', updateDays);
    monthSel.addEventListener('change', updateDays);
    updateDays();
}
  
document.addEventListener('DOMContentLoaded', () => {
    initForm();
    drawEmptyGrid();
    document
      .getElementById('numerologyForm')
      .addEventListener('submit', handleSubmit);
});
  
function handleSubmit(e) {
    e.preventDefault();
    const Y = document.getElementById('year').value.padStart(4,'0');
    const M = document.getElementById('month').value.padStart(2,'0');
    const D = document.getElementById('day').value.padStart(2,'0');
  
    const digits = (Y + M + D).split('').map(d => +d);
  
    const innate = digits.filter(n => n > 0);
  
    const total  = digits.reduce((a,b) => a + b, 0);
    const lifeNo = reduceToOneDigit(total);
  
    const birthNo = reduceToOneDigit(
      D.split('').map(d => +d).reduce((a,b) => a + b, 0)
    );
  
    const talentArr = total > 9
      ? String(total).split('').map(d => +d)
      : [total];
  
    const zodiacNo = getZodiacNumber(+M, +D);
  
    const allNums = [...innate, lifeNo, ...talentArr];
    if (zodiacNo) allNums.push(zodiacNo);
    const presentAll = new Set(allNums);
    const missing = [];
    for (let i = 1; i <= 9; i++) {
      if (!presentAll.has(i)) missing.push(i);
    }
  
    document.getElementById('result').innerHTML = `
      <p>先天數：${innate.join('、')}</p>
      <p>命數：${lifeNo}</p>
      <p>生日數：${birthNo}</p>
      <p>天賦數：${talentArr.join('、')}</p>
      <p>星座數：${zodiacNo || '—'}</p>
      <p>缺數：${missing.length ? missing.join('、') : '無'}</p>
    `;
  
    const drawnLines = drawGridCanvas(innate, lifeNo, talentArr, zodiacNo, presentAll);
  
    const linesDiv = document.getElementById('linesList');
    linesDiv.innerHTML = drawnLines.length
      ? `<p>生命靈數連線：${drawnLines.join('、')}</p>`
      : `<p>沒有任何連線</p>`;
}
  
function drawGridCanvas(innate, lifeNo, talentArr, zodiacNo, presentAll) {
    const c   = document.getElementById('gridCanvas');
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height, cell = W / 3;
    ctx.clearRect(0, 0, W, H);
  
    drawEmptyGrid();
  
    const pos = {
      1:[0,0], 4:[1,0], 7:[2,0],
      2:[0,1], 5:[1,1], 8:[2,1],
      3:[0,2], 6:[1,2], 9:[2,2],
    };
  
    const triplets = [
      { nums:[1,4,7], name:'1-4-7' },
      { nums:[2,5,8], name:'2-5-8' },
      { nums:[3,6,9], name:'3-6-9' },
      { nums:[1,2,3], name:'1-2-3' },
      { nums:[4,5,6], name:'4-5-6' },
      { nums:[7,8,9], name:'7-8-9' },
      { nums:[1,5,9], name:'1-5-9' },
      { nums:[7,5,3], name:'7-5-3' }
    ];
    const pairs = [
      { nums:[2,4], name:'2-4' },
      { nums:[4,8], name:'4-8' },
      { nums:[8,6], name:'8-6' },
      { nums:[6,2], name:'6-2' }
    ];
  
    const drawn = [];
    ctx.setLineDash([6,4]);
    ctx.strokeStyle  = '#888';
    ctx.lineWidth    = 2;
  
    triplets.forEach(({nums,name}) => {
      if (nums.every(n => presentAll.has(n))) {
        const [n1,,n3] = nums;
        const [c1,r1] = pos[n1], [c3,r3] = pos[n3];
        ctx.beginPath();
        ctx.moveTo(c1*cell+cell/2, r1*cell+cell/2);
        ctx.lineTo(c3*cell+cell/2, r3*cell+cell/2);
        ctx.stroke();
        drawn.push(name);
      }
    });
    pairs.forEach(({nums,name}) => {
      const [n1,n2] = nums;
      if (presentAll.has(n1) && presentAll.has(n2)) {
        const [c1,r1] = pos[n1], [c2,r2] = pos[n2];
        ctx.beginPath();
        ctx.moveTo(c1*cell+cell/2, r1*cell+cell/2);
        ctx.lineTo(c2*cell+cell/2, r2*cell+cell/2);
        ctx.stroke();
        drawn.push(name);
      }
    });
  
    ctx.setLineDash([]);
  
    const colors = ['#1f77b4','#ff7f0e','#2ca02c','#d62728'];
    const baseR = 16, step = 8, lineW = 3;
    for (let n = 1; n <= 9; n++) {
      const [cx, cy] = pos[n];
      const x = cx*cell + cell/2, y = cy*cell + cell/2;
      let offset = 0;
      const cntInnate = innate.filter(v => v === n).length;
      for (let i = 0; i < cntInnate; i++, offset++) {
        drawCircle(ctx, x, y, baseR + offset*step, colors[0], lineW);
      }
      if (n === lifeNo) {
        drawCircle(ctx, x, y, baseR + offset*step, colors[1], lineW);
        offset++;
      }
      const cntTal = talentArr.filter(v => v === n).length;
      for (let i = 0; i < cntTal; i++, offset++) {
        drawCircle(ctx, x, y, baseR + offset*step, colors[2], lineW);
      }
      if (n === zodiacNo) {
        drawCircle(ctx, x, y, baseR + offset*step, colors[3], lineW);
        offset++;
      }
    }
  
    return drawn;
}

function drawCircle(ctx, x, y, r, color, w) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.strokeStyle = color;
    ctx.lineWidth   = w;
    ctx.stroke();
}
