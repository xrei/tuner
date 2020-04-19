export const requestMedia = (): Promise<MediaStream> =>
  navigator.mediaDevices
    ? navigator.mediaDevices.getUserMedia({ audio: true })
    : Promise.reject(Error("navigator.mediaDevices is undefined"))

export const $ = (selector: string) => document.querySelector(selector)

export const dispatchEvent = (name: string, detail?: CustomEventInit) => {
  return window.dispatchEvent(new CustomEvent(name, { detail }))
}

type CreateCanvas = {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
}

const getWindowDimensions = () => ({
  width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
  height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
})
export const setDimensions = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  const ratio = window.devicePixelRatio || 1

  canvas.width = getWindowDimensions().width * ratio
  canvas.height = getWindowDimensions().height * ratio
  canvas.style.width = getWindowDimensions().width + 'px'
  canvas.style.height = getWindowDimensions().height + 'px'
  ctx.scale(ratio, ratio)
}
export const createCanvas = (id: string): CreateCanvas => {
  const canvas = <HTMLCanvasElement>document.getElementById(id)
  if (!canvas) throw Error(`Canvas not found on ${id}`)

  const ctx = canvas.getContext('2d')

  if (ctx === null) {
    throw Error('Seems your browser doesn\'t support 2d context')
  }

  setDimensions(canvas, ctx)

  return { canvas, ctx }
}
