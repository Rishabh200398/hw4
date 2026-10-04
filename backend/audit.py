"""Append-only audit trail of agent-loop activity.

Each line of output/audit_trail.json is one JSON record (JSON Lines), so the file only
ever grows — we never rewrite earlier entries. Records capture, for each chat turn:
the time, each tool the agent called (with a short view of its args and result), and the
stop reason for the loop. This is a transparency/debugging log of what the agent did.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

AUDIT_PATH = Path(__file__).resolve().parent.parent / "output" / "audit_trail.json"


def _short(value, limit: int = 200) -> str:
    """A compact string view of args or a result, truncated for the log."""
    try:
        text = value if isinstance(value, str) else json.dumps(value, default=str)
    except (TypeError, ValueError):
        text = str(value)
    text = " ".join(text.split())  # collapse whitespace/newlines
    return text if len(text) <= limit else text[: limit - 1] + "…"


def _append(record: dict) -> None:
    record = {"time": datetime.now(timezone.utc).isoformat(timespec="seconds"), **record}
    try:
        AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
        with AUDIT_PATH.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except OSError:
        pass  # never let logging break a chat reply


def record_tool_call(run_id: str, tool: str, args, result) -> None:
    _append({"run_id": run_id, "event": "tool_call", "tool": tool, "args": _short(args), "result": _short(result)})


def record_stop(run_id: str, stop_reason: str) -> None:
    _append({"run_id": run_id, "event": "stop", "stop_reason": stop_reason})
