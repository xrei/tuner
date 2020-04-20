import { notes } from './notes'

export type Note = {
  name: string,
  cents: number,
  octave: number,
  value: number,
  frequency: number,
}

const MIDDLE_A = 440
const A4_KEY = 69

const log2 = () => Math.log(2)

/**
 * A4 = 440
 * 
 * n = 12ln(frequency / A4) / ln(2) + 69
*/
const getNoteIndex = (freq: number): number =>
  12 * (Math.log(freq / MIDDLE_A) / log2()) + A4_KEY

/** 
 * A4 = 440
 * 
 * f(n) = 2^(n − 69) / 12 × A4
*/
const getNoteFrequency = (note: number) =>
  Math.pow(2, (note - A4_KEY) / 12) * MIDDLE_A

const getNoteAsString = (note: number) => notes[note % 12]

const getCents = (freq: number, note: number): number => Math.floor(
    (1200 * Math.log(freq / getNoteFrequency(note)) / log2() )
  )

const getOctave = (note: number): number => parseInt(String((note / 12) - 1))

export const getNoteMeta = (freq: number): Note => {
  const note = Math.round(getNoteIndex(freq))
  return {
    name: getNoteAsString(note),
    cents: getCents(freq, note),
    octave: getOctave(note),
    value: note,
    frequency: freq,
  }
}

export const getFrequency = (freqs: Float32Array, data: Float32Array) => {
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