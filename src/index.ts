import { startTuner } from './Tuner'
import { startRender } from './Render'

const start = async (): Promise<void> => {
  startTuner()
  startRender()

  window.addEventListener('currentNote', e => {
    // console.log(e.detail)
  })
}

window.addEventListener('DOMContentLoaded', () => {
  start()
})

