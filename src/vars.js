const VERSION = '1.0.0'

const TOTAL_INFO = 'total info'
const DAY_SUM = 'day sum'
const MONTHS_DESCRIPTION = 'months'

function dispatchTotalInfo(totalSpend, amountOfDays, average) {
    return { type: TOTAL_INFO, payload: { total: totalSpend, countOfDays: amountOfDays, average: average } }
}

function dispatchDaySum(daySum) {
    return { type: DAY_SUM, payload: { daySum: daySum } }
}

function dispatchMonths(months) {
    return { type: MONTHS_DESCRIPTION, payload: { monthSum: months } }
}

export default { VERSION, TOTAL_INFO,
    DAY_SUM, dispatchTotalInfo,
    dispatchDaySum, MONTHS_DESCRIPTION,
    dispatchMonths }