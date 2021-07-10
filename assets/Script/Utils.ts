export default {
  sleep(sec: number = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, sec);
    });
  },
};
