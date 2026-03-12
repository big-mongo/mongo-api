package controller

import (
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/ratio_setting"

	"github.com/gin-gonic/gin"
)

const groupMonitorCacheExpiration = 1 * time.Minute

type GroupMonitorTimeSlot struct {
	Timestamp    int64   `json:"timestamp"`
	TotalReq     int     `json:"total_req"`
	FailedReq    int     `json:"failed_req"`
	SuccessRate  float64 `json:"success_rate"`
	FirstLatency int     `json:"first_latency"`
}

type GroupMonitorData struct {
	GroupName    string                 `json:"group_name"`
	TotalReq     int                    `json:"total_req"`
	FailedReq    int                    `json:"failed_req"`
	SuccessRate  float64                `json:"success_rate"`
	FirstLatency int                    `json:"first_latency"`
	TimeSlots    []GroupMonitorTimeSlot `json:"time_slots"`
}

func getGroupMonitorCacheKey(hours int) string {
	return fmt.Sprintf("group_monitor:%d", hours)
}

func getGroupMonitorData(hours int) ([]GroupMonitorData, error) {
	cacheKey := getGroupMonitorCacheKey(hours)

	if common.RedisEnabled {
		cachedData, err := common.RedisGet(cacheKey)
		if err == nil && cachedData != "" {
			var result []GroupMonitorData
			if err := common.Unmarshal([]byte(cachedData), &result); err == nil {
				return result, nil
			}
		}
	}

	result, err := computeGroupMonitorData(hours)
	if err != nil {
		return nil, err
	}

	if common.RedisEnabled {
		if dataBytes, err := common.Marshal(result); err == nil {
			_ = common.RedisSet(cacheKey, string(dataBytes), groupMonitorCacheExpiration)
		}
	}

	return result, nil
}

type slotAggResult struct {
	GroupName    string `gorm:"column:group_name"`
	SlotStart    int64  `gorm:"column:slot_start"`
	TotalReq     int64  `gorm:"column:total_req"`
	FailedReq    int64  `gorm:"column:failed_req"`
	FirstLatency int64  `gorm:"column:first_latency"`
}

func computeGroupMonitorData(hours int) ([]GroupMonitorData, error) {
	groups := ratio_setting.GetGroupRatioCopy()

	now := time.Now()
	startTime := now.Add(-time.Duration(hours) * time.Hour).Unix()
	endTime := now.Unix()

	slotDuration := int64(5 * 60)
	numSlots := hours * 12

	groupNames := make([]string, 0, len(groups))
	for name := range groups {
		groupNames = append(groupNames, name)
	}

	slotDataMap := make(map[string]map[int64]*slotAggResult)

	sql := `
		WITH raw_slots AS (
			SELECT
				` + model.LogGroupCol + `,
				FLOOR((created_at - ?) / ?) as slot_idx,
				type,
				use_time
			FROM logs
			WHERE created_at >= ? AND created_at < ?
				AND ` + model.LogGroupCol + ` IN ?
				AND type IN (?, ?)
		)
		SELECT
			` + model.LogGroupCol + ` as group_name,
			CAST((slot_idx * ? + ?) AS BIGINT) as slot_start,
			SUM(CASE WHEN type = ? THEN 1 ELSE 0 END) as total_req,
			SUM(CASE WHEN type = ? THEN 1 ELSE 0 END) as failed_req,
			MIN(CASE WHEN type = ? THEN use_time ELSE NULL END) as first_latency
		FROM raw_slots
		GROUP BY ` + model.LogGroupCol + `, slot_idx
	`

	var aggResults []slotAggResult
	err := model.LOG_DB.Raw(sql,
		startTime, slotDuration,
		startTime, endTime, groupNames,
		model.LogTypeConsume, model.LogTypeError,
		slotDuration, startTime,
		model.LogTypeConsume, model.LogTypeError, model.LogTypeConsume,
	).Scan(&aggResults).Error

	if err != nil {
		return nil, err
	}

	for i := range aggResults {
		res := &aggResults[i]
		if _, ok := slotDataMap[res.GroupName]; !ok {
			slotDataMap[res.GroupName] = make(map[int64]*slotAggResult)
		}
		slotDataMap[res.GroupName][res.SlotStart] = res
	}

	result := make([]GroupMonitorData, 0, len(groups))

	for groupName := range groups {
		groupData := GroupMonitorData{
			GroupName: groupName,
			TimeSlots: make([]GroupMonitorTimeSlot, 0, numSlots),
		}

		totalTotalReq := 0
		totalFailedReq := 0
		minFirstLatency := int64(-1)

		groupSlotMap := slotDataMap[groupName]

		for i := 0; i < numSlots; i++ {
			slotStart := startTime + int64(i)*slotDuration

			slot := GroupMonitorTimeSlot{
				Timestamp:   slotStart,
				SuccessRate: -1,
			}

			if agg, ok := groupSlotMap[slotStart]; ok {
				slot.TotalReq = int(agg.TotalReq)
				slot.FailedReq = int(agg.FailedReq)
				slot.FirstLatency = int(agg.FirstLatency)

				totalCount := agg.TotalReq
				failedCount := agg.FailedReq
				if totalCount+failedCount > 0 {
					slot.SuccessRate = float64(totalCount) / float64(totalCount+failedCount) * 100
				}

				totalTotalReq += slot.TotalReq
				totalFailedReq += slot.FailedReq
				if agg.FirstLatency > 0 && (minFirstLatency < 0 || agg.FirstLatency < minFirstLatency) {
					minFirstLatency = agg.FirstLatency
				}
			}

			groupData.TimeSlots = append(groupData.TimeSlots, slot)
		}

		groupData.TotalReq = totalTotalReq
		groupData.FailedReq = totalFailedReq
		if totalTotalReq+totalFailedReq > 0 {
			groupData.SuccessRate = float64(totalTotalReq) / float64(totalTotalReq+totalFailedReq) * 100
		} else {
			groupData.SuccessRate = 100
		}
		groupData.FirstLatency = int(minFirstLatency)

		result = append(result, groupData)
	}

	sort.Slice(result, func(i, j int) bool {
		if result[i].SuccessRate != result[j].SuccessRate {
			return result[i].SuccessRate > result[j].SuccessRate
		}
		return result[i].FirstLatency < result[j].FirstLatency
	})

	return result, nil
}

func GetGroupMonitor(c *gin.Context) {
	hours := common.String2Int(c.Query("hours"))
	if hours != 1 && hours != 2 && hours != 3 {
		hours = 1
	}

	result, err := getGroupMonitorData(hours)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get group monitor data",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    result,
	})
}
