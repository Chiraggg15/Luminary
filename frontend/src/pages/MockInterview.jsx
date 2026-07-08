import { useState, useEffect, useRef } from 'react';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  MessageSquare, Cpu, ChevronDown, ChevronRight, Hash,
  Play, ArrowRight, Timer, CheckCircle2, XCircle, Star,
  RotateCcw, BookOpen
} from 'lucide-react';

// ── Timer hook ───────────────────────────────────────────────────────────────
function useCountdown(seconds, running) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => (r > 0 ? r - 1 : 0));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const pct  = (remaining / seconds) * 100;
  const urgent = remaining <= 30;

  return { remaining, fmt: fmt(remaining), pct, urgent };
}

// ── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 36, c = 2 * Math.PI * r;
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="90" height="90" className="-rotate-90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="#27272a" strokeWidth="6" />
      <circle
        cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={c} strokeDashoffset={c - (score / 100) * c}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="45" y="45" textAnchor="middle" dominantBaseline="central"
        className="rotate-90" transform="rotate(90,45,45)"
        fill={color} fontSize="18" fontWeight="bold">
        {score}
      </text>
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MockInterview() {
  const [formData, setFormData] = useState({ job_title: '', experience: 0, skills: '' });
  const [questions,     setQuestions]     = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(0);

  // Practice mode state
  const [mode,            setMode]            = useState('review');  // 'review' | 'practice'
  const [practiceIndex,   setPracticeIndex]   = useState(0);
  const [userAnswer,      setUserAnswer]       = useState('');
  const [timerRunning,    setTimerRunning]     = useState(false);
  const [evaluation,      setEvaluation]       = useState(null);
  const [evaluating,      setEvaluating]       = useState(false);
  const [practiceResults, setPracticeResults]  = useState([]); // {score, q, a, evaluation}

  const PRACTICE_TIME = 120; // 2 minutes per question
  const { remaining, fmt, pct, urgent } = useCountdown(PRACTICE_TIME, timerRunning);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (remaining === 0 && timerRunning && mode === 'practice') {
      setTimerRunning(false);
      handleEvaluate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, timerRunning]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.job_title) { toast.error('Job Title is required'); return; }
    setLoading(true);
    setExpandedIndex(0);
    setMode('review');
    setPracticeResults([]);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await interviewAPI.generateQuestions({
        ...formData, experience: Number(formData.experience), skills: skillsArray, question_count: 6
      });
      setQuestions(res.data.questions);
      toast.success('Interview questions generated.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const startPractice = () => {
    setPracticeIndex(0);
    setUserAnswer('');
    setEvaluation(null);
    setPracticeResults([]);
    setMode('practice');
    setTimerRunning(true);
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) { toast.error('Please write an answer first'); return; }
    setTimerRunning(false);
    setEvaluating(true);
    const q = questions[practiceIndex];
    try {
      const res = await interviewAPI.evaluateAnswer({
        question:     q.question,
        user_answer:  userAnswer,
        model_answer: q.answer,
        job_title:    formData.job_title,
      });
      const ev = res.data.evaluation;
      setEvaluation(ev);
      setPracticeResults(prev => [...prev, { ...ev, question: q.question, userAnswer }]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (practiceIndex + 1 >= questions.length) {
      setMode('summary');
      return;
    }
    setPracticeIndex(i => i + 1);
    setUserAnswer('');
    setEvaluation(null);
    setTimerRunning(true);
  };

  const avgScore = practiceResults.length
    ? Math.round(practiceResults.reduce((s, r) => s + r.score, 0) / practiceResults.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto animate-[fadeIn_0.3s_ease-out] w-full pt-4">
      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <MessageSquare size={28} className="text-emerald-500" />
            Technical Interview Prep
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl">
            Generate tailored Q&A, then enter Practice Mode to test yourself against a countdown timer with AI feedback.
          </p>
        </div>
        {questions.length > 0 && mode !== 'practice' && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setMode(mode === 'review' ? 'review' : 'review')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'review' ? 'bg-zinc-800 border-zinc-600 text-white' : 'border-zinc-700 text-zinc-400 hover:text-white'}`}
            >
              <BookOpen size={15} /> Review
            </button>
            <button
              onClick={startPractice}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 transition-colors"
            >
              <Play size={15} /> Practice Mode
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ── Left: Config Form ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-5">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
              <Cpu size={16} className="text-emerald-500" /> Config
            </h3>
            <form className="space-y-4" onSubmit={handleGenerate}>
              <div>
                <label className="label-glass">Target Role</label>
                <input name="job_title" className="input-glass text-sm px-3 py-2" value={formData.job_title} onChange={handleChange} placeholder="e.g. Data Scientist" required />
              </div>
              <div>
                <label className="label-glass">Experience (Years)</label>
                <input type="number" name="experience" className="input-glass text-sm px-3 py-2" value={formData.experience} onChange={handleChange} min="0" max="30" />
              </div>
              <div>
                <label className="label-glass">Core Stack</label>
                <input name="skills" className="input-glass text-sm px-3 py-2" value={formData.skills} onChange={handleChange} placeholder="Python, SQL" />
              </div>
              <button type="submit" className="btn-secondary w-full text-xs uppercase tracking-widest mt-2" disabled={loading}>
                {loading ? 'Processing...' : 'Generate Q&A'}
              </button>
            </form>
          </div>

          {/* Practice summary mini stats */}
          {practiceResults.length > 0 && (
            <div className="glass-panel p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Session Stats</p>
              <p className="text-2xl font-bold text-white">{avgScore}<span className="text-base text-zinc-500">/100</span></p>
              <p className="text-xs text-zinc-400">{practiceResults.length} / {questions.length} answered</p>
            </div>
          )}
        </div>

        {/* ── Right: Main Panel ── */}
        <div className="lg:col-span-3">

          {/* ══ REVIEW MODE ══ */}
          {mode === 'review' && (
            questions.length === 0 ? (
              <div className="glass-panel h-full flex flex-col items-center justify-center p-16 text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-6">
                  <Hash size={24} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">No active session</h3>
                <p className="text-zinc-500 text-sm max-w-sm">Use the config panel to generate interview questions for your target role.</p>
              </div>
            ) : (
              <div className="glass-panel overflow-hidden border-zinc-800">
                <div className="bg-zinc-900/50 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-widest">Question Bank</h3>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">{questions.length} Items</span>
                </div>
                <div className="divide-y divide-zinc-800/80">
                  {questions.map((q, i) => {
                    const isExpanded = expandedIndex === i;
                    const result = practiceResults[i];
                    return (
                      <div key={i} className="group">
                        <button
                          onClick={() => setExpandedIndex(isExpanded ? null : i)}
                          className={`w-full text-left px-6 py-5 flex items-start gap-4 transition-colors ${isExpanded ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'}`}
                        >
                          <div className={`mt-0.5 p-1 rounded-sm border ${isExpanded ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] bg-emerald-500 text-black' : 'border-zinc-700 text-zinc-500 group-hover:border-zinc-500'}`}>
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                          <div className="flex-1 pr-6">
                            <span className={`text-sm font-mono mr-3 font-semibold ${isExpanded ? 'text-emerald-500' : 'text-zinc-600'}`}>{(i + 1).toString().padStart(2, '0')}</span>
                            <span className={isExpanded ? 'text-white font-medium' : 'text-zinc-300'}>{q.question}</span>
                          </div>
                          {result && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${result.score >= 70 ? 'text-emerald-400 bg-emerald-500/10' : result.score >= 50 ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'}`}>
                              {result.score}%
                            </span>
                          )}
                        </button>
                        <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="pl-10">
                            <div className="border-l-2 border-emerald-500/30 pl-5 py-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2 block">Optimal Structure</span>
                              <p className="text-zinc-400 text-sm leading-relaxed font-serif whitespace-pre-wrap">{q.answer}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* ══ PRACTICE MODE ══ */}
          {mode === 'practice' && questions[practiceIndex] && (
            <div className="glass-panel overflow-hidden">
              {/* Progress + Timer Header */}
              <div className="bg-zinc-900/60 px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Question {practiceIndex + 1} / {questions.length}
                  </span>
                  <div className="h-1.5 w-32 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${((practiceIndex) / questions.length) * 100}%` }} />
                  </div>
                </div>
                {/* Countdown */}
                <div className={`flex items-center gap-2 font-mono font-bold text-sm px-3 py-1.5 rounded-lg border ${urgent ? 'text-red-400 bg-red-500/10 border-red-500/30 animate-pulse' : 'text-zinc-300 bg-zinc-800 border-zinc-700'}`}>
                  <Timer size={14} />
                  {fmt}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Timer arc */}
                <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Question */}
                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2">Question</p>
                  <p className="text-white font-medium leading-relaxed">{questions[practiceIndex].question}</p>
                </div>

                {/* Answer textarea (only when not evaluated) */}
                {!evaluation && (
                  <>
                    <div>
                      <label className="label-glass">Your Answer</label>
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="input-glass w-full resize-none text-sm"
                        rows={6}
                        placeholder="Type your answer here... Think about structure: Situation → Task → Action → Result"
                      />
                    </div>
                    <button
                      onClick={handleEvaluate}
                      disabled={evaluating || !userAnswer.trim()}
                      className="btn-accent w-full flex items-center justify-center gap-2"
                    >
                      {evaluating
                        ? <><div className="w-4 h-4 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />Evaluating...</>
                        : <><Star size={16} /> Submit & Get Feedback</>
                      }
                    </button>
                  </>
                )}

                {/* Evaluation result */}
                {evaluation && (
                  <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
                    {/* Score */}
                    <div className="flex items-center gap-6 bg-zinc-800/40 border border-zinc-700/40 rounded-xl p-5">
                      <ScoreRing score={evaluation.score} />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">AI Score</p>
                        <p className="text-zinc-200 text-sm italic leading-relaxed">"{evaluation.verdict}"</p>
                      </div>
                    </div>

                    {/* Strengths */}
                    {evaluation.strengths && (
                      <div className="flex gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Strengths</p>
                          <p className="text-sm text-zinc-300">{evaluation.strengths}</p>
                        </div>
                      </div>
                    )}

                    {/* Improvements */}
                    {evaluation.improvements && (
                      <div className="flex gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                        <XCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Improve</p>
                          <p className="text-sm text-zinc-300">{evaluation.improvements}</p>
                        </div>
                      </div>
                    )}

                    {/* Model Answer */}
                    <details className="group">
                      <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 flex items-center gap-2 py-2">
                        <ChevronRight size={14} className="group-open:rotate-90 transition-transform" /> View Model Answer
                      </summary>
                      <div className="mt-3 border-l-2 border-zinc-700 pl-4">
                        <p className="text-zinc-400 text-sm leading-relaxed font-serif">{questions[practiceIndex].answer}</p>
                      </div>
                    </details>

                    <button onClick={nextQuestion} className="btn-primary w-full flex items-center justify-center gap-2">
                      {practiceIndex + 1 >= questions.length ? 'View Summary' : <><ArrowRight size={16} /> Next Question</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ SUMMARY MODE ══ */}
          {mode === 'summary' && (
            <div className="glass-panel p-8 space-y-6 animate-[fadeIn_0.4s_ease-out]">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Session Complete</p>
                <div className="flex justify-center mb-2">
                  <ScoreRing score={avgScore} />
                </div>
                <p className="text-zinc-400 text-sm">Average score across {practiceResults.length} questions</p>
              </div>

              <div className="divide-y divide-zinc-800">
                {practiceResults.map((r, i) => (
                  <div key={i} className="py-4 flex items-start gap-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 mt-0.5 ${r.score >= 70 ? 'text-emerald-400 bg-emerald-500/10' : r.score >= 50 ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {r.score}%
                    </span>
                    <div>
                      <p className="text-zinc-200 text-sm font-medium mb-1">{r.question}</p>
                      <p className="text-zinc-500 text-xs">{r.verdict}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={startPractice} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <RotateCcw size={15} /> Retry Session
                </button>
                <button onClick={() => setMode('review')} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <BookOpen size={15} /> Review Answers
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
