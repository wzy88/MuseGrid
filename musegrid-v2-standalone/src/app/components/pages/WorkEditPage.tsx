import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Check, Music2 } from 'lucide-react';
import { C, S, T } from '../../design/tokens';
import type { GeneratedWork } from '../../state/mockProject';
import workCoverRainNight from '../../../assets/work-cover-rain-night.jpg';

export function WorkEditPage({
  work,
  onCancel,
  onSave,
}: {
  work: GeneratedWork | null;
  onCancel: () => void;
  onSave: (title: string) => void;
}) {
  const [title, setTitle] = useState(work?.title ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(work?.title ?? '');
    setError('');
  }, [work]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) {
      setError('请输入歌曲名称');
      return;
    }
    onSave(nextTitle);
  }

  if (!work) {
    return (
      <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: C.bg0, padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <Music2 size={30} color={C.t3} style={{ marginBottom: 12 }} />
          <p style={{ ...T.heading, color: C.t0, marginBottom: 8 }}>没有找到要编辑的作品</p>
          <button onClick={onCancel} style={{ ...S.btnGhost, padding: '9px 16px', borderRadius: 8 }}>返回我的作品</button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="work-edit-page" style={{ height: '100%', overflowY: 'auto', background: 'radial-gradient(circle at 20% 0%, rgba(27,72,73,0.2), transparent 30%), #0A1018', padding: '20px 26px 36px' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <button onClick={onCancel} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: 0, background: 'none', border: 'none', color: C.t2, cursor: 'pointer', ...T.caption }}>
          <ArrowLeft size={14} />
          返回作品详情
        </button>

        <header style={{ marginTop: 24, marginBottom: 22 }}>
          <p style={{ ...T.label, color: '#8EF7B6', marginBottom: 8, textTransform: 'none' }}>作品信息</p>
          <h1 style={{ color: C.t0, fontSize: 34, lineHeight: 1.15, fontWeight: 700, marginBottom: 8 }}>编辑歌曲信息</h1>
          <p style={{ color: C.t2, fontSize: 13, lineHeight: 1.7 }}>修改后会同步更新作品列表、详情页和播放器中的歌曲名称。</p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: 22, alignItems: 'stretch' }}>
          <figure style={{ margin: 0, minHeight: 360, position: 'relative', overflow: 'hidden', borderRadius: 8, border: '1px solid rgba(255,255,255,0.11)', background: '#111923' }}>
            <img src={workCoverRainNight} alt={`${work.title}作品封面预览`} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, objectFit: 'cover', filter: 'saturate(0.86) contrast(1.08)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(5,10,16,0.92) 100%)' }} />
            <figcaption style={{ position: 'absolute', left: 18, right: 18, bottom: 18 }}>
              <p style={{ color: 'rgba(245,250,252,0.64)', fontSize: 11, marginBottom: 6 }}>封面预览</p>
              <p style={{ color: '#F7FBFC', fontSize: 22, lineHeight: 1.3, fontWeight: 700, textShadow: '0 2px 16px rgba(0,0,0,0.55)' }}>{title.trim() || '未命名歌曲'}</p>
            </figcaption>
          </figure>

          <form onSubmit={handleSubmit} style={{ minHeight: 360, display: 'flex', flexDirection: 'column', padding: 24, borderRadius: 8, background: 'rgba(19,27,39,0.88)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 56px rgba(0,0,0,0.22)' }}>
            <div>
              <label htmlFor="work-title" style={{ display: 'block', color: C.t1, fontSize: 13, fontWeight: 600, marginBottom: 9 }}>歌曲名称</label>
              <input
                id="work-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (error) setError('');
                }}
                autoFocus
                maxLength={60}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'work-title-error' : 'work-title-help'}
                style={{ width: '100%', height: 46, boxSizing: 'border-box', borderRadius: 8, border: error ? '1px solid rgba(248,113,113,0.72)' : '1px solid rgba(255,255,255,0.13)', background: 'rgba(5,10,16,0.58)', color: C.t0, fontSize: 15, padding: '0 13px', outline: 'none' }}
              />
              {error ? (
                <p id="work-title-error" style={{ color: '#F87171', fontSize: 12, marginTop: 8 }}>{error}</p>
              ) : (
                <p id="work-title-help" style={{ color: C.t3, fontSize: 11, marginTop: 8 }}>最多 60 个字符，保存时会自动去除首尾空格。</p>
              )}
            </div>

            <div style={{ marginTop: 26, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'grid', gridTemplateColumns: '86px 1fr', rowGap: 10, fontSize: 12 }}>
              <span style={{ color: C.t3 }}>作品状态</span>
              <span style={{ color: C.t1 }}>{work.status === 'done' ? '已完成' : work.status === 'active' ? '制作中' : '草稿'}</span>
              <span style={{ color: C.t3 }}>音乐风格</span>
              <span style={{ color: C.t1 }}>{work.tags.join(' · ')}</span>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={onCancel} style={{ ...S.btnGhost, minWidth: 82, padding: '9px 15px', borderRadius: 8 }}>取消</button>
              <button type="submit" style={{ ...S.btnPrimary, minWidth: 112, padding: '9px 16px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <Check size={14} />
                保存修改
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
