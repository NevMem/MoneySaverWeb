function createDate() {
  const moment = new Date()
  return {
    year: moment.getFullYear(), 
    month: moment.getMonth() + 1, 
    day: moment.getDate(), 
    hour: moment.getHours(), 
    minute: moment.getMinutes(),
  }
}

export default { createDate }