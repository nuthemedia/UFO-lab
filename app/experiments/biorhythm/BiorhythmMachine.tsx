"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./biorhythm.module.css";

type MenuId = "today" | "twoWeeks" | "pair" | "pairDate";
type Phase = "start" | "coin" | "menu" | "input" | "analyzing" | "result";
type RhythmKey = "physical" | "emotional" | "intellectual";
type InputField = "birth" | "partner" | "target";
type RhythmValues = Record<RhythmKey, number>;

type MenuItem = {
  id: MenuId;
  label: string;
  crtLabel: string;
  needsPartner: boolean;
  needsTargetDate: boolean;
};

type DiagnosisResult = {
  main: RhythmValues;
  partner: RhythmValues | null;
  match: { physical: number; emotional: number; intellectual: number; total: number } | null;
  twoWeeks: Array<{ date: string; values: RhythmValues }>;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const rhythmKeys: RhythmKey[] = ["physical", "emotional", "intellectual"];
const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];
const demoWaves = [
  "0,54 10,28 20,18 30,29 40,55 50,76 60,82 70,66 80,38 90,20 100,24",
  "0,25 10,34 20,54 30,73 40,81 50,70 60,48 70,28 80,18 90,27 100,50",
  "0,76 10,66 20,43 30,24 40,19 50,33 60,58 70,77 80,80 90,62 100,36",
];

const menuItems: MenuItem[] = [
  { id: "today", label: "今日のバロメーター", crtLabel: "キョウ ノ バロメーター", needsPartner: false, needsTargetDate: false },
  { id: "twoWeeks", label: "2週間バイオリズム", crtLabel: "2シュウカン バイオリズム", needsPartner: false, needsTargetDate: false },
  { id: "pair", label: "ふたりの相性", crtLabel: "フタリ ノ アイショウ", needsPartner: true, needsTargetDate: false },
  { id: "pairDate", label: "当日の相性", crtLabel: "トウジツ ノ アイショウ", needsPartner: true, needsTargetDate: true },
];

const rhythmKana: Record<RhythmKey, string> = {
  physical: "シンタイ",
  emotional: "カンジョウ",
  intellectual: "チセイ",
};

function todayDateValue() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function compactToDateValue(compact: string) {
  if (!/^\d{8}$/.test(compact)) return null;

  const year = Number(compact.slice(0, 4));
  const month = Number(compact.slice(4, 6));
  const day = Number(compact.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function compactDisplay(compact: string) {
  const padded = compact.padEnd(8, "_");
  return `${padded.slice(0, 4)}.${padded.slice(4, 6)}.${padded.slice(6, 8)}`;
}

function dateToUtcDay(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function daysBetween(birthDate: string, targetDate: string) {
  return Math.floor(dateToUtcDay(targetDate) - dateToUtcDay(birthDate));
}

function rhythmValue(days: number, cycle: number) {
  return Math.sin((2 * Math.PI * days) / cycle);
}

function calculateRhythms(birthDate: string, targetDate: string): RhythmValues {
  const days = daysBetween(birthDate, targetDate);

  return {
    physical: rhythmValue(days, 23),
    emotional: rhythmValue(days, 28),
    intellectual: rhythmValue(days, 33),
  };
}

function toPercent(value: number) {
  return Math.round(value * 100);
}

function formatPercent(value: number) {
  const percent = toPercent(value);
  return `${percent > 0 ? "+" : ""}${percent}%`;
}

function scoreFromDifference(first: number, second: number) {
  return Math.max(0, Math.min(100, Math.round((1 - Math.abs(first - second) / 2) * 100)));
}

function compatibility(first: RhythmValues, second: RhythmValues) {
  const physical = scoreFromDifference(first.physical, second.physical);
  const emotional = scoreFromDifference(first.emotional, second.emotional);
  const intellectual = scoreFromDifference(first.intellectual, second.intellectual);
  const total = Math.round((physical + emotional + intellectual) / 3);

  return { physical, emotional, intellectual, total };
}

function addDays(dateValue: string, offset: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function displayDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-");
  return `${year}.${month}.${day}`;
}

function levelText(value: number) {
  const percent = toPercent(value);

  if (percent >= 65) return "コウチョウ";
  if (percent >= 20) return "ヤヤ コウチョウ";
  if (percent > -20) return "ニュートラル";
  if (percent > -65) return "ヤヤ テイカ";
  return "テイカ";
}

type SoundType = "tap" | "start" | "ok" | "error" | "print";

const htmlSoundPatterns: Record<SoundType, Array<{ frequency: number; duration: number }>> = {
  tap: [{ frequency: 620, duration: 0.1 }],
  start: [
    { frequency: 440, duration: 0.14 },
    { frequency: 660, duration: 0.14 },
    { frequency: 880, duration: 0.18 },
  ],
  ok: [
    { frequency: 740, duration: 0.1 },
    { frequency: 980, duration: 0.12 },
  ],
  error: [{ frequency: 180, duration: 0.24 }],
  print: [
    { frequency: 110, duration: 0.08 },
    { frequency: 135, duration: 0.08 },
    { frequency: 95, duration: 0.12 },
  ],
};

function isLikelyIos() {
  const platform = navigator.platform || "";
  const userAgent = navigator.userAgent || "";

  return /iPad|iPhone|iPod/.test(userAgent) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function makeWavDataUri(pattern: Array<{ frequency: number; duration: number }>, volume = 0.28) {
  const sampleRate = 22050;
  const gapSamples = Math.floor(sampleRate * 0.025);
  const samples: number[] = [];

  for (const tone of pattern) {
    const toneSamples = Math.floor(sampleRate * tone.duration);

    for (let index = 0; index < toneSamples; index += 1) {
      const phase = (index * tone.frequency) / sampleRate;
      const envelope = Math.min(1, index / 160, (toneSamples - index) / 220);
      const sample = (phase % 1 < 0.5 ? 1 : -1) * volume * envelope;
      samples.push(Math.max(-1, Math.min(1, sample)));
    }

    for (let index = 0; index < gapSamples; index += 1) {
      samples.push(0);
    }
  }

  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  let offset = 0;

  function writeString(value: string) {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset, value.charCodeAt(index));
      offset += 1;
    }
  }

  writeString("RIFF");
  view.setUint32(offset, 36 + dataSize, true);
  offset += 4;
  writeString("WAVE");
  writeString("fmt ");
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate * 2, true);
  offset += 4;
  view.setUint16(offset, 2, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2;
  writeString("data");
  view.setUint32(offset, dataSize, true);
  offset += 4;

  for (const sample of samples) {
    view.setInt16(offset, Math.round(sample * 32767), true);
    offset += 2;
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return `data:audio/wav;base64,${btoa(binary)}`;
}

function useMachineAudio() {
  const contextRef = useRef<AudioContext | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const htmlSoundUrisRef = useRef<Partial<Record<SoundType, string>>>({});
  const shouldUseHtmlAudioRef = useRef<boolean | null>(null);

  function ensureContext() {
    if (!contextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return null;

      contextRef.current = new AudioContextClass();
    }

    return contextRef.current;
  }

  function playTone(
    context: AudioContext,
    frequency: number,
    startAt: number,
    duration: number,
    volume: number,
    oscillatorType: OscillatorType,
  ) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(volume, startAt + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  function beep(enabled: boolean, type: SoundType) {
    if (!enabled) return;

    playHtmlBeep(type);

    const context = ensureContext();
    if (!context) return;

    const play = () => {
      const now = context.currentTime + 0.015;

      if (type === "start") {
        playTone(context, 440, now, 0.16, 0.28, "square");
        playTone(context, 660, now + 0.17, 0.16, 0.28, "square");
        playTone(context, 880, now + 0.34, 0.22, 0.26, "square");
        return;
      }

      if (type === "ok") {
        playTone(context, 740, now, 0.12, 0.2, "square");
        playTone(context, 980, now + 0.11, 0.13, 0.18, "square");
        return;
      }

      if (type === "error") {
        playTone(context, 180, now, 0.28, 0.24, "sawtooth");
        return;
      }

      if (type === "print") {
        playTone(context, 110, now, 0.1, 0.24, "sawtooth");
        playTone(context, 135, now + 0.1, 0.1, 0.22, "sawtooth");
        playTone(context, 95, now + 0.2, 0.16, 0.2, "sawtooth");
        return;
      }

      playTone(context, 620, now, 0.11, 0.2, "square");
    };

    if (context.state === "suspended") {
      void context.resume();
      play();
      return;
    }

    play();
  }

  function unlock(enabled: boolean) {
    if (!enabled) return;

    primeHtmlAudio();

    const context = ensureContext();
    if (!context) return;

    if (context.state === "suspended") {
      void context.resume();
    }

    playTone(context, 1, context.currentTime + 0.001, 0.01, 0.0001, "square");
  }

  function shouldUseHtmlAudio() {
    if (shouldUseHtmlAudioRef.current === null) {
      shouldUseHtmlAudioRef.current = isLikelyIos();
    }

    return shouldUseHtmlAudioRef.current;
  }

  function soundUri(type: SoundType) {
    if (!htmlSoundUrisRef.current[type]) {
      htmlSoundUrisRef.current[type] = makeWavDataUri(htmlSoundPatterns[type]);
    }

    return htmlSoundUrisRef.current[type];
  }

  function primeHtmlAudio() {
    if (!shouldUseHtmlAudio()) return;

    const audio = new Audio(soundUri("tap"));
    audio.volume = 0.001;
    audio.preload = "auto";
    htmlAudioRef.current = audio;
    void audio.play().catch(() => undefined);
  }

  function playHtmlBeep(type: SoundType) {
    if (!shouldUseHtmlAudio()) return;

    const audio = htmlAudioRef.current || new Audio();
    audio.pause();
    audio.src = soundUri(type) || "";
    audio.volume = 0.8;
    audio.currentTime = 0;
    htmlAudioRef.current = audio;
    void audio.play().catch(() => undefined);
  }

  return { beep, unlock };
}

export function BiorhythmMachine() {
  const [phase, setPhase] = useState<Phase>("start");
  const [selectedMenu, setSelectedMenu] = useState<MenuId>("today");
  const [activeField, setActiveField] = useState<InputField>("birth");
  const [birthInput, setBirthInput] = useState("");
  const [partnerInput, setPartnerInput] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [printed, setPrinted] = useState(false);
  const [error, setError] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const analyzingTimerRef = useRef<number | null>(null);
  const coinTimerRef = useRef<number | null>(null);
  const { beep, unlock } = useMachineAudio();

  const selectedItem = menuItems.find((item) => item.id === selectedMenu) || menuItems[0];
  const menuButtonsEnabled = phase === "menu" || phase === "input";

  const activeInput = {
    birth: birthInput,
    partner: partnerInput,
    target: targetInput,
  }[activeField];

  const inputFields = useMemo(() => {
    const fields: Array<{ id: InputField; label: string; value: string }> = [
      { id: "birth", label: "あなた", value: birthInput },
    ];

    if (selectedItem.needsPartner) {
      fields.push({ id: "partner", label: "ふたりめ", value: partnerInput });
    }

    if (selectedItem.needsTargetDate) {
      fields.push({ id: "target", label: "診断日", value: targetInput });
    }

    return fields;
  }, [birthInput, partnerInput, selectedItem.needsPartner, selectedItem.needsTargetDate, targetInput]);

  function press(type: "tap" | "start" | "ok" | "error" | "print" = "tap") {
    beep(soundOn, type);
  }

  function insertCoin() {
    press("start");
    setError("");
    setPrinted(false);
    setResult(null);
    setPhase("coin");

    if (coinTimerRef.current) {
      window.clearTimeout(coinTimerRef.current);
    }

    coinTimerRef.current = window.setTimeout(() => {
      setPhase("menu");
      coinTimerRef.current = null;
    }, 760);
  }

  function chooseMenu(menuId: MenuId) {
    const item = menuItems.find((menu) => menu.id === menuId) || menuItems[0];
    press("tap");
    setSelectedMenu(menuId);
    setActiveField("birth");
    setError("");
    setPrinted(false);
    setResult(null);
    setPhase("input");

    setTargetInput("");
  }

  function setActiveInputValue(nextValue: string) {
    if (activeField === "birth") setBirthInput(nextValue);
    if (activeField === "partner") setPartnerInput(nextValue);
    if (activeField === "target") setTargetInput(nextValue);
  }

  function pressKey(key: string) {
    press("tap");
    setError("");

    if (key === "clear") {
      setActiveInputValue("");
      return;
    }

    if (key === "back") {
      setActiveInputValue(activeInput.slice(0, -1));
      return;
    }

    if (activeInput.length < 8) {
      const nextValue = `${activeInput}${key}`;

      if (nextValue.length === 8 && !compactToDateValue(nextValue)) {
        press("error");
        setError("ソンザイ シナイ ヒヅケ デス");
        return;
      }

      setActiveInputValue(nextValue);
    }
  }

  function runDiagnosis() {
    const birthDate = compactToDateValue(birthInput);
    const partnerDate = compactToDateValue(partnerInput);
    const targetDate = selectedItem.needsTargetDate
      ? compactToDateValue(targetInput)
      : todayDateValue();

    if (!birthDate) {
      press("error");
      setActiveField("birth");
      setError("あなた の ヒヅケ ヲ カクニン");
      return;
    }

    if (selectedItem.needsPartner && !partnerDate) {
      press("error");
      setActiveField("partner");
      setError("ふたりめ ノ ヒヅケ ヲ カクニン");
      return;
    }

    if (!targetDate) {
      press("error");
      setActiveField("target");
      setError("シンダンビ ヲ カクニン");
      return;
    }

    if (daysBetween(birthDate, targetDate) < 0) {
      press("error");
      setActiveField("birth");
      setError("セイネンガッピ ガ ミライ デス");
      return;
    }

    if (selectedItem.needsPartner && partnerDate && daysBetween(partnerDate, targetDate) < 0) {
      press("error");
      setActiveField("partner");
      setError("ふたりめ ガ ミライ デス");
      return;
    }

    press("ok");
    setError("");
    setPrinted(false);
    setResult(null);
    setPhase("analyzing");

    if (analyzingTimerRef.current) {
      window.clearTimeout(analyzingTimerRef.current);
    }

    analyzingTimerRef.current = window.setTimeout(() => {
      const main = calculateRhythms(birthDate, targetDate);
      const partner = selectedItem.needsPartner && partnerDate
        ? calculateRhythms(partnerDate, targetDate)
        : null;
      const match = partner ? compatibility(main, partner) : null;
      const twoWeeks = Array.from({ length: 14 }, (_, index) => {
        const date = addDays(targetDate, index);
        return { date, values: calculateRhythms(birthDate, date) };
      });

      setResult({ main, partner, match, twoWeeks });
      setPhase("result");
      analyzingTimerRef.current = null;
    }, 900);
  }

  function printResult() {
    if (!result) return;
    press("print");
    setPrinted(true);
  }

  function reset() {
    press("tap");
    setError("");
    setPrinted(false);
    setResult(null);
    setSelectedMenu("today");
    setActiveField("birth");
    setBirthInput("");
    setPartnerInput("");
    setTargetInput("");
    setPhase("start");
  }

  useEffect(() => {
    return () => {
      if (analyzingTimerRef.current) {
        window.clearTimeout(analyzingTimerRef.current);
      }

      if (coinTimerRef.current) {
        window.clearTimeout(coinTimerRef.current);
      }
    };
  }, []);

  return (
    <section className={styles.page} aria-labelledby="biorhythm-title">
      <div className={styles.machine} onPointerDownCapture={() => unlock(soundOn)}>
        <div className={styles.titleBar}>
          <div>
            <h1 id="biorhythm-title">バイオリズムマシン</h1>
            <p>COMPUTER BIORHYTHM</p>
          </div>
          <button
            className={styles.soundButton}
            type="button"
            onClick={() => {
              const nextSoundOn = !soundOn;
              setSoundOn(nextSoundOn);
              beep(nextSoundOn, "start");
            }}
            aria-pressed={soundOn}
          >
            SOUND {soundOn ? "ON" : "OFF"}
          </button>
        </div>

        <div className={styles.accentRails} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <section className={styles.crt} aria-label="CRTモニター">
          <div className={styles.crtGlow}>
            <CrtContent
              activeField={activeField}
              error={error}
              inputFields={inputFields}
              phase={phase}
              result={result}
              selectedItem={selectedItem}
              selectedMenu={selectedMenu}
            />
          </div>
        </section>

        <section className={styles.controlDeck} aria-label="操作パネル">
          <div className={styles.statusRail} aria-hidden="true">
            <span />
            <b>{phase === "start" ? "INSERT 100 YEN" : phase === "coin" ? "COIN IN" : "READY"}</b>
            <i>{phase === "coin" ? "CREDIT 1" : "COIN / START"}</i>
          </div>
          <div className={styles.menuGrid} aria-label="診断メニュー">
            {menuItems.map((item) => (
              <button
                className={`${styles.panelButton} ${selectedMenu === item.id ? styles.activeButton : ""}`}
                disabled={!menuButtonsEnabled}
                key={item.id}
                type="button"
                onClick={() => {
                  if (menuButtonsEnabled) chooseMenu(item.id);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={styles.inputPanel} aria-label="テンキー入力エリア">
            {phase === "start" ? (
              <div className={styles.coinStartRow}>
                <button className={styles.coinButton} type="button" onClick={insertCoin}>
                  100円を入れる
                </button>
                <button className={styles.startButton} type="button" onClick={insertCoin}>
                  スタート
                </button>
              </div>
            ) : phase === "coin" ? (
              <p className={styles.controlHint}>CREDIT 1 / READY</p>
            ) : phase === "menu" ? (
              <p className={styles.controlHint}>メニュー ボタン ヲ オシテ クダサイ</p>
            ) : phase === "analyzing" ? (
              <p className={styles.controlHint}>ケイサン チュウ...</p>
            ) : (
              <>
                {phase === "input" ? (
                  <div className={styles.inputTabs}>
                    {inputFields.map((field) => (
                      <button
                        className={activeField === field.id ? styles.activeTab : ""}
                        key={field.id}
                        type="button"
                        onClick={() => {
                          press("tap");
                          setActiveField(field.id);
                        }}
                      >
                        {field.label}
                        <span>{compactDisplay(field.value)}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {phase === "input" ? (
                  <div className={styles.keypad}>
                    {keypadKeys.map((key) => (
                      <button
                        className={key === "clear" || key === "back" ? styles.utilityKey : ""}
                        key={key}
                        type="button"
                        onClick={() => pressKey(key)}
                      >
                        {key === "clear" ? "クリア" : key === "back" ? "戻る" : key}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className={styles.actionRow}>
                  {phase === "result" ? (
                    <>
                      <button className={styles.secondaryButton} type="button" onClick={reset}>
                        もう一度
                      </button>
                      <button className={styles.startButton} type="button" onClick={printResult}>
                        {printed ? "再プリント" : "プリント"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => {
                          press("tap");
                          setPhase("menu");
                        }}
                      >
                        メニュー
                      </button>
                      <button className={styles.startButton} type="button" onClick={runDiagnosis}>
                        決定
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        <div className={styles.printerBay}>
          <div className={styles.printerSlot} aria-hidden="true" />
          <section
            className={`${styles.printout} ${printed ? styles.printed : ""}`}
            aria-label="プリントアウト風の結果"
            aria-hidden={!printed}
          >
            {printed && result ? (
              <Printout item={selectedItem} result={result} selectedMenu={selectedMenu} />
            ) : null}
          </section>
        </div>

        <p className={styles.disclaimer}>
          診断結果は娯楽目的です。医療・健康判断には使用できません。
        </p>
        <Link className={styles.labLink} href="/">
          UFO Lab Tokyo Experiments
        </Link>
      </div>
    </section>
  );
}

function CrtContent({
  activeField,
  error,
  inputFields,
  phase,
  result,
  selectedItem,
  selectedMenu,
}: {
  activeField: InputField;
  error: string;
  inputFields: Array<{ id: InputField; label: string; value: string }>;
  phase: Phase;
  result: DiagnosisResult | null;
  selectedItem: MenuItem;
  selectedMenu: MenuId;
}) {
  if (error) {
    return (
      <div className={styles.crtMessage}>
        <p>ERROR</p>
        <p>{error}</p>
        <span className={styles.cursor} aria-hidden="true" />
      </div>
    );
  }

  if (phase === "start") {
    return (
      <div className={styles.startScreen}>
        <p className={styles.crtTitle}>バイオリズムマシン</p>
        <p className={styles.crtSubTitle}>COMPUTER BIORHYTHM</p>
        <p>100 YEN ヲ イレテ START</p>
        <DemoGraph />
        <div className={styles.crtLegend} aria-hidden="true">
          <span>P: BLUE</span>
          <span>E: RED</span>
          <span>I: YELLOW</span>
        </div>
        <p>テンキー デ セイネンガッピ ヲ ニュウリョク</p>
        <strong>PRESS START</strong>
      </div>
    );
  }

  if (phase === "coin") {
    return (
      <div className={styles.coinScreen}>
        <p>COIN IN</p>
        <strong>CREDIT 1</strong>
        <p>BIORHYTHM MACHINE READY</p>
      </div>
    );
  }

  if (phase === "menu") {
    return (
      <div className={styles.crtMessage}>
        <p>シンダン ヲ エランデ クダサイ</p>
        <p>センタク: {selectedItem.crtLabel}</p>
        <span className={styles.cursor} aria-hidden="true" />
      </div>
    );
  }

  if (phase === "input") {
    return (
      <div className={styles.inputScreen}>
        <p>{selectedItem.crtLabel}</p>
        <p>テンキー デ ニュウリョク</p>
        {inputFields.map((field) => (
          <div className={activeField === field.id ? styles.activeInputLine : ""} key={field.id}>
            <span>{field.label}</span>
            <strong>{compactDisplay(field.value)}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <div className={styles.crtMessage}>
        <p>データ ヲ ケイサン シテイマス</p>
        <p>ANALYZING...</p>
        <span className={styles.cursor} aria-hidden="true" />
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className={styles.resultScreen}>
      <p className={styles.crtSubTitle}>{selectedItem.crtLabel}</p>
      {result.match ? (
        <CrtCompatibility result={result.match} />
      ) : (
        <CrtRhythmResult result={result} selectedMenu={selectedMenu} />
      )}
      <p className={styles.crtNotice}>プリント ボタン デ ハッコウ</p>
    </div>
  );
}

function DemoGraph() {
  return (
    <svg
      className={styles.crtGraph}
      viewBox="-2 0 104 100"
      preserveAspectRatio="none"
      role="img"
      aria-label="バイオリズムのデモグラフ"
    >
      <line x1="0" y1="50" x2="100" y2="50" />
      <polyline className={styles.physicalLine} points={demoWaves[0]} />
      <polyline className={styles.emotionalLine} points={demoWaves[1]} />
      <polyline className={styles.intellectualLine} points={demoWaves[2]} />
    </svg>
  );
}

function CrtRhythmResult({ result, selectedMenu }: { result: DiagnosisResult; selectedMenu: MenuId }) {
  return (
    <>
      <div className={styles.crtMeters}>
        {rhythmKeys.map((key) => (
          <div key={key}>
            <span>{rhythmKana[key]}</span>
            <strong>{formatPercent(result.main[key])}</strong>
            <em>{levelText(result.main[key])}</em>
          </div>
        ))}
      </div>
      {selectedMenu === "twoWeeks" ? <GraphPanel days={result.twoWeeks} /> : null}
    </>
  );
}

function CrtCompatibility({
  result,
}: {
  result: { physical: number; emotional: number; intellectual: number; total: number };
}) {
  return (
    <div className={styles.crtCompatibility}>
      <strong>{result.total}</strong>
      <span>ソウゴウ アイショウ</span>
      <div>
        <p>シンタイ {result.physical}</p>
        <p>カンジョウ {result.emotional}</p>
        <p>チセイ {result.intellectual}</p>
      </div>
    </div>
  );
}

function GraphPanel({ days }: { days: Array<{ date: string; values: RhythmValues }> }) {
  const pointsFor = (key: RhythmKey) =>
    days
      .map((day, index) => {
        const x = (index / (days.length - 1)) * 100;
        const y = 50 - toPercent(day.values[key]) / 2;
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div className={styles.graphPanel} aria-label="2週間バイオリズムグラフ">
      <svg
        viewBox="-2 0 104 100"
        preserveAspectRatio="none"
        role="img"
        aria-label="身体、感情、知性の2週間推移"
      >
        <line x1="0" y1="50" x2="100" y2="50" />
        <polyline className={styles.physicalLine} points={pointsFor("physical")} />
        <polyline className={styles.emotionalLine} points={pointsFor("emotional")} />
        <polyline className={styles.intellectualLine} points={pointsFor("intellectual")} />
      </svg>
      <div className={styles.crtLegend} aria-hidden="true">
        <span>P: BLUE</span>
        <span>E: RED</span>
        <span>I: YELLOW</span>
      </div>
    </div>
  );
}

function Printout({
  item,
  result,
  selectedMenu,
}: {
  item: MenuItem;
  result: DiagnosisResult;
  selectedMenu: MenuId;
}) {
  const targetDate = result.twoWeeks[0]?.date || todayDateValue();

  return (
    <>
      <header>
        <strong>バイオリズム ケッカ</strong>
        <span>{displayDate(targetDate)}</span>
      </header>
      <p>シンダン: {item.crtLabel}</p>
      {result.match ? (
        <>
          <p>ソウゴウ アイショウ: {result.match.total}/100</p>
          <p>
            シンタイ {result.match.physical} / カンジョウ {result.match.emotional} / チセイ{" "}
            {result.match.intellectual}
          </p>
        </>
      ) : (
        rhythmKeys.map((key) => (
          <p key={key}>
            {rhythmKana[key]}: {formatPercent(result.main[key])} ({levelText(result.main[key])})
          </p>
        ))
      )}
      {selectedMenu === "twoWeeks" ? <p>2シュウカン グラフ ハ CRT ガメン ニ ヒョウジ</p> : null}
      <small>シンダン ケッカ ハ ゴラク モクテキ デス。イリョウ・ケンコウ ハンダン ニハ ツカエマセン。</small>
    </>
  );
}
