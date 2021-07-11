export const sleep = (sec: number = 1000): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, sec);
  });
};

export const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export function shuffle<T>(arr: Array<T>): Array<T> {
  let currentIndex = arr.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }

  return JSON.parse(JSON.stringify(arr));
}
