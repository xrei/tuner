import { createCanvas, setDimensions } from './helpers'
import type {Note} from './Note'

const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, note: Note) => {
  const drawTextWithCtx = drawText(ctx)

  ctx.clearRect(30, 50, 120, 50)

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

const drawStaticMeter = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const mrg = 50
  const mapYcoords = ((v: number, i: number) => i < 5 ? w - mrg * (i+1) : i === 5 ? w : w + mrg * (i - 5))
  const posYs = [...Array(11).keys()].map(mapYcoords).sort((a,b) => a - b)
  
  ctx.save()
  ctx.beginPath()
  posYs.forEach((val, index) => {
    let lh = 25

    ctx.lineWidth = 1
    ctx.strokeStyle = '#212121'
    ctx.beginPath()
    index === 0 && drawText(ctx)({
      text: '-50', x: val - 14, y: h + 30,
    })

    index === posYs.length - 1 && drawText(ctx)({
      text: '+50', x: val - 17, y: h + 30,
    })

    if (index === 5) {
      lh = 60
      drawText(ctx)({
        text: '0', x: val - 4, y: h + 30,
      })
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = '#42a5f5'
      ctx.stroke()
      ctx.closePath()
    }
    ctx.moveTo(val, h)
    ctx.lineTo(val, h - lh)
    ctx.stroke()
  })
  ctx.closePath()

  ctx.restore()
}

const drawOffsetLine = (ctx: CanvasRenderingContext2D, off: number = 0, w: number, h: number) => {
  const offset = (off * 50) / 10
  if (isNaN(offset)) return
  // console.log(offset)
  ctx.beginPath()
  ctx.moveTo((w + offset), h)
  ctx.lineTo((w + offset), h - 100)
  ctx.stroke()
  ctx.closePath()
}

export const startRender = () => {
  const { canvas, ctx } = createCanvas('canvas')
  const ratio = window.devicePixelRatio || 1
  const w2 = Number(parseInt(String(canvas.width / (2 * ratio))))
  const h2 = Number(parseInt(String(canvas.height / (2 * ratio))))

  
  window.addEventListener('currentNote', (e: Event) => {
    const note: Note = (<CustomEvent>e).detail
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    draw(ctx, canvas, note)
    drawOffsetLine(ctx, note.cents, w2, h2)
    drawStaticMeter(ctx, w2, h2)
  })

  const resizeCanvas = () => {
    ctx.clearRect(w2, h2, w2, h2)
    setDimensions(canvas, ctx)
    drawStaticMeter(ctx, w2, h2)
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