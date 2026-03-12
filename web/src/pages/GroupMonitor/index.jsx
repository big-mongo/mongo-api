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

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Typography,
  Select,
  Button,
  Spin,
  Tooltip,
  Tag,
} from '@douyinfe/semi-ui';
import { IconRefresh } from '@douyinfe/semi-icons';
import { CheckCircle } from 'lucide-react';
import { useGroupMonitorData } from '../../hooks/group-monitor/useGroupMonitorData';
import { timestamp2string } from '../../helpers';
import './index.css';

const { Title, Text } = Typography;

const HOURS_OPTIONS = [
  { value: 1, label: '最近1小时' },
  { value: 2, label: '最近2小时' },
  { value: 3, label: '最近3小时' },
];

const getStatusColor = (successRate) => {
  if (successRate < 0) return 'var(--semi-color-fill-0)';
  if (successRate >= 90) return 'var(--semi-color-success)';
  if (successRate >= 50) return 'var(--semi-color-warning)';
  return 'var(--semi-color-danger)';
};

const getStatusText = (successRate) => {
  if (successRate < 0) return '无数据';
  if (successRate >= 90) return '正常';
  if (successRate >= 50) return '警告';
  return '异常';
};

const TimeSlotBar = ({ slots }) => {
  return (
    <div className="time-slot-bar">
      {slots.map((slot, index) => (
        <Tooltip
          key={index}
          content={
            <div>
              <div>时间: {timestamp2string(slot.timestamp)}</div>
              <div>总请求: {slot.total_req}</div>
              <div>失败请求: {slot.failed_req}</div>
              <div>可用率: {slot.success_rate >= 0 ? slot.success_rate.toFixed(1) + '%' : 'N/A'}</div>
              <div>首字响应: {slot.first_latency >= 0 ? slot.first_latency + 'ms' : 'N/A'}</div>
            </div>
          }
        >
          <div
            className="time-slot-item"
            style={{
              backgroundColor: getStatusColor(slot.success_rate),
            }}
          />
        </Tooltip>
      ))}
    </div>
  );
};

const GroupCard = ({ group }) => {
  const { t } = useTranslation();
  const statusColor = getStatusColor(group.success_rate);
  const statusText = getStatusText(group.success_rate);

  return (
    <Card className="group-monitor-card" bodyStyle={{ padding: '20px' }}>
      <div className="group-header">
        <Title heading={4} style={{ margin: 0 }}>
          {group.group_name}
        </Title>
      </div>

      <div className="group-stats">
        <div className="stat-item">
          <div className="stat-icon" style={{ backgroundColor: statusColor + '20' }}>
            <CheckCircle style={{ color: statusColor }} size={24} />
          </div>
          <div className="stat-content">
            <Text type="tertiary" size="small">可用率</Text>
            <Text strong className="stat-value" style={{ color: statusColor }}>
              {group.success_rate.toFixed(1)}%
            </Text>
            <Text type="tertiary" size="small">最近{group.time_slots.length * 5}分钟</Text>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-content">
            <Text type="tertiary" size="small">总请求</Text>
            <Text strong className="stat-value">{group.total_req}</Text>
            <Text type="tertiary" size="small">最近{group.time_slots.length * 5}分钟</Text>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-content">
            <Text type="tertiary" size="small">失败请求</Text>
            <Text strong className="stat-value" style={{ color: group.failed_req > 0 ? 'var(--semi-color-danger)' : 'inherit' }}>
              {group.failed_req}
            </Text>
            <Text type="tertiary" size="small">最近{group.time_slots.length * 5}分钟</Text>
          </div>
        </div>

         <div className="stat-item">
           <div className="stat-content">
             <Text type="tertiary" size="small">响应时间</Text>
             <Text strong className="stat-value">{group.first_latency >= 0 ? group.first_latency + 'ms' : '-'}</Text>
             <Text type="tertiary" size="small">首字</Text>
           </div>
         </div>
      </div>

      <div className="time-slots-section">
        <div className="time-slots-header">
          <Text type="tertiary" size="small">
            {timestamp2string(group.time_slots[0]?.timestamp || Date.now() / 1000)} 前
          </Text>
          <Text type="tertiary" size="small">
            可用率: {group.success_rate.toFixed(1)}%
          </Text>
          <Text type="tertiary" size="small">现在</Text>
        </div>
        <TimeSlotBar slots={group.time_slots} />
      </div>

      <div className="group-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: 'var(--semi-color-success)' }} />
          <Text size="small">正常 ≥90%</Text>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: 'var(--semi-color-warning)' }} />
          <Text size="small">警告 50-90%</Text>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: 'var(--semi-color-danger)' }} />
          <Text size="small">异常 &lt;50%</Text>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: 'var(--semi-color-fill-0)' }} />
          <Text size="small">无数据</Text>
        </div>
      </div>
    </Card>
  );
};

const GroupMonitor = () => {
  const { t } = useTranslation();
  const { data, loading, hours, setHours, lastUpdate, refresh } = useGroupMonitorData();

  return (
    <div className="group-monitor-page">
      <div className="page-header">
        <div>
          <Title heading={2} style={{ margin: 0 }}>
            分组健康监控
          </Title>
          <Text type="tertiary" style={{ marginTop: 8, display: 'block' }}>
            监控所有分组的可用率和响应时间
          </Text>
        </div>
        <div className="header-actions">
          <Select
            value={hours}
            onChange={setHours}
            optionList={HOURS_OPTIONS}
            style={{ width: 120, marginRight: 12 }}
          />
          <Text type="tertiary" style={{ marginRight: 12 }}>
            最后更新: {lastUpdate ? lastUpdate.toLocaleTimeString() : '-'}
          </Text>
          <Button
            icon={<IconRefresh />}
            onClick={refresh}
            loading={loading}
          >
            刷新
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <div className="groups-grid">
          {data.map((group) => (
            <GroupCard key={group.group_name} group={group} />
          ))}
        </div>
      </Spin>
    </div>
  );
};

export default GroupMonitor;
