import { createCanvas, setDimensions } from './helpers'
import type {Note} from './Note'

const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, note: Note) => {
  const drawTextWithCtx = drawText(ctx)

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawTextWithCtx({
    text: 'Note',
    x: 30,
    y: 50,
    fsize: '28',
    color: '#999'
  })
  drawTextWithCtx({
    text: (note.name + note.octave) || '',
    x: 30,
    y: 105,
    fsize: '48',
    color: '#212121',
    bold: true
  })
}

export const startRender = () => {
  const { canvas, ctx } = createCanvas('canvas')

  

  window.addEventListener('currentNote', (e: Event) => {
    const note: Note = (<CustomEvent>e).detail
    // console.log(note)
    draw(ctx, canvas, note)
  })

  const resizeCanvas = () => {
    setDimensions(canvas, ctx)
    // draw(ctx)
  }
  window.addEventListener('resize', resizeCanvas)
}

type TextParams = {
  text: string,
  x: number,
  y: number,
  fsize?: string,
  fface?: string,
  color?: string,
  bold?: boolean,
}
function drawText(ctx: CanvasRenderingContext2D, canvas?: HTMLCanvasElement) {
  return ({ text, x, y, fsize, fface, color, bold }: TextParams) => {
    ctx.save()
    ctx.font = (bold ? 'bold ' : '') + (fsize||16) +'px '+ (fface || 'Helvetica')
    ctx.textAlign = 'start'
    ctx.textBaseline = 'bottom'
    
    if (color) ctx.fillStyle = color
    ctx.fillText(text, x, y)
    ctx.restore()
  }
}