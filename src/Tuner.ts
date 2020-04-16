import { requestMedia, $, dispatchEvent } from './helpers'
import { notes } from './notes'

type Note = {
  name: string,
  cents: number,
  octave: number,
  value: number,
  frequency: number,
}

type Analyser = {
  audioCtx: AudioContext,
  analyser: AnalyserNode,
  mic: MediaStreamAudioSourceNode,
  stream: MediaStream,
}

const MIDDLE_A = 440
const A4_KEY = 69

let isAudioSending = false


const log2 = () => Math.log(2)

/**
 * A4 = 440
 * 
 * n = 12ln(frequency / A4) / ln(2) + 69
*/
const getNoteIndex = (freq: number): number => 12 * (Math.log(freq / MIDDLE_A) / log2()) + A4_KEY

/** 
 * A4 = 440
 * 
 * f(n) = 2^(n − 69) / 12 × A4
*/
const getNoteFrequency = (note: number) => Math.pow(2, (note - A4_KEY) / 12) * MIDDLE_A

const getNoteAsString = (note: number) => notes[note % 12]

const getCents = (freq: number, note: number): number => Math.floor(
    (1200 * Math.log(freq / getNoteFrequency(note)) / log2() )
  )

const getOctave = (note: number): number => parseInt(String(note / 12)) - 1

const getNoteMeta = (freq: number): Note => {
  const note = Math.round(getNoteIndex(freq))
  return {
    name: getNoteAsString(note),
    cents: getCents(freq, note),
    octave: getOctave(note),
    value: note,
    frequency: freq,
  }
}

const getFrequency = ({ analyser, audioCtx }: Analyser) => {
  const data = new Float32Array(analyser.frequencyBinCount)
  analyser.getFloatFrequencyData(data)
  const freqs = data.map((v, k) => k * audioCtx.sampleRate / (analyser.frequencyBinCount * 2))

  let lastGain = -Infinity
  let lastFreq = -1

  data.forEach((gain, idx) => {
    if (gain > lastGain) {
      lastGain = gain
      lastFreq = freqs[idx]
    }
  })
  return lastFreq
}

const processAudioData = (analyser: Analyser) => (time: number) => {
  if (isAudioSending)
    requestAnimationFrame(processAudioData(analyser))

  const freq = getFrequency(analyser)
  const noteMeta = getNoteMeta(freq)

  dispatchEvent('currentNote', noteMeta as CustomEventInit)

  let el
  if (!el) el = $('.frequency')

  if (el) el.innerHTML = `
  <span>${freq}</span><br><span>${noteMeta.name}</span>
  <div>${noteMeta.octave}</div>
  <div>${noteMeta.cents}</div>
  `
}

type analyserParams = {
  sampleRate: number,
  fftSize: number,
}
const createAnalyser = ({ sampleRate = 48000, fftSize = 8129 }: analyserParams) =>
  (stream: MediaStream) => {
  if (stream) {
    const audioCtx = new AudioContext({ sampleRate })
    const analyser = new AnalyserNode(audioCtx, { fftSize, smoothingTimeConstant: 0 })

    const mic = audioCtx.createMediaStreamSource(stream)
    mic.connect(analyser)

    return Promise.resolve({ audioCtx, analyser, mic, stream })
  }
  throw Error('Couldn\'t create analyser')
}

const addVisibilityListener = (analyser: Analyser): Promise<Analyser> => {
  isAudioSending = true
  window.addEventListener('visibilitychange', onVisibilityChange(analyser.stream))
  return Promise.resolve(analyser)
}

export const startTuner = async () => {
  const fftSize = 16384
  const sampleRate = 48000

  requestMedia()
    .then(createAnalyser({ sampleRate, fftSize }))
    .then(addVisibilityListener)
    .then((analyser) => requestAnimationFrame(processAudioData(analyser)))
    .catch(err => {
      console.trace(err)
    })
}

function onVisibilityChange(stream: MediaStream) {
  return () => {
    if (document.hidden) {
      isAudioSending = false
      if (stream) {
        stream.getAudioTracks().map(t => t.stop())
      }
    } else {
      startTuner()
    }
  }
}