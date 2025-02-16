from pydantic_ai.messages import ModelMessage
from typing import List

def log_messages(agent_name: str, messages: List[ModelMessage]) -> None:
    """Log messages from an agent run in a readable format"""
    print(f"=== {agent_name} Messages ===")
    for msg in messages:
        if msg.kind == "request":
            for part in msg.parts:
                if part.part_kind == "system-prompt":
                    print(f"[Request] {part.part_kind}: {part.content}")
                elif part.part_kind == "user-prompt":
                    print(f"[Request] {part.part_kind}: {part.content}")
                elif part.part_kind == "tool-call":
                    print(f"[Request] {part.part_kind}: {part.tool_name} - {part.arguments}")
                else:
                    print(f"[Request] {part.part_kind}: {str(part)}")
        elif msg.kind == "response":
            for part in msg.parts:
                if hasattr(part, 'content'):
                    print(f"[Response] {part.part_kind}: {part.content}")
                elif part.part_kind == "tool-return":
                    print(f"[Response] {part.part_kind}: {part.tool_name} - {part.return_value}")
                else:
                    print(f"[Response] {part.part_kind}: {str(part)}")
    print("=== End Messages ===") 