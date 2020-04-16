export const requestMedia = (): Promise<MediaStream> =>
  navigator.mediaDevices
    ? navigator.mediaDevices.getUserMedia({ audio: true })
    : Promise.reject(Error("navigator.mediaDevices is undefined"))

// export const requestMedia = (): Promise<MediaStream> => new Promise((resolve, reject) => {
//   if (navigator.mediaDevices) {
//     navigator.mediaDevices.getUserMedia({audio: true})
//       .then(resolve).catch(reject)
//   } else reject(new Error('navigator.mediaDevices is not defined'))
// })

export const $ = (selector: string) => document.querySelector(selector)

export const dispatchEvent = (name: string, detail?: CustomEventInit) => {
  return window.dispatchEvent(new CustomEvent(name, { detail }))
}
