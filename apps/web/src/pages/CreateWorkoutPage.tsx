import React, { useState } from "react";

type WorkoutType = "running" | "cycling" | "swimming" | "strength";

const WORKOUT_TYPES: { id: WorkoutType; label: string; sub: string }[] = [
  { id: "running",  label: "Running",  sub: "Road, trail, track" },
  { id: "cycling",  label: "Cycling",  sub: "Road, MTB, indoor" },
  { id: "swimming", label: "Swimming", sub: "Pool or open water" },
  { id: "strength", label: "Strength", sub: "Weights & resistance" },
];

export function CreateWorkout() {
  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);

  return (
    <section>
      <h1>Create A Workout</h1>
      {workoutType === null ? (
        <WorkoutTypePicker onSelect={setWorkoutType} />
      ) : (
        <WorkoutForm
          type={workoutType}
          onBack={() => setWorkoutType(null)}
        />
      )}
    </section>
  )
}

function WorkoutTypePicker({
  onSelect,
}: {
  onSelect: (type: WorkoutType) => void;
}) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {WORKOUT_TYPES.map(({ id, label, sub }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className="rounded-xl border p-4 text-left hover:bg-gray-50 transition">
            <p className="block text-sm font-medium">{label}</p>
            <p className="block text-xs text-gray-500 mt-1">{sub}</p>
          </button>
      ))}
    </section>
  )
}

function WorkoutForm({
  type,
  onBack,
}: {
  type: WorkoutType;
  onBack: () => void;
}) {
  return (
    <section>
      <button onClick={onBack} className="mb-4 text-sm text-gray-500 hover:text-gray-800">
        ← All Types
      </button>
      {type === "running" && <RunningForm/>}
      {type === "cycling" && <CyclingForm/>}
      {type === "swimming" && <SwimmingForm/>}
      {type === "strength" && <StrengthForm/>}
    </section>
  );
}

// --- Type-specific forms ---

function RunningForm() {
  return (
    <form className="space-y-4">
      <Field id="distance" label="Distance (km)" type="number" placeholder="5.0" />
      <Field id="duration" label="Duration (min)" type="number" placeholder="30" />
      <Field id="pace" label="Target pace (min/km)" type="text" placeholder="5:30" />
      <button type="submit" className="w-full rounded-md border p-2 text-sm">Save workout</button>
    </form>
  );
}

function CyclingForm() {
  return (
    <form className="space-y-4">
      <Field id="distance" label="Distance (km)" type="number" placeholder="40" />
      <Field id="elevation" label="Elevation gain (m)" type="number" placeholder="500" />
      <button type="submit" className="w-full rounded-md border p-2 text-sm">Save workout</button>
    </form>
  );
}

function SwimmingForm() {
  return (
    <form className="space-y-4">
      <Field id="distance" label="Distance (m)" type="number" placeholder="100" />
      <button type="submit" className="w-full rounded-md border p-2 text-sm">Save workout</button>
    </form>
  );
}

function StrengthForm() {
  return (
    <form className="space-y-4">
      <Field id="time" label="Time (m)" type="number" placeholder="460" />
      <button type="submit" className="w-full rounded-md border p-2 text-sm">Save workout</button>
    </form>
  );
}

/** Reusable labeled input field. */
function Field({
  id,
  label,
  type,
  placeholder,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <section>
      <label htmlFor={id} className="block text-sm text-gray-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        className="w-full p-2 border rounded-md outline-none text-sm transition duration-150 ease-in-out"
      />
    </section>
  );
}