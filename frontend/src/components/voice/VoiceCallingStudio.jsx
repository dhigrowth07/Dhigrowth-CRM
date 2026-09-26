import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Play,
  Clock,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Users,
  Zap,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VoiceCallingStudio = () => {
  const { voiceLogs, voiceCall, startSimulatedCall, endSimulatedCall, showToast } = useApp();
  const [dialNumber, setDialNumber] = useState('+91 98765 43210');
  const [callTimer, setCallTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (voiceCall.isActive) {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [voiceCall.isActive]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = (e) => {
    e?.preventDefault();
    if (!dialNumber.trim()) return;
    startSimulatedCall(`Contact (${dialNumber})`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[var(--text-main)]">Speech-to-Speech AI Voice Calling</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Sub-second Latency
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Ultra-realistic voice AI agents that handle outbound qualification calls and inbound WhatsApp customer queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Voice Latency: 720ms (Avg)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Call Stage (5 cols) */}
        <div className="lg:col-span-5 glow-card p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              Live Interactive Voice Canvas
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                voiceCall.isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {voiceCall.isActive ? `● ${voiceCall.status}` : 'Idle'}
            </span>
          </div>

          {/* Center Call Visualizer */}
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="relative">
              <div
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                  voiceCall.isActive
                    ? 'bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-400 shadow-2xl shadow-rose-600/40 ring-8 ring-rose-500/20 scale-105'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border-strong)]'
                }`}
              >
                <Mic className={`w-10 h-10 ${voiceCall.isActive ? 'text-white' : 'text-[var(--text-dim)]'}`} />
              </div>

              {voiceCall.isActive && (
                <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                  <span className="bg-slate-900 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    {formatTimer(callTimer)}
                  </span>
                </div>
              )}
            </div>

            {/* Audio Waveform Equalizer */}
            {voiceCall.isActive ? (
              <div className="flex items-center gap-1.5 h-10 pt-2">
                <span className="w-1.5 bg-rose-500 rounded-full wave-bar-1" />
                <span className="w-1.5 bg-purple-500 rounded-full wave-bar-2" />
                <span className="w-1.5 bg-emerald-500 rounded-full wave-bar-3" />
                <span className="w-1.5 bg-amber-500 rounded-full wave-bar-4" />
                <span className="w-1.5 bg-blue-500 rounded-full wave-bar-5" />
                <span className="w-1.5 bg-purple-500 rounded-full wave-bar-2" />
                <span className="w-1.5 bg-rose-500 rounded-full wave-bar-1" />
              </div>
            ) : (
              <div className="text-xs text-[var(--text-dim)] font-mono">
                Click "Start AI Call" to simulate speech conversation
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            {!voiceCall.isActive ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[var(--text-muted)]">Destination Phone / Lead</label>
                  <input
                    type="text"
                    value={dialNumber}
                    onChange={(e) => setDialNumber(e.target.value)}
                    className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-3 py-2 rounded-xl text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={handleStartCall}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Start Outbound AI Voice Call</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={endSimulatedCall}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30 transition-all"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Voice Call</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Transcription & Call History (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Call Transcript Stream */}
          <div className="glow-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Real-Time Voice Transcript
              </h3>
              <span className="text-[10px] font-mono text-purple-400">Speech-to-Speech Neural Model</span>
            </div>

            <div className="min-h-[140px] max-h-48 overflow-y-auto space-y-2 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] text-xs">
              {voiceCall.transcript.length === 0 ? (
                <div className="text-[var(--text-dim)] italic text-center py-6">
                  {voiceCall.isActive ? 'Listening for speech input...' : 'No active call in progress.'}
                </div>
              ) : (
                voiceCall.transcript.map((t, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        t.speaker === 'AI' ? 'text-purple-400' : 'text-emerald-400'
                      }`}
                    >
                      {t.speaker}:
                    </span>
                    <p className="text-[var(--text-main)] pl-2">{t.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent AI Voice Call Logs */}
          <div className="glow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                Recent Voice Agent Call Logs
              </h3>
              <span className="text-[10px] font-mono text-[var(--text-dim)]">{voiceLogs.length} total logged</span>
            </div>

            <div className="space-y-3">
              {voiceLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[var(--text-main)]">{log.contact}</div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-purple-400">{log.direction}</span>
                      <span>·</span>
                      <span className="text-[var(--text-dim)]">{log.duration}</span>
                    </div>
                  </div>

                  <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                    <strong className="text-[var(--text-main)]">AI Summary:</strong> {log.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-[var(--border-subtle)]">
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      {log.status}
                    </span>
                    <span className="text-[var(--text-dim)]">{log.agentModel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
