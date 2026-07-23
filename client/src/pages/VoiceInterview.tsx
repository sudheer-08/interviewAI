import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { interviewService } from "../services/interviewService";
import type { InterviewSession, TranscriptItem } from "../services/interviewService";
import { useNotification } from "../context/NotificationContext";
import { 
  Mic, MicOff, Play, Square, AlertCircle, Loader2, 
  Volume2, VolumeX, Send, RefreshCw, Clock, ArrowRight, HelpCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const VoiceInterview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  // State Management
  const [interview, setInterview] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionCount, setQuestionCount] = useState(1);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  
  // Transcripts
  const [liveTranscript, setLiveTranscript] = useState("");
  const [transcriptsList, setTranscriptsList] = useState<TranscriptItem[]>([]);
  const [manualText, setManualText] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(30 * 60); // Default 30 mins
  
  // MediaRecorder & SpeechRecognition Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const speechStartRef = useRef<number>(0);

  // Start interview on mount
  useEffect(() => {
    const initInterview = async () => {
      if (!id) return;
      try {
        const response = await interviewService.start(id);
        if (response.success && response.data) {
          setInterview(response.data.interviewSession);
          setCurrentQuestion(response.data.currentQuestion);
          
          const durationMins = Number(response.data.interviewSession.duration) || 30;
          setTimeLeft(durationMins * 60);

          const transcriptResponse = await interviewService.getTranscript(id);
          const initialTranscripts = transcriptResponse.success ? transcriptResponse.data.transcripts : [];
          setTranscriptsList(initialTranscripts);
          
          // Speak only for a newly started session. Reloading a room keeps the existing turn intact.
          if (initialTranscripts.length <= 1) {
            speakQuestion(response.data.currentQuestion);
          }
        }
      } catch (err: any) {
        showToast("Initialization Failed", err.message || "Failed to start interview.", "error");
      }
    };

    initInterview();

    return () => {
      // Cleanup TTS and timers
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      stopUserSpeakingStreams();
    };
  }, [id]);

  // Global Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleEndInterview();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  // Setup Web Speech Recognition (STT)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let interimText = "";
        let finalOutput = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalOutput += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        setLiveTranscript(prev => {
          const base = prev.includes(finalOutput) ? prev : prev + " " + finalOutput;
          return base.trim();
        });
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error", e);
      };

      rec.onend = () => {
        // Automatically restart if user is speaking and hasn't explicitly stopped
        if (isUserSpeaking && !isMuted) {
          try { rec.start(); } catch {}
        }
      };

      recognitionRef.current = rec;
    }
  }, [isUserSpeaking, isMuted]);

  // AI Text-to-Speech (TTS)
  const speakQuestion = (text: string) => {
    if (!isTtsEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setIsAiSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to pick a premium natural sounding English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || 
                         voices.find(v => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      setIsAiSpeaking(false);
      // Auto trigger mic after AI finishes reading the question
      startAudioRecording();
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start Voice Recording & Speech Recognition
  const startAudioRecording = async () => {
    if (isMuted) return;
    
    stopUserSpeakingStreams();
    setLiveTranscript("");
    setManualText("");
    speechStartRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(200); // chunk size
      mediaRecorderRef.current = mediaRecorder;
      setIsUserSpeaking(true);

      // Start Speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Microphone access denied or error", err);
      showToast("Mic Blocked", "Could not access microphone. Feel free to type your responses.", "warning");
      setShowManualInput(true);
    }
  };

  // Stop Voice Streams
  const stopUserSpeakingStreams = () => {
    setIsUserSpeaking(false);

    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      mediaRecorderRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  // Submit Turn Answer
  const handleSubmitAnswer = async () => {
    stopUserSpeakingStreams();
    
    const finalAnswer = showManualInput ? manualText.trim() : liveTranscript.trim();
    if (!finalAnswer) {
      showToast("Response Empty", "Please speak or write your answer before submitting.", "warning");
      return;
    }

    setIsSubmitting(true);
    
    let audioBlob: Blob | null = null;
    if (audioChunksRef.current.length > 0) {
      audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    }

    const durationSeconds = speechStartRef.current > 0 
      ? Math.round((Date.now() - speechStartRef.current) / 1000) 
      : 5;

    try {
      if (!id) return;
      const response = await interviewService.submitAnswer(id, {
        audioBlob,
        transcript: finalAnswer,
        durationSeconds,
      });

      if (response.success && response.data) {
        const { followUp } = response.data;

        // Fetch latest transcripts list
        const transRes = await interviewService.getTranscript(id);
        if (transRes.success) {
          setTranscriptsList(transRes.data.transcripts);
        }

        setCurrentQuestion(followUp.question);
        setQuestionCount(prev => prev + 1);
        setLiveTranscript("");
        setManualText("");
        speakQuestion(followUp.question);
      }
    } catch (err: any) {
      showToast("Submit Error", err.message || "Failed to submit response.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // End entire session
  const handleEndInterview = async () => {
    stopUserSpeakingStreams();
    if (!id) return;
    setIsSubmitting(true);
    try {
      const response = await interviewService.end(id);
      if (response.success) {
        showToast("Interview Finished", "Granular AI scorecard generated!", "success");
        navigate(`/interview/${id}/feedback`);
      }
    } catch (err: any) {
      showToast("Error", err.message || "Failed to close session.", "error");
      navigate("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip AI Speaking
  const handleSkipAiTalk = () => {
    window.speechSynthesis?.cancel();
    setIsAiSpeaking(false);
    startAudioRecording();
  };

  // Format countdown
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner timer */}
      <div className="flex justify-between items-center bg-white dark:bg-card-dark px-6 py-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Mock Session Active
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-1.5 font-mono text-sm font-semibold">
            <Clock className="w-4 h-4 text-accent-indigo" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={handleEndInterview}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Main Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Visual Chamber (Avatar / Mic) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 flex flex-col items-center justify-center relative min-h-[350px]">
            {/* Background vector */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/5 to-accent-indigo/5 pointer-events-none rounded-3xl" />

            {/* AI Avatar */}
            <div className="relative mb-8">
              <div 
                className={`w-32 h-32 rounded-full bg-gradient-to-tr from-accent-purple to-accent-indigo flex items-center justify-center text-white shadow-2xl relative z-10 ${
                  isAiSpeaking ? "avatar-active" : ""
                }`}
              >
                <Volume2 className={`w-12 h-12 ${isAiSpeaking ? "scale-110" : ""} transition-transform`} />
              </div>
              
              {/* Outer pulsing glow rings */}
              {isAiSpeaking && (
                <>
                  <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-accent-indigo/35 animate-ping opacity-75" />
                  <div className="absolute -inset-4 rounded-full border border-accent-purple/20 animate-pulse" />
                </>
              )}
            </div>

            {/* Current Question Text */}
            <div className="text-center max-w-xl space-y-3 z-10">
              <span className="text-[10px] font-bold text-accent-indigo dark:text-accent-purple uppercase tracking-widest block">
                Question {questionCount}
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-850 dark:text-white leading-relaxed">
                {currentQuestion || "Initializing mock interviewer..."}
              </p>
              
              {isAiSpeaking && (
                <button
                  onClick={handleSkipAiTalk}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white underline transition-colors pt-2 block mx-auto cursor-pointer"
                >
                  Skip speaking & answer
                </button>
              )}
            </div>

            {/* User Speech volume wave visualizer */}
            {isUserSpeaking && (
              <div className="absolute bottom-6 flex items-center gap-1">
                <div className="w-1 h-3 bg-accent-cyan rounded-full voice-bar" />
                <div className="w-1 h-5 bg-accent-indigo rounded-full voice-bar" />
                <div className="w-1 h-8 bg-accent-purple rounded-full voice-bar" />
                <div className="w-1 h-10 bg-accent-indigo rounded-full voice-bar" />
                <div className="w-1 h-8 bg-accent-purple rounded-full voice-bar" />
                <div className="w-1 h-5 bg-accent-indigo rounded-full voice-bar" />
                <div className="w-1 h-3 bg-accent-cyan rounded-full voice-bar" />
              </div>
            )}
          </div>

          {/* Interactive controls */}
          <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Audio Settings */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isTtsEnabled 
                    ? "bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-250" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                }`}
                title={isTtsEnabled ? "Mute Coach voice read" : "Unmute Coach voice"}
              >
                {isTtsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className={`text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                  showManualInput
                    ? "bg-accent-indigo text-white border-accent-indigo"
                    : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                }`}
              >
                {showManualInput ? "Use Voice mic" : "Type Answer instead"}
              </button>
            </div>

            {/* Speaking actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!showManualInput ? (
                <>
                  {isUserSpeaking ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent-indigo hover:bg-accent-purple text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Evaluating response...
                        </>
                      ) : (
                        <>
                          <Square className="w-4 h-4 fill-current" />
                          Submit Answer
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={startAudioRecording}
                      disabled={isAiSpeaking || isSubmitting}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Mic className="w-4 h-4" />
                      Answer verbally
                    </button>
                  )}
                </>
              ) : (
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    placeholder="Write your answer..."
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-accent-indigo text-sm"
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting || !manualText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-accent-indigo text-white hover:bg-accent-purple transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User's live speech text preview block */}
          {isUserSpeaking && liveTranscript && (
            <div className="p-4 rounded-xl bg-accent-indigo/5 border border-accent-indigo/10 space-y-1.5">
              <span className="text-[10px] font-bold text-accent-indigo uppercase tracking-wider block">Live speech-to-text transcript</span>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
                "{liveTranscript}..."
              </p>
            </div>
          )}
        </div>

        {/* Right Session Transcript list */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/80 space-y-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white my-0 flex items-center gap-1.5">
            <Volume2 className="w-4.5 h-4.5 text-accent-indigo" />
            Session Logs
          </h3>

          <div className="space-y-4">
            {transcriptsList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-600">
                Conversation turns will print here as they occur.
              </div>
            ) : (
              transcriptsList.map((turn) => (
                <div key={turn.id} className="space-y-1 text-xs">
                  <span className={`font-bold ${
                    turn.speaker === "interviewer" 
                      ? "text-accent-indigo dark:text-accent-purple" 
                      : "text-slate-800 dark:text-white"
                  }`}>
                    {turn.speaker === "interviewer" ? "AI Coach" : "You"}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                    {turn.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterview;
