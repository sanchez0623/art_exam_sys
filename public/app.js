/* ──────────────────────────────────────────────
   艺术史自测系统 - 前端应用
────────────────────────────────────────────── */

const API = '';

// ── Period labels ──
const PERIOD_LABELS = {
  ancient: '古代艺术', medieval: '中世纪', renaissance: '文艺复兴',
  baroque: '巴洛克/洛可可', modern: '现代艺术', contemporary: '当代艺术',
  non_western: '非西方艺术',
};
const DIFF_LABELS = { 1: '⭐ 入门', 2: '⭐⭐ 中等', 3: '⭐⭐⭐ 困难' };
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// ── State ──
let currentSession = null;    // { id, questions, answers, currentIdx }
let reviewMode = false;
let toastTimer = null;

// ─────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    showPage(page);
    btn.closest('nav').querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');
  if (name === 'home') loadStats();
  if (name === 'history') loadHistory(1);
  if (name === 'questions') loadQuestions();
}

// ─────────────────────────────────────────────
// Home / Stats
// ─────────────────────────────────────────────
async function loadStats() {
  try {
    const [{ count }, stats] = await Promise.all([
      fetchJSON('/api/questions/count'),
      fetchJSON('/api/quiz/stats'),
    ]);
    document.getElementById('stat-total-q').textContent = count;
    document.getElementById('stat-sessions').textContent = stats.availableQuestions;
    document.getElementById('stat-answered').textContent = stats.retryQuestions;
    document.getElementById('stat-accuracy').textContent = stats.totalAnswered > 0
      ? `${stats.accuracy}%` : '-%';
  } catch (e) { console.error('loadStats error', e); }
}

// Quick start
document.getElementById('btn-quick-start').addEventListener('click', async () => {
  await startQuiz({ count: 10 });
});

// Custom modal
document.getElementById('btn-custom-start').addEventListener('click', () => {
  document.getElementById('modal-custom').classList.remove('hidden');
});
document.getElementById('btn-cancel-custom').addEventListener('click', () => {
  document.getElementById('modal-custom').classList.add('hidden');
});
document.getElementById('btn-start-custom').addEventListener('click', async () => {
  const count = parseInt(document.getElementById('custom-count').value, 10) || 10;
  const period = document.getElementById('custom-period').value || undefined;
  const difficulty = document.getElementById('custom-difficulty').value
    ? parseInt(document.getElementById('custom-difficulty').value, 10)
    : undefined;
  document.getElementById('modal-custom').classList.add('hidden');
  await startQuiz({ count, period, difficulty });
});

// ─────────────────────────────────────────────
// Quiz Flow
// ─────────────────────────────────────────────
async function startQuiz(options = {}) {
  reviewMode = false;
  showPage('quiz');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-page="quiz"]').classList.add('active');

  setVisible('quiz-loading', true);
  setVisible('quiz-container', false);
  setVisible('quiz-result', false);

  try {
    const session = await fetchJSON('/api/quiz/start', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    const data = await fetchJSON(`/api/quiz/${session.id}`);
    currentSession = {
      id: session.id,
      questions: data.questions,
      answers: {}, // questionId -> { userAnswer, isCorrect, correctAnswer, explanation }
      currentIdx: 0,
      options: {
        period: options.period,
        difficulty: options.difficulty,
      },
    };
    setVisible('quiz-loading', false);
    setVisible('quiz-container', true);
    renderQuestion();
  } catch (e) {
    setVisible('quiz-loading', false);
    alert('出题失败：' + (e.message || '未知错误'));
    showPage('home');
  }
}

function renderQuestion() {
  const { questions, currentIdx, answers, id: sessionId } = currentSession;
  const q = questions[currentIdx];
  const total = questions.length;

  // Header
  document.getElementById('quiz-title').textContent = `第 ${currentIdx + 1} / ${total} 题`;
  document.getElementById('quiz-period-tag').textContent = PERIOD_LABELS[q.period] || q.period;
  document.getElementById('quiz-diff-tag').textContent = DIFF_LABELS[q.difficulty] || `难度${q.difficulty}`;

  // Progress
  const answered = Object.keys(answers).length;
  const correct = Object.values(answers).filter(a => a.isCorrect).length;
  document.getElementById('quiz-progress').style.width = `${(answered / total) * 100}%`;
  document.getElementById('quiz-score').textContent = `已答：${answered}/${total} · 正确：${correct}`;

  // Source
  document.getElementById('q-source').textContent = q.source ? `📌 ${q.source}` : '';
  // Question text
  document.getElementById('q-text').textContent = q.content;

  // Options
  const optionsEl = document.getElementById('q-options');
  optionsEl.innerHTML = '';
  const savedAnswer = answers[q.id];

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.disabled = !!savedAnswer;

    // Determine state
    if (savedAnswer) {
      const correctIdxs = (q.answer || savedAnswer.correctAnswer)
        .split(',').map(s => parseInt(s.trim(), 10));
      if (correctIdxs.includes(i)) {
        btn.classList.add('correct');
      } else if (savedAnswer.userAnswer.split(',').map(s => parseInt(s.trim(), 10)).includes(i)) {
        btn.classList.add('wrong');
      }
    }

    btn.innerHTML = `<span class="option-letter">${LETTERS[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => handleAnswer(q, i, sessionId));
    optionsEl.appendChild(btn);
  });

  // Feedback
  const feedbackEl = document.getElementById('q-feedback');
  if (savedAnswer) {
    feedbackEl.classList.remove('hidden');
    feedbackEl.classList.toggle('wrong-fb', !savedAnswer.isCorrect);
    document.getElementById('feedback-result').textContent =
      savedAnswer.isCorrect ? '✅ 回答正确！' : `❌ 回答错误，正确答案：${LETTERS[savedAnswer.correctAnswer]}`;
    document.getElementById('feedback-explanation').textContent = savedAnswer.explanation || '';
  } else {
    feedbackEl.classList.add('hidden');
  }

  // Nav buttons
  const prevBtn = document.getElementById('btn-prev-q');
  const loadMoreBtn = document.getElementById('btn-load-more-q');
  const nextBtn = document.getElementById('btn-next-q');
  const finishBtn = document.getElementById('btn-finish-quiz');

  prevBtn.style.display = currentIdx > 0 ? '' : 'none';
  loadMoreBtn.style.display = reviewMode ? 'none' : '';
  loadMoreBtn.onclick = () => handleLoadMoreQuestions();
  const isLast = currentIdx === total - 1;
  nextBtn.textContent = isLast ? '提交答卷 🏁' : '下一题 ▶';
  nextBtn.onclick = isLast ? () => handleFinish() : () => gotoQuestion(currentIdx + 1);
  prevBtn.onclick = () => gotoQuestion(currentIdx - 1);
}

function gotoQuestion(idx) {
  currentSession.currentIdx = idx;
  renderQuestion();
  window.scrollTo(0, 0);
}

async function handleAnswer(question, optionIdx, sessionId) {
  if (currentSession.answers[question.id]) return; // already answered

  const userAnswer = String(optionIdx);
  try {
    const res = await fetchJSON(`/api/quiz/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId: question.id, answer: userAnswer }),
    });
    currentSession.answers[question.id] = {
      userAnswer,
      isCorrect: res.isCorrect,
      correctAnswer: res.correctAnswer,
      explanation: res.explanation,
    };
    // Update the question's answer/explanation so the feedback shows
    question.answer = res.correctAnswer;
    question.explanation = res.explanation;
    renderQuestion();
  } catch (e) {
    console.error('handleAnswer error', e);
  }
}

async function handleFinish() {
  const { id, questions, answers } = currentSession;
  // Skip unanswered questions (don't submit invalid -1 index)
  // Just record them as missed in local answers map so the session can complete
  for (const q of questions) {
    if (!answers[q.id]) {
      answers[q.id] = { userAnswer: null, isCorrect: false, correctAnswer: null, explanation: null };
    }
  }
  try {
    await fetchJSON(`/api/quiz/${id}/complete`, { method: 'POST' });
  } catch (_) {}
  showResult();
}

async function handleLoadMoreQuestions() {
  if (!currentSession || reviewMode) return;
  const confirmed = window.confirm('确认继续拉取 10 道新题吗？');
  if (!confirmed) return;

  const loadMoreBtn = document.getElementById('btn-load-more-q');
  const originalText = loadMoreBtn.textContent;
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = '拉取中...';

  try {
    const res = await fetchJSON(`/api/quiz/${currentSession.id}/add-more`, {
      method: 'POST',
      body: JSON.stringify({
        count: 10,
        period: currentSession.options?.period,
        difficulty: currentSession.options?.difficulty,
      }),
    });
    currentSession.questions.push(...res.questions);
    showToast(`已成功拉取 ${res.questions.length} 道新题`, 'success');
    renderQuestion();
  } catch (e) {
    alert('拉取新题失败：' + (e.message || '未知错误'));
  } finally {
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = originalText;
  }
}

function showResult() {
  setVisible('quiz-container', false);
  setVisible('quiz-result', true);

  const { questions, answers } = currentSession;
  const total = questions.length;
  const correct = Object.values(answers).filter(a => a.isCorrect).length;
  const acc = total > 0 ? Math.round((correct / total) * 100) : 0;

  document.getElementById('result-correct').textContent = correct;
  document.getElementById('result-total').textContent = total;
  document.getElementById('result-accuracy').textContent = `正确率：${acc}%`;
  document.getElementById('result-emoji').textContent =
    acc >= 90 ? '🏆' : acc >= 70 ? '🎉' : acc >= 50 ? '📚' : '💪';

  document.getElementById('btn-review').onclick = () => {
    reviewMode = true;
    currentSession.currentIdx = 0;
    setVisible('quiz-result', false);
    setVisible('quiz-container', true);
    renderQuestion();
  };
  document.getElementById('btn-new-quiz').onclick = () => startQuiz({ count: 10 });
}

// ─────────────────────────────────────────────
// History
// ─────────────────────────────────────────────
let historyPage = 1;

async function loadHistory(page = 1) {
  historyPage = page;
  const data = await fetchJSON(`/api/quiz/sessions?page=${page}&limit=10`);
  const list = document.getElementById('history-list');
  if (!data.sessions.length) {
    list.innerHTML = '<p class="empty-state">暂无答题记录</p>';
    document.getElementById('history-pagination').innerHTML = '';
    return;
  }

  list.innerHTML = data.sessions.map(s => {
    const date = new Date(s.createdAt).toLocaleString('zh-CN');
    const acc = s.answeredCount > 0
      ? Math.round((s.correctCount / s.answeredCount) * 100) : 0;
    const statusBadge = s.status === 'completed'
      ? '<span class="badge badge-completed">已完成</span>'
      : '<span class="badge badge-in-progress">进行中</span>';
    const scheduledBadge = s.isScheduled
      ? '<span class="badge badge-scheduled">⏰ 自动</span>' : '';
    return `
      <div class="history-item" onclick="resumeSession(${s.id})">
        <div class="history-item-left">
          <div class="history-date">${date}</div>
          <div class="history-title">场次 #${s.id} ${statusBadge} ${scheduledBadge}</div>
          <div class="history-meta">共 ${s.totalQuestions} 题 · 已答 ${s.answeredCount} 题 · 正确 ${s.correctCount} 题</div>
        </div>
        <div>
          <div class="history-score">${s.correctCount}/${s.totalQuestions}</div>
          <div class="history-acc">正确率 ${s.answeredCount > 0 ? acc + '%' : '-'}</div>
        </div>
      </div>`;
  }).join('');

  // Pagination
  const totalPages = Math.ceil(data.total / 10);
  let pagi = '';
  for (let i = 1; i <= totalPages; i++) {
    pagi += `<button class="page-btn${i === page ? ' active-page' : ''}" onclick="loadHistory(${i})">${i}</button>`;
  }
  document.getElementById('history-pagination').innerHTML = pagi;
}

async function resumeSession(id) {
  showPage('quiz');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-page="quiz"]').classList.add('active');
  setVisible('quiz-loading', true);
  setVisible('quiz-container', false);
  setVisible('quiz-result', false);

  try {
    const data = await fetchJSON(`/api/quiz/${id}`);
    // Rebuild answers map from server data
    const answersMap = {};
    data.questions.forEach(q => {
      if (q.userAnswer !== null) {
        answersMap[q.id] = {
          userAnswer: q.userAnswer,
          isCorrect: q.isCorrect,
          correctAnswer: q.answer,
          explanation: q.explanation,
        };
      }
    });
    currentSession = {
      id,
      questions: data.questions,
      answers: answersMap,
      currentIdx: 0,
      options: {},
    };
    setVisible('quiz-loading', false);

    if (data.session.status === 'completed') {
      showResult();
    } else {
      setVisible('quiz-container', true);
      renderQuestion();
    }
  } catch (e) {
    setVisible('quiz-loading', false);
    alert('加载失败：' + e.message);
  }
}

document.getElementById('btn-refresh-history').addEventListener('click', () => loadHistory(historyPage));

// ─────────────────────────────────────────────
// Questions browser
// ─────────────────────────────────────────────
async function loadQuestions() {
  const search = document.getElementById('q-search').value;
  const period = document.getElementById('q-filter-period').value;
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (period) params.set('period', period);

  try {
    const questions = await fetchJSON(`/api/questions?${params}`);
    const list = document.getElementById('questions-list');
    if (!questions.length) {
      list.innerHTML = '<p class="empty-state">没有找到符合条件的题目</p>';
      return;
    }
    list.innerHTML = questions.map(q => {
      const opts = q.options.map((o, i) => `<li>${LETTERS[i]}. ${o}</li>`).join('');
      const correctIdxs = q.answer.split(',').map(s => parseInt(s.trim(), 10));
      const correctLetters = correctIdxs.map(i => LETTERS[i]).join('、');
      return `
        <div class="q-item">
          <div class="q-item-header">
            <span class="q-id">#${q.id}</span>
            <span class="tag">${PERIOD_LABELS[q.period] || q.period}</span>
            <span class="tag tag-diff">${DIFF_LABELS[q.difficulty] || ''}</span>
            <button class="q-toggle-btn" onclick="toggleExplanation(${q.id})">查看解析 ▼</button>
          </div>
          <div class="q-content">${q.content}</div>
          <ul style="padding-left:1.2rem;font-size:.875rem;color:var(--gray-600);margin-bottom:.5rem">${opts}</ul>
          <div class="q-answer-row">✅ 正确答案：<span class="q-answer-key">${correctLetters}</span></div>
          <div class="q-explanation hidden" id="exp-${q.id}">${q.explanation}</div>
          ${q.source ? `<div style="font-size:.75rem;color:var(--gray-400);margin-top:.4rem">📌 ${q.source}</div>` : ''}
        </div>`;
    }).join('');
  } catch (e) {
    document.getElementById('questions-list').innerHTML = '<p class="empty-state">加载失败，请重试</p>';
  }
}

function toggleExplanation(id) {
  const el = document.getElementById(`exp-${id}`);
  el.classList.toggle('hidden');
}

document.getElementById('btn-q-search').addEventListener('click', loadQuestions);
document.getElementById('q-search').addEventListener('keydown', e => {
  if (e.key === 'Enter') loadQuestions();
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
async function fetchJSON(url, opts = {}) {
  const res = await fetch(API + url, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || res.statusText);
  }
  return res.json();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.replaceChildren(toast);

  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = window.setTimeout(() => {
    toast.remove();
    toastTimer = null;
  }, 3000);
}

function setVisible(id, visible) {
  const el = document.getElementById(id);
  if (visible) el.classList.remove('hidden');
  else el.classList.add('hidden');
}

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
loadStats();
