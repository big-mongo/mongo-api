/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useState } from 'react';
import { Toast } from '@douyinfe/semi-ui';
import { IconCopy } from '@douyinfe/semi-icons';
import TokensTable from '../../components/table/tokens';

const BaseUrlBanner = () => {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const sites = [
    { flag: '🇨🇳', label: '国内站点', url: 'https://frogapi.cn', desc: '国内加速 · 低延迟', color: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e22, #fb923c18)' },
    { flag: '🌍', label: '国外站点', url: 'https://api.frog.cn', desc: '全球节点 · 高可用', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f622, #8b5cf618)' },
  ];

  const handleCopy = (url, idx) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedIdx(idx);
      Toast.success({ content: `已复制：${url}`, duration: 2 });
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  return (
    <>
      <style>{`
        .baseurl-banner {
          position: relative;
          border-radius: 16px;
          margin-bottom: 16px;
          padding: 20px 24px;
          background: var(--semi-color-bg-1, #fff);
          border: 1px solid var(--semi-color-border, #e5e7eb);
          overflow: hidden;
        }
        .baseurl-banner::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #f43f5e, #fb923c, #3b82f6, #8b5cf6);
        }
        .baseurl-banner__header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .baseurl-banner__icon {
          width: 32px; height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          color: #fff;
          flex-shrink: 0;
        }
        .baseurl-banner__title {
          font-size: 15px;
          font-weight: 700;
          color: var(--semi-color-text-0, #1e293b);
          letter-spacing: -0.01em;
        }
        .baseurl-banner__subtitle {
          font-size: 12px;
          color: var(--semi-color-text-2, #94a3b8);
          font-weight: 400;
        }
        .baseurl-banner__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 640px) {
          .baseurl-banner__grid { grid-template-columns: 1fr; }
        }
        .baseurl-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 12px;
          cursor: pointer;
          user-select: none;
          border: 1px solid var(--semi-color-border, #e5e7eb);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .baseurl-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -8px rgba(0,0,0,0.1);
        }
        .baseurl-card:active {
          transform: translateY(0) scale(0.99);
        }
        .baseurl-card__flag {
          font-size: 28px;
          line-height: 1;
        }
        .baseurl-card__info {
          flex: 1;
          min-width: 0;
        }
        .baseurl-card__label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }
        .baseurl-card__url {
          font-size: 14px;
          font-weight: 600;
          font-family: "Fira Code", "JetBrains Mono", ui-monospace, monospace;
          color: var(--semi-color-text-0, #1e293b);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .baseurl-card__desc {
          font-size: 11px;
          color: var(--semi-color-text-2, #94a3b8);
          margin-top: 2px;
        }
        .baseurl-card__copy {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          color: var(--semi-color-text-2, #64748b);
          background: var(--semi-color-fill-0, #f1f5f9);
        }
        .baseurl-card:hover .baseurl-card__copy {
          color: #fff;
        }
        .baseurl-card__copy--copied {
          color: #fff !important;
          background: #10b981 !important;
        }
      `}</style>
      <div className='baseurl-banner'>
        <div className='baseurl-banner__header'>
          <div className='baseurl-banner__icon'>⚡</div>
          <div>
            <div className='baseurl-banner__title'>API Base URL</div>
            <div className='baseurl-banner__subtitle'>点击卡片复制接入地址</div>
          </div>
        </div>
        <div className='baseurl-banner__grid'>
          {sites.map((site, idx) => (
            <div
              key={site.url}
              className='baseurl-card'
              style={{ background: site.gradient }}
              onClick={() => handleCopy(site.url, idx)}
            >
              <div className='baseurl-card__flag'>{site.flag}</div>
              <div className='baseurl-card__info'>
                <div className='baseurl-card__label' style={{ color: site.color }}>{site.label}</div>
                <div className='baseurl-card__url'>{site.url}</div>
                <div className='baseurl-card__desc'>{site.desc}</div>
              </div>
              <div
                className={`baseurl-card__copy ${copiedIdx === idx ? 'baseurl-card__copy--copied' : ''}`}
                style={copiedIdx !== idx ? {} : {}}
                onMouseOver={(e) => { if (copiedIdx !== idx) e.currentTarget.style.background = site.color; }}
                onMouseOut={(e) => { if (copiedIdx !== idx) { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; } }}
              >
                {copiedIdx === idx ? '✓ 已复制' : <><IconCopy size='small' /> 复制</>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const Token = () => {
  return (
    <div className='mt-[60px] px-2'>
      <BaseUrlBanner />
      <TokensTable />
    </div>
  );
};

export default Token;
