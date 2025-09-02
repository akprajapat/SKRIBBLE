import "./Timer.css";

export default function Timer({timeLeft}) {
  return (
    <div className="Timer">
      ⏳:<b>  {timeLeft} s</b>
    </div>
  );
}
