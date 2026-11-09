import {
  CloudIcon,
  DropletIcon,
  MoonIcon,
  SparkIcon,
  SunIcon,
  WindIcon,
} from "./icons";

/**
 * Glifo de condición reutilizable en tiras, gráficas y listas.
 */
export default function ConditionGlyph({
  condition = "clouds",
  daypart = "day",
  className = "h-6 w-6",
}) {
  if (condition === "clear") {
    return daypart === "night" ? (
      <MoonIcon className={className} />
    ) : (
      <SunIcon className={className} />
    );
  }

  if (condition === "rain") {
    return <DropletIcon className={className} />;
  }

  if (condition === "storm") {
    return <SparkIcon className={className} />;
  }

  if (condition === "snow") {
    return <SparkIcon className={className} />;
  }

  if (condition === "mist") {
    return <WindIcon className={className} />;
  }

  return <CloudIcon className={className} />;
}
