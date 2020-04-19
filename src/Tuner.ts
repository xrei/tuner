import { requestMedia, $, dispatchEvent } from './helpers'
import { getFrequency, getNoteMeta } from './Note'

type Analyser = {
  audioCtx: AudioContext,
  analyser: AnalyserNode,
  mic: MediaStreamAudioSourceNode,
  stream: MediaStream,
}

const fftSize = 16384
const sampleRate = 48000

let data = new Float32Array(fftSize / 2)
let isAudioSending = false

const processAudioData = (instance: Analyser) => (time: number) => {
  if (isAudioSending)
    requestAnimationFrame(processAudioData(instance))
  
  instance.analyser.getFloatFrequencyData(data)
  const freqs = data.map((v, k) => k * sampleRate / (fftSize))

  const freq = getFrequency(freqs, data)
  const noteMeta = getNoteMeta(freq)

  dispatchEvent('currentNote', noteMeta as CustomEventInit)

  // let el
  // if (!el) el = $('.frequency')

  // if (el) el.innerHTML = `
  // <span>${freq}</span><br><span>${noteMeta.name}</span>
  // <div>${noteMeta.octave}</div>
  // <div>${noteMeta.cents}</div>
  // `
}

type analyserParams = {
  sampleRate: number,
  fftSize: number,
}
const createAnalyser = ({ sampleRate = 48000, fftSize = 8192 }: analyserParams) =>
  (stream: MediaStream) => {
  if (stream) {
    const audioCtx = new AudioContext({ sampleRate })
    const analyser = new AnalyserNode(audioCtx, { fftSize, smoothingTimeConstant: 0 })

    const mic = audioCtx.createMediaStreamSource(stream)
    mic.connect(analyser)
    isAudioSending = true

    return Promise.resolve({ audioCtx, analyser, mic, stream })
  }
  throw Error('Couldn\'t create analyser')
}

const addVisibilityListener = () =>
  (instance: Analyser): Promise<Analyser> => {
    window.addEventListener('visibilitychange', onVisibilityChange(instance))
    return Promise.resolve(instance)
  }

export const startTuner = async () => {

  requestMedia()
    .then(createAnalyser({ sampleRate, fftSize }))
    .then(addVisibilityListener())
    .then(instance => requestAnimationFrame(processAudioData(instance)))
    .catch(err => {
      console.trace(err)
    })
}

function onVisibilityChange(instance: Analyser) {
  return () => {
    if (document.hidden) {
      isAudioSending = false
      if (instance.stream) {
        instance.stream.getAudioTracks().map(t => t.stop())
      }
    } else {
      isAudioSending = true
      startTuner()
    }
  }
}