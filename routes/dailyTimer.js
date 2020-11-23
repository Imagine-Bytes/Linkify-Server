const dailyTimer = () => {
  setInterval(() => {
    getTime();
  }, 1000);

  const getTime = () => {
    const timeFormat = { hour: "numeric", minute: "numeric" , second:"numeric"};
    const time = new Date().toLocaleTimeString([], timeFormat);
    if (time == "12:00:00 AM") {
      dailyClicks = 0;
      return;
    }
  };
};

module.exports = dailyTimer;
