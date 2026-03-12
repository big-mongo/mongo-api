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

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { API, showError } from '../../helpers';

export const useGroupMonitorData = (enabled = true) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState(1);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await API.get(`/api/group/monitor?hours=${hours}`);
      const { success, message, data: responseData } = res.data;
      if (success) {
        setData(responseData || []);
        setLastUpdate(new Date());
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }, [enabled, hours]);

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setLastUpdate(null);
      setLoading(false);
      return;
    }

    fetchData();
  }, [enabled, fetchData]);

  const refresh = () => {
    if (!enabled) return;
    fetchData();
  };

  return {
    data,
    loading,
    hours,
    setHours,
    lastUpdate,
    refresh,
    t,
  };
};
