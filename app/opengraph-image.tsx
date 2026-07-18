import { ImageResponse } from 'next/og';

export const alt =
  'A Design Space for Representations of Deceased Companion Animals';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f7f5f0',
          color: '#252827',
          padding: 80,
        }}
      >
        <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#2f8c78' }} />
          <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#b18452' }} />
          <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#8a7ca8' }} />
        </div>
        <div style={{ fontSize: 58, fontWeight: 600, textAlign: 'center', lineHeight: 1.15 }}>
          A Design Space for Representations of Deceased Companion Animals
        </div>
        <div style={{ fontSize: 28, marginTop: 28, color: '#5c5955' }}>
          Nine dimensions · 5,184 possible pets · KIT Master&apos;s thesis
        </div>
      </div>
    ),
    size,
  );
}
