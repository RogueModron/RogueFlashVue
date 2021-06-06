export default class Planner {
  static #passedDaysMax = 10000;

  static #passedDaysMin = 0;

  static #millsInADay = 24 * 60 * 60 * 1000;

  static #values = [
    { daysBase: 0.00, daysMultiplier: 0.00 },
    { daysBase: 1.00, daysMultiplier: 1.10 },
    { daysBase: 3.00, daysMultiplier: 1.10 },
    { daysBase: 7.00, daysMultiplier: 1.20 },
    { daysBase: 12.00, daysMultiplier: 1.30 },
  ];

  static planNext(value, valueDate, previousDate) {
    let passedDays = 0;
    if (previousDate) {
      const timeDiff = (valueDate.getTime() - previousDate.getTime());
      passedDays = Math.round(timeDiff / Planner.#millsInADay);
    }

    if (!Planner.#fnCheckPassedDaysLimits(passedDays)) {
      throw new Error(`Invalid value for passedDays: ${passedDays}.`);
    }

    const nextDays = Planner.#fnCalculateNextDays(value, passedDays);
    const nextDate = new Date(valueDate.getTime()
      + (nextDays * Planner.#millsInADay));

    const plannerResult = {
      nextDate,
      daysNext: nextDays,
      passedDays,
    };
    return plannerResult;
  }

  static #fnCalculateNextDays = function fnCalculateNextDays(value, passedDays) {
    if (value === 0) {
      return 0;
    }

    const reviewValue = Planner.#values[value];

    const daysNext = Math.floor(passedDays * reviewValue.daysMultiplier
      + reviewValue.daysBase);
    return Math.round(daysNext);
  }

  static #fnCheckPassedDaysLimits = function fnCheckPassedDaysLimits(passedDays) {
    return Planner.#passedDaysMin <= passedDays
      && passedDays <= Planner.#passedDaysMax;
  }
}
