from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import uvicorn
from model import LocalModel
from db import SessionLocal, init_db, Conversation, Message
from typing import List

# Inicjalizacja
app = FastAPI(title="Local AI Chat")
model = LocalModel()  # ładuje model raz przy starcie
init_db()

class ChatRequest(BaseModel):
    messages: List[dict]  # [{role: "user"|'assistant'|'system', text: "..."}]
    max_tokens: int = 512

@app.post("/api/chat")
async def chat(req: ChatRequest):
    # prosty pipeline: 1) zapisz do DB 2) odpowiedz modelowo 3) zapisz odpowiedź
    try:
        db = SessionLocal()
        conv = Conversation()
        db.add(conv)
        db.commit()
        db.refresh(conv)
        # save messages
        for m in req.messages:
            db.add(Message(conversation_id=conv.id, role=m.get("role"), content=m.get("text")))
        db.commit()

        prompt = "\n".join([f"{m['role']}: {m['text']}" for m in req.messages])
        out = model.generate(prompt, max_tokens=req.max_tokens)

        # save assistant message
        db.add(Message(conversation_id=conv.id, role="assistant", content=out))
        db.commit()
        return {"text": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)