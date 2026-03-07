import { affirmations, lessons } from "../data/content";

const hashDay = (date: Date) => {
  const dayStamp = date.toISOString().slice(0, 10);
  return dayStamp.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

export const getDailyPair = (date = new Date()) => {
  const hash = hashDay(date);
  const affirmation = affirmations[hash % affirmations.length];
  const lesson = lessons.find((entry) => entry.id === affirmation.lessonId) ?? lessons[0];

  return { affirmation, lesson, dayKey: date.toISOString().slice(0, 10) };
};
