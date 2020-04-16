export const requestMedia = (): Promise<MediaStream> =>
  navigator.mediaDevices
    ? navigator.mediaDevices.getUserMedia({ audio: true })
    : Promise.reject(Error("navigator.mediaDevices is undefined"))

export const $ = (selector: string) => document.querySelector(selector)

export const dispatchEvent = (name: string, detail?: CustomEventInit) => {
  return window.dispatchEvent(new CustomEvent(name, { detail }))
}
