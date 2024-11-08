export function generateStorageKey(file: File) {
  const ext = file.name.split('.').pop()
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `uploads/${timestamp}-${randomString}.${ext}`
}
