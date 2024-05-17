// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer } = require('electron')

ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
  console.log(sourceId)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        //@ts-ignore
        mandatory: {
          chromeMediaSource: 'desktop',
        }
        }
    })
    handleStream(stream)
  } catch (e) {
    console.log(e)
  }
})

const handleStream = (stream: MediaStream) => {
  const video = document.querySelector('video')
  video.srcObject = stream
  video.onloadedmetadata = (e) => video.play()
}