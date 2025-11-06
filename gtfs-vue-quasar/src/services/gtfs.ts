export type WorkerOut = {
  fileName: string
  stops: any[]
  routes: any[]
  trips: any[]
  stopTimes: any[]
}

async function postToWorker(arrayBuffer: ArrayBuffer, fileName: string): Promise<WorkerOut> {
  const WorkerCtor = (await import('../workers/gtfsWorker.ts?worker')).default as {
    new (): Worker
  }
  const worker = new WorkerCtor()
  return new Promise<WorkerOut>((resolve, reject) => {
    const onMessage = (e: MessageEvent<any>) => {
      const data = e.data
      if (data?.error) {
        cleanup()
        reject(new Error(data.error))
      } else {
        cleanup()
        resolve(data as WorkerOut)
      }
    }
    const cleanup = () => {
      worker.removeEventListener('message', onMessage as any)
      worker.terminate()
    }
    worker.addEventListener('message', onMessage as any)
    // Transfer the ArrayBuffer to avoid copying large payloads in memory
    worker.postMessage({ buffer: arrayBuffer, fileName }, [arrayBuffer as any])
  })
}

export async function loadGtfsFromFile(file: File): Promise<WorkerOut> {
  const arrayBuffer = await file.arrayBuffer()
  return postToWorker(arrayBuffer, file.name)
}

export async function loadGtfsFromUrl(url: string): Promise<WorkerOut> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao baixar ZIP: ${res.status} ${res.statusText}`)
  const arrayBuffer = await res.arrayBuffer()
  const fileName = url.split('/').pop() || 'dataset.zip'
  return postToWorker(arrayBuffer, fileName)
}
