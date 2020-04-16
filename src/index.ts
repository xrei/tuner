import { startTuner } from './Tuner'

const start = async (): Promise<void> => {
  startTuner()

  window.addEventListener('currentNote', e => {
    // console.log(e.detail)
  })
}

window.addEventListener('DOMContentLoaded', () => {
  start()
})

