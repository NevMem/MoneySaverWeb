const TOTAL_INFO = 'total info'
const DAY_SUM = 'day sum'

function dispatchTotalInfo(totalSpend, amountOfDays, average) {
    return { type: TOTAL_INFO, payload: { total: totalSpend, countOfDays: amountOfDays, average: average } }
}

function dispatchDaySum(daySum) {
    return { type: DAY_SUM, payload: { daySum: daySum } }
}

export default { TOTAL_INFO, DAY_SUM, dispatchTotalInfo, dispatchDaySum }