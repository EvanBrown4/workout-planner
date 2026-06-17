import React, { useState } from "react";

import { BikeType, Stroke, WorkoutType } from "../../../api/src/workouts/workouts.schema"
import { useNavigate } from "react-router-dom";
import { createWorkout } from "../api/workouts";
import { parsePace } from "../utils/conversions";
import { Field } from "../components/Field";
import { Select } from "../components/Select";

const WORKOUT_TYPES: { id: WorkoutType; label: string; sub: string }[] = [
  { id: "running",  label: "Running",  sub: "Road, trail, track" },
  { id: "cycling",  label: "Cycling",  sub: "Road, MTB, indoor" },
  { id: "swimming", label: "Swimming", sub: "Pool or open water" },
];

export function CreateWorkout() {
  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Create Workout
        </h1>
        <p className="mt-2 text-gray-600">
          Plan your next training session.
        </p>
      </div>

      {workoutType === null ? (
        <WorkoutTypePicker onSelect={setWorkoutType} />
      ) : (
        <WorkoutForm
          type={workoutType}
          onBack={() => setWorkoutType(null)}
        />
      )}
    </section>
  );
}

function WorkoutTypePicker({
  onSelect,
}: {
  onSelect: (type: WorkoutType) => void;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {WORKOUT_TYPES.map(({ id, label, sub }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className="
            rounded-xl
            border
            border-gray-200
            bg-white
            p-5
            text-left
            shadow-sm
            transition
            hover:-translate-y-1
            hover:border-blue-500
            hover:shadow-md
          "
        >
          <p className="text-lg font-semibold text-gray-900">
            {label}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {sub}
          </p>
        </button>
      ))}
    </section>
  );
}

function WorkoutForm({
  type,
  onBack,
}: {
  type: WorkoutType;
  onBack: () => void;
}) {
  return (
    <section className="space-y-4">
      <button
        onClick={onBack}
        className="
          text-sm
          font-medium
          text-blue-600
          transition
          hover:text-blue-700
        "
      >
        ← Back to workout types
      </button>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {type === "running" && <RunningForm />}
        {type === "cycling" && <CyclingForm />}
        {type === "swimming" && <SwimmingForm />}
      </div>
    </section>
  );
}

// --- Type-specific forms ---

function RunningForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Run");
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const [scheduledDate, setScheduledDate] = useState(
    today.toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [pace, setPace] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.debug("[CreateWorkout] Submitting running workout", {
      title,
      scheduledDate,
    });
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        workout_type: "running",
        title,
        scheduled_date: scheduledDate || null,
        notes: notes || null,
        status: "planned",
        details: {
          target_distance_meters: distance
            ? Math.round(parseFloat(distance) * 1000)
            : null,
          target_duration_seconds: duration
            ? parseInt(duration) * 60
            : null,
          target_pace_sec_per_m: pace
            ? parsePace(pace)
            : null,
        },
        steps: [],
      } satisfies Parameters<typeof createWorkout>[0];

      console.debug("[CreateWorkout] Payload", payload);
      
      const workout = await createWorkout(payload);
      console.debug("[CreateWorkout] Workout created successfully");
      console.debug("[CreateWorkout] Navigating to `/workouts/${workout.data.id}`");
      navigate(`/workouts/${workout.data.id}`);
    } catch (err) {
      console.error("[CreateWorkout] Failed to create workout", err);
      setError(err instanceof Error ? err.message : "Failed to create workout");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field id="title" label="Title" type="text" placeholder="Morning run" value={title} onChange={setTitle} />
      <Field id="date" label="Date" type="date" placeholder="" value={scheduledDate} onChange={setScheduledDate} />
      <Field id="notes" label="Notes" type="text" placeholder="Optional notes" value={notes} onChange={setNotes} />
      <Field id="distance" label="Distance (km)" type="number" min={0} step={0.01} placeholder="5.0" value={distance} onChange={setDistance} />
      <Field id="duration" label="Duration (min)" type="number" min={0} step={1} placeholder="30" value={duration} onChange={setDuration} />
      <Field id="pace" label="Target pace (min/km)" type="text" placeholder="5:30" value={pace} onChange={setPace} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full
          rounded-lg
          bg-blue-600
          py-3
          font-medium
          text-white
          shadow-sm
          transition
          hover:bg-blue-700
          disabled:cursor-not-allowed
          disabled:bg-gray-400
        "
      >
        {isSubmitting ? "Saving..." : "Save Workout"}
      </button>
    </form>
  );
}

function CyclingForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Cycle");
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const [scheduledDate, setScheduledDate] = useState(
    today.toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [pace, setPace] = useState("");
  const [bikeType, setBikeType] = useState<BikeType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.debug("[CreateWorkout] Submitting cycling workout", {
      title,
      scheduledDate,
    });
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        workout_type: "cycling",
        title,
        scheduled_date: scheduledDate || null,
        notes: notes || null,
        status: "planned",
        details: {
          target_distance_meters: distance
            ? Math.round(parseFloat(distance) * 1000)
            : null,
          target_duration_seconds: duration
            ? parseInt(duration) * 60
            : null,
          target_pace_sec_per_m: pace
            ? parsePace(pace)
            : null,
          bike_type: bikeType
        },
        steps: [],
      } satisfies Parameters<typeof createWorkout>[0];

      console.debug("[CreateWorkout] Payload", payload);
      
      const workout = await createWorkout(payload);
      console.debug("[CreateWorkout] Workout created successfully");
      console.debug("[CreateWorkout] Navigating to `/workouts/${workout.data.id}`");
      navigate(`/workouts/${workout.data.id}`);
    } catch (err) {
      console.error("[CreateWorkout] Failed to create workout", err);
      setError(err instanceof Error ? err.message : "Failed to create workout");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field id="title" label="Title" type="text" placeholder="Morning run" value={title} onChange={setTitle} />
      <Field id="date" label="Date" type="date" placeholder="" value={scheduledDate} onChange={setScheduledDate} />
      <Field id="notes" label="Notes" type="text" placeholder="Optional notes" value={notes} onChange={setNotes} />
      <Field id="distance" label="Distance (km)" type="number" min={0} step={0.01} placeholder="5.0" value={distance} onChange={setDistance} />
      <Field id="duration" label="Duration (min)" type="number" min={0} step={1} placeholder="30" value={duration} onChange={setDuration} />
      <Field id="pace" label="Target pace (min/km)" type="text" placeholder="5:30" value={pace} onChange={setPace} />
      <Select id="bike_type" label="Bike type" value={bikeType} onChange={(val) => setBikeType(val as BikeType || null)}
        placeholder="Choose a bike type..."
        options={[
          { value: "road", label: "Road" },
          { value: "mountain", label: "Mountain" },
          { value: "indoor", label: "Indoor" },
          { value: "gravel", label: "Gravel" },
        ]}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full
          rounded-lg
          bg-blue-600
          py-3
          font-medium
          text-white
          shadow-sm
          transition
          hover:bg-blue-700
          disabled:cursor-not-allowed
          disabled:bg-gray-400
        "
      >
        {isSubmitting ? "Saving..." : "Save Workout"}
      </button>
    </form>
  );
}

function SwimmingForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Swim");
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const [scheduledDate, setScheduledDate] = useState(
    today.toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [pace, setPace] = useState("");
  const [poolLength, setPoolLength] = useState("");
  const [stroke, setStroke] = useState<Stroke | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.debug("[CreateWorkout] Submitting swimming workout", {
      title,
      scheduledDate,
    });
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        workout_type: "swimming",
        title,
        scheduled_date: scheduledDate || null,
        notes: notes || null,
        status: "planned",
        details: {
          target_distance_meters: distance
            ? Math.round(parseFloat(distance) * 1000)
            : null,
          target_duration_seconds: duration
            ? parseInt(duration) * 60
            : null,
          target_pace_sec_per_m: pace
            ? parsePace(pace)
            : null,
          pool_length_meters: poolLength ? parseInt(poolLength) : null,
          stroke: stroke,
        },
        steps: [],
      } satisfies Parameters<typeof createWorkout>[0];

      console.debug("[CreateWorkout] Payload", payload);
      const workout = await createWorkout(payload);
      console.debug("[CreateWorkout] Workout created successfully");
      console.debug("[CreateWorkout] Navigating to `/workouts/${workout.data.id}`");
      navigate(`/workouts/${workout.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workout");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field id="title" label="Title" type="text" placeholder="Morning run" value={title} onChange={setTitle} />
      <Field id="date" label="Date" type="date" placeholder="" value={scheduledDate} onChange={setScheduledDate} />
      <Field id="notes" label="Notes" type="text" placeholder="Optional notes" value={notes} onChange={setNotes} />
      <Field id="distance" label="Distance (m)" type="number" min={0} step={1} placeholder="5" value={distance} onChange={setDistance} />
      <Field id="duration" label="Duration (min)" type="number" min={0} step={1} placeholder="30" value={duration} onChange={setDuration} />
      <Field id="pace" label="Target pace (min/km)" type="text" placeholder="5:30" value={pace} onChange={setPace} />
      <Field id="pool_length" label="Pool Length (m)" type="number" min={1} step={1} placeholder="50" value={poolLength} onChange={setPoolLength}/>
      <Select id="stroke" label="Stroke" value={stroke} onChange={(val) => setStroke(val as Stroke || null)}
        placeholder="Choose a stroke..."
        options={[
          { value: "freestyle", label: "Freestyle" },
          { value: "backstroke", label: "Backstroke" },
          { value: "breaststroke", label: "Breaststroke" },
          { value: "butterfly", label: "Butterfly" },
          { value: "mixed", label: "Mixed"}
        ]}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full
          rounded-lg
          bg-blue-600
          py-3
          font-medium
          text-white
          shadow-sm
          transition
          hover:bg-blue-700
          disabled:cursor-not-allowed
          disabled:bg-gray-400
        "
      >
        {isSubmitting ? "Saving..." : "Save Workout"}
      </button>
    </form>
  );
}