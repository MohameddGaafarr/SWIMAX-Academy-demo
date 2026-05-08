/**
 * Canonical session rows (coachId + trainees as id arrays).
 * Saturday 2026-05-09 includes a wide slot so “In the pool now” is likely during demos.
 */
export const demoSessions = [
  {
    _id: "session_demo_1",
    coachId: "coach_demo_1",
    trainees: ["trainee_demo_1", "trainee_demo_2", "trainee_demo_3"],
    schedule: [
      { day: "Saturday", startTime: "07:00", endTime: "22:00" },
      { day: "Wednesday", startTime: "17:00", endTime: "18:30" },
    ],
    createdAt: "2026-03-20T10:00:00.000Z",
  },
  {
    _id: "session_demo_2",
    coachId: "coach_demo_2",
    trainees: ["trainee_demo_4", "trainee_demo_5"],
    schedule: [
      { day: "Tuesday", startTime: "16:00", endTime: "17:30" },
      { day: "Thursday", startTime: "16:00", endTime: "17:30" },
    ],
    createdAt: "2026-03-21T11:30:00.000Z",
  },
  {
    _id: "session_demo_3",
    coachId: "coach_demo_3",
    trainees: ["trainee_demo_6"],
    schedule: [
      { day: "Monday", startTime: "18:00", endTime: "19:00" },
      { day: "Friday", startTime: "18:00", endTime: "19:30" },
    ],
    createdAt: "2026-03-22T09:45:00.000Z",
  },
];
