import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Quản lý hồ sơ'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom, #2563eb, #1d4ed8)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        Quản lý hồ sơ
      </div>
    ),
    {
      ...size,
    }
  )
} 