import React, { useState } from 'react';
import { X, Play, RotateCcw, ShieldAlert, ShieldCheck, Sparkles, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { ByeDpiConfig } from '../types/byedpi';
import { buildCommandString } from '../utils/commandParser';

interface PacketSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ByeDpiConfig;
}

export const PacketSimulatorModal: React.FC<PacketSimulatorModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  const currentCmd = buildCommandString(config);

  const steps = [
    {
      title: 'Step 1: Outgoing Request Initiation',
      description: 'Your browser or app initiates an encrypted HTTPS connection with TLS ClientHello payload.',
      clientPacket: 'TLS ClientHello [SNI: blocked-site.com]',
      dpiReaction: 'Inspection engine waiting at ISP gateway...',
      destState: 'Listening on port 443',
      status: 'pending'
    },
    {
      title: 'Step 2: ByeDPI Stream Segmentation (-s / -r)',
      description: `TCP data is segmented at position ${config.splitPosition}${config.splitAnchor === '+s' ? ' (SNI boundary)' : ''}. The SNI string is deliberately chopped in half.`,
      clientPacket: `Segment #1: [Bytes 0..${config.splitPosition}] + Segment #2: [Remaining bytes]`,
      dpiReaction: 'Cannot match forbidden hostname in partial chunk',
      destState: 'Awaiting remaining TCP segments',
      status: 'active'
    },
    {
      title: 'Step 3: Fake Decoy Packet Injection (-f, -n, -t)',
      description: `A decoy packet with whitelisted SNI "${config.fakeSni}" and low TTL (${config.fakeTtl}) is injected ahead of the payload.`,
      clientPacket: `Decoy: [SNI: ${config.fakeSni}, TTL=${config.fakeTtl}]`,
      dpiReaction: `DPI inspects decoy -> Validates "${config.fakeSni}" -> Approves flow!`,
      destState: `Decoy expires at hop ${config.fakeTtl} and drops (never reaches server)`,
      status: 'success'
    },
    {
      title: 'Step 4: TCP Out-of-Order Delivery (-d)',
      description: 'The genuine second segment is transmitted out-of-order, bypassing stale inspection buffers.',
      clientPacket: 'Segment #2 sent before Segment #1 retransmission',
      dpiReaction: 'Out-of-order sequence skipped by DPI fast-path',
      destState: 'TCP buffer reassembled correctly by target OS',
      status: 'success'
    },
    {
      title: 'Step 5: Handshake Completed & Data Flows',
      description: 'Connection established! Video streams, voice calls, and articles stream with zero buffering.',
      clientPacket: 'Full duplex encrypted TLS tunnel open',
      dpiReaction: 'DPI sees only randomized ciphertext',
      destState: '200 OK / TLS Session Established',
      status: 'success'
    }
  ];

  const current = steps[activeStep];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      setActiveStep(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl bg-slate-900 border border-teal-500/30 md-elevation-3">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">DPI Packet Evasion Simulator</h3>
              <p className="text-xs text-slate-400">How ByeDPI bypasses Deep Packet Inspection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Command */}
        <div className="mt-4 p-2.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-teal-300 flex items-center gap-2">
          <span className="text-slate-500 font-bold">$</span>
          <span className="truncate">ciadpi {currentCmd}</span>
        </div>

        {/* Visual Animation Diagram */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
          {/* Nodes Bar */}
          <div className="flex items-center justify-between text-center relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center text-xs font-bold">
                App
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">Your Device</span>
            </div>

            <div className="flex-1 px-2 flex items-center justify-center">
              <div className="h-0.5 w-full bg-gradient-to-r from-teal-500/50 via-amber-500/50 to-emerald-500/50 relative">
                <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400">
                  TTL: {config.fakeTtl}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-xs font-bold">
                DPI
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">ISP Firewall</span>
            </div>

            <div className="flex-1 px-2 flex items-center justify-center">
              <div className="h-0.5 w-full bg-gradient-to-r from-amber-500/50 to-emerald-500/50" />
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-xs font-bold">
                Web
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">Destination</span>
            </div>
          </div>

          {/* Step Progress indicators */}
          <div className="flex items-center gap-1.5 mt-5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i === activeStep
                    ? 'bg-teal-400 shadow-sm shadow-teal-400'
                    : i < activeStep
                    ? 'bg-teal-600'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Explanation Card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              {current.title}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {activeStep + 1} / {steps.length}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            {current.description}
          </p>

          <div className="space-y-1.5 pt-2 text-xs font-mono">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Payload:</span>
              <span className="text-teal-300 font-semibold">{current.clientPacket}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">DPI Filter:</span>
              <span className="text-amber-300 font-semibold">{current.dpiReaction}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Target Server:</span>
              <span className="text-emerald-300 font-semibold">{current.destState}</span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 mt-5 pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveStep(0)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <span>{activeStep === steps.length - 1 ? 'Start Over' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
