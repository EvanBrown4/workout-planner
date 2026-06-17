import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { WorkoutWithDetails } from "../../../api/src/workouts/workouts.schema";
import { getWorkout } from "../api/workouts";
import * as conversions from "../utils/conversions";

export function WorkoutInfo() {
  const { id } = useParams();
  const [workout, setWorkout] = useState<WorkoutWithDetails | null>(null);
  const distanceType = "km";
  useEffect(() => {
    if (!id) return;

    getWorkout(id).then((response) => {
      setWorkout(response.data); 
    });
  }, [id]);

  if (!workout) {
    return (
      <section> Loading workout details...</section>
    )
  }



  return (
    <section className="flex flex-col gap-6 p-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{workout.title}</h1>
        <p className="text-sm text-gray-500">{workout.workout_type}</p>
      </section>
      <section className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
        <section className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
          <span className="text-4xl font-extrabold text-gray-900">
            {workout.details.target_distance_meters !== null ? conversions.metersToDistance(workout.details.target_distance_meters, distanceType) : "--"}
          </span>
          <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Distance ({distanceType})
          </span>
        </section>
        <section className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
          <span className="text-4xl font-extrabold text-gray-900">
            {workout.details.target_duration_seconds !== null ? conversions.secondsToTime(workout.details.target_duration_seconds) : "--"}
          </span>
          <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Time
          </span>
        </section>
      </section>
      <h1 className="justify-center">Steps</h1>
      <section className="flex flex-col gap-3 items-center justify-center p-4 bg-gray-50 rounded-lg">
        {workout.steps.map((step) => (
          <section key={step.id}>
            <p className="font-bold uppercase text-sm">{step.step_order}. {step.step_type}</p>
            <p>{step.end_condition_value} {step.end_condition === "time" ? `${step.end_condition_value!} seconds` : step.end_condition === "distance" ? `${conversions.metersToDistance(step.end_condition_value!, distanceType)} ${distanceType}` : "Until lap press"}</p>
            {step.notes && <p>{step.notes}</p>}
          </section>
        ))}
      </section>
    </section>
  )
}